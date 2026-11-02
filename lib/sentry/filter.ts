import { MithrilApiError } from '@/lib/mithril/errors';

/** Avoid noise from expected 4xx responses in admin UI. */
export function shouldReportErrorToSentry(error: unknown): boolean {
  if (error instanceof MithrilApiError) {
    return error.status >= 500;
  }
  return true;
}
