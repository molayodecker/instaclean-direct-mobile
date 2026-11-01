import type { SeverityLevel } from '@sentry/react-native';
import { isSentryEnabled, sentryDsn } from './config';
import { Sentry } from './init';

export type ReportErrorContext = {
  screen?: string;
  action?: string;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
  level?: SeverityLevel;
  fingerprint?: string[];
};

function formatUnknownError(error: unknown): string {
  if (error instanceof Error) return error.message || error.name;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/** Capture an exception in Sentry when DSN is configured. */
export function reportError(error: unknown, context?: ReportErrorContext): void {
  if (!isSentryEnabled() || !sentryDsn()) return;
  const err = error instanceof Error ? error : new Error(formatUnknownError(error));

  Sentry.withScope((scope) => {
    if (context?.level) scope.setLevel(context.level);
    if (context?.screen) scope.setTag('screen', context.screen);
    if (context?.action) scope.setTag('action', context.action);
    if (context?.tags) {
      for (const [key, value] of Object.entries(context.tags)) {
        scope.setTag(key, value);
      }
    }
    if (context?.extra) {
      scope.setContext('extra', context.extra);
    }
    if (context?.fingerprint?.length) {
      scope.setFingerprint(context.fingerprint);
    }
    scope.captureException(err);
  });
}

export function addBreadcrumb(
  message: string,
  options?: { category?: string; level?: SeverityLevel; data?: Record<string, unknown> },
): void {
  if (!isSentryEnabled()) return;
  Sentry.addBreadcrumb({
    category: options?.category ?? 'app',
    message,
    level: options?.level ?? 'info',
    data: options?.data,
  });
}
