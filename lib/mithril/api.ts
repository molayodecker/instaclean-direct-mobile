import { mithrilApiBaseUrl, MITHRIL_OTP_TIMEOUT_MS, MITHRIL_REQUEST_TIMEOUT_MS } from './config';
import { MithrilApiError, MithrilTransportError } from './errors';

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
  return mithrilFetch<T>(path, {
    ...init,
    headers: {
      authorization: `Bearer ${accessToken}`,
      ...(init.headers || {}),
    },
  });
}

export function mithrilOtpFetch<T>(path: string, init: RequestInit = {}) {
  return mithrilFetch<T>(path, init, MITHRIL_OTP_TIMEOUT_MS);
}
