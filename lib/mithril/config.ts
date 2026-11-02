/** Mithril hosts (see mithril/docs/deployment/fly.md). */
export const MITHRIL_API_URLS = {
  staging: 'https://instaclean-mithril-staging.fly.dev',
  production: 'https://api.tryinstaclean.com',
  /** Local Phoenix (`mix phx.server`); use your LAN IP on a physical device. */
  local: 'http://localhost:4000',
} as const;

export type MithrilApiEnvironment = 'staging' | 'production' | 'local' | 'dev' | 'custom';

/**
 * API base URL for all Mithril requests.
 * Set `EXPO_PUBLIC_MITHRIL_API_URL` in `.env` (local) or EAS build `env`.
 * When unset, defaults to **staging** so local runs never hit production silently.
 */
export function mithrilApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_MITHRIL_API_URL?.trim();
  const base = (fromEnv || MITHRIL_API_URLS.staging).replace(/\/$/, '');
  return base;
}

/** Human-readable environment for Settings (from `EXPO_PUBLIC_MITHRIL_ENV` or URL). */
export function mithrilApiEnvironment(): MithrilApiEnvironment {
  const explicit = process.env.EXPO_PUBLIC_MITHRIL_ENV?.trim().toLowerCase();
  if (explicit === 'staging' || explicit === 'production' || explicit === 'local' || explicit === 'dev') {
    return explicit;
  }

  const url = mithrilApiBaseUrl();
  if (url === MITHRIL_API_URLS.production) return 'production';
  if (url === MITHRIL_API_URLS.staging) return 'staging';
  if (url.includes('localhost') || url.includes('127.0.0.1')) return 'local';
  if (url.includes('dev.tryinstaclean.com')) return 'dev';
  return 'custom';
}

export const MITHRIL_REQUEST_TIMEOUT_MS = 15_000;
export const MITHRIL_OTP_TIMEOUT_MS = 25_000;
