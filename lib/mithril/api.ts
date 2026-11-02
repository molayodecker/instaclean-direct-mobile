import { mithrilApiBaseUrl, MITHRIL_OTP_TIMEOUT_MS, MITHRIL_REQUEST_TIMEOUT_MS } from './config';
import { MithrilApiError, MithrilTransportError } from './errors';
import { clearStoredTokens, readStoredTokens, writeStoredTokens } from './session-store';

type SessionListener = (accessToken: string | null) => void;
let sessionListener: SessionListener | null = null;
let refreshInFlight: Promise<string> | null = null;

export function setSessionListener(listener: SessionListener | null) {
  sessionListener = listener;
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const { refreshToken } = await readStoredTokens();
      if (!refreshToken) throw new MithrilApiError(401, 'session_expired');
      try {
        const session = await mithrilFetch<{ access_token: string; refresh_token: string }>(
          '/auth/refresh',
          { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) },
        );
        await writeStoredTokens(session.access_token, session.refresh_token);
        sessionListener?.(session.access_token);
        return session.access_token;
      } catch (error) {
        if (error instanceof MithrilApiError && [401, 403].includes(error.status)) {
          await clearStoredTokens();
          sessionListener?.(null);
        }
        throw error;
      }
    })().finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}


export async function mithrilFetch<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs = MITHRIL_REQUEST_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${mithrilApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        ...(init.headers || {}),
      },
      signal: init.signal ?? controller.signal,
    });
  } catch {
    throw new MithrilTransportError();
  } finally {
    clearTimeout(timeout);
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await response.json()) as Record<string, unknown>;
  } catch {
    if (!response.ok) throw new MithrilTransportError();
  }

  if (!response.ok) {
    const code = typeof body.error === 'string' ? body.error : `http_${response.status}`;
    const details = typeof body.message === 'string' ? body.message.trim() : undefined;
    throw new MithrilApiError(response.status, code, details || undefined);
  }

  return body as T;
}

export async function mithrilAuthedFetch<T>(
  accessToken: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const { accessToken: storedToken } = await readStoredTokens();
  const token = storedToken || accessToken;
  const request = (currentToken: string) => mithrilFetch<T>(path, {
    ...init,
    headers: {
      ...(init.headers || {}),
      authorization: `Bearer ${currentToken}`,
    },
  });
  try {
    return await request(token);
  } catch (error) {
    if (!(error instanceof MithrilApiError) || error.status !== 401) throw error;
    // Another request may already have rotated the token; otherwise refresh once.
    const { accessToken: latest } = await readStoredTokens();
    const nextToken = latest && latest !== token ? latest : await refreshAccessToken();
    return request(nextToken);
  }
}

export function mithrilOtpFetch<T>(path: string, init: RequestInit = {}) {
  return mithrilFetch<T>(path, init, MITHRIL_OTP_TIMEOUT_MS);
}
