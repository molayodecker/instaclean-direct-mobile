/** Public DSN from Sentry project settings (Client Keys). */
export function sentryDsn(): string | undefined {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
  return dsn || undefined;
}

export function isSentryEnabled(): boolean {
  return Boolean(sentryDsn());
}
