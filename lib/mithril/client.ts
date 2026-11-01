import { mithrilAuthedFetch, mithrilFetch } from './api';
import type { MithrilOpQuery, MithrilOpSuccess } from './openapi';
import { mithrilQueryString } from './openapi';
import type {
  AdminAppUpdatePolicySaveRequest,
  AdminCleanerListResponse,
  AdminPayoutsListResponse,
  AdminReportsDays,
  AdminReportsSummaryResponse,
  AdminReviewFilter,
  AdminReviewsListResponse,
  AdminServiceUpdateRequest,
  AdminTeamListResponse,
  AuthMethodsResponse,
  MithrilSession,
  MithrilUser,
} from './types';
import { MithrilApiError } from './errors';
import { clearStoredTokens, readStoredTokens, writeStoredTokens } from './session-store';

export function isStaffUser(user: MithrilUser | null | undefined) {
  return Boolean(user?.admin || user?.reviewer);
}

export function isAdminUser(user: MithrilUser | null | undefined) {
  return Boolean(user?.admin);
}

export async function fetchAuthMethods() {
  return mithrilFetch<AuthMethodsResponse>('/auth/methods');
}

export async function loginWithPassword(email: string, password: string) {
  return mithrilFetch<MithrilSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
}

export async function requestPhoneOtp(phone: string) {
  return mithrilFetch<{ ok: true }>('/auth/otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function verifyPhoneOtp(phone: string, code: string) {
  return mithrilFetch<MithrilSession>('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
}

export async function refreshSession(refreshToken: string) {
  return mithrilFetch<MithrilSession>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function logoutRemote(refreshToken: string | null) {
  if (!refreshToken) return;
  try {
    await mithrilFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    // Local session still clears if revoke fails.
  }
}

export async function fetchMe(accessToken: string) {
  const response = await mithrilAuthedFetch<{ user: MithrilUser }>(accessToken, '/auth/me');
  return response.user;
}

export async function persistSession(session: MithrilSession) {
  await writeStoredTokens(session.access_token, session.refresh_token);
}

export async function restoreSession(): Promise<{ user: MithrilUser; accessToken: string } | null> {
  const { accessToken, refreshToken } = await readStoredTokens();
  if (!accessToken && !refreshToken) return null;

  let token = accessToken;
  if (!token && refreshToken) {
    const refreshed = await refreshSession(refreshToken);
    await persistSession(refreshed);
    token = refreshed.access_token;
  }
  if (!token) return null;

  try {
    const user = await fetchMe(token);
    if (!isStaffUser(user)) {
      await clearStoredTokens();
      return null;
    }
    return { user, accessToken: token };
  } catch (error) {
    if (error instanceof MithrilApiError && error.status === 401 && refreshToken) {
      const refreshed = await refreshSession(refreshToken);
      await persistSession(refreshed);
      const user = await fetchMe(refreshed.access_token);
      if (!isStaffUser(user)) {
        await clearStoredTokens();
        return null;
      }
      return { user, accessToken: refreshed.access_token };
    }
    await clearStoredTokens();
    return null;
  }
}

export async function mithrilAdminRequest<T>(accessToken: string, path: string, init: RequestInit = {}) {
  return mithrilAuthedFetch<T>(accessToken, path, init);
}

export async function listAdminBookings(
  accessToken: string,
  query?: MithrilOpQuery<'direct.listAdminBookings'>,
) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.listAdminBookings'>>(
    accessToken,
    `/direct/admin/bookings${mithrilQueryString(query)}`,
  );
}

export async function listAdminLiveJobs(accessToken: string) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.listAdminLiveJobs'>>(
    accessToken,
    '/direct/admin/live-jobs',
  );
}

export async function listAdminServiceRequests(accessToken: string) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.listAdminServiceRequests'>>(
    accessToken,
    '/direct/admin/service-requests',
  );
}

export async function listAdminWhatsAppThreads(accessToken: string) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.listAdminWhatsAppThreads'>>(
    accessToken,
    '/direct/admin/whatsapp/threads',
  );
}

export async function getAdminDispatchMap(
  accessToken: string,
  query?: MithrilOpQuery<'direct.getAdminDispatchMap'>,
) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.getAdminDispatchMap'>>(
    accessToken,
    `/direct/admin/dispatch-map${mithrilQueryString(query)}`,
  );
}

export async function listAdminCleaners(accessToken: string, query?: MithrilOpQuery<'direct.listAdminCleaners'>) {
  return mithrilAdminRequest<AdminCleanerListResponse>(
    accessToken,
    `/direct/admin/cleaners${mithrilQueryString(query)}`,
  );
}

export async function listAdminCleanerApplications(accessToken: string, query?: { status?: string }) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.listAdminCleanerApplications'>>(
    accessToken,
    `/direct/admin/cleaner-applications${mithrilQueryString(query)}`,
  );
}

export async function listAdminAppUpdatePolicies(accessToken: string) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.listAdminAppUpdatePolicies'>>(
    accessToken,
    '/direct/admin/app-update-policy',
  );
}

export async function saveAdminAppUpdatePolicy(
  accessToken: string,
  body: AdminAppUpdatePolicySaveRequest,
) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.saveAdminAppUpdatePolicy'>>(
    accessToken,
    '/direct/admin/app-update-policy',
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function listAdminServices(accessToken: string) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.listAdminServices'>>(
    accessToken,
    '/direct/admin/services',
  );
}

export async function getAdminService(accessToken: string, serviceId: number | string) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.getAdminService'>>(
    accessToken,
    `/direct/admin/services/${serviceId}`,
  );
}

export async function updateAdminService(
  accessToken: string,
  serviceId: number | string,
  body: AdminServiceUpdateRequest,
) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.updateAdminService'>>(
    accessToken,
    `/direct/admin/services/${serviceId}`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

export async function listAdminPromotionCodes(accessToken: string) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.listAdminPromotionCodes'>>(
    accessToken,
    '/direct/admin/promotion-codes',
  );
}

export async function getAdminReportsSummary(accessToken: string, days: AdminReportsDays = 30) {
  return mithrilAdminRequest<AdminReportsSummaryResponse>(
    accessToken,
    `/direct/admin/reports/summary${mithrilQueryString({ days })}`,
  );
}

export async function listAdminServiceAreas(accessToken: string) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.listAdminServiceAreas'>>(
    accessToken,
    '/direct/admin/service-areas',
  );
}

export async function listAdminPayouts(accessToken: string, status?: string) {
  return mithrilAdminRequest<AdminPayoutsListResponse>(
    accessToken,
    `/direct/admin/payouts${mithrilQueryString(status ? { status } : undefined)}`,
  );
}

export async function listAdminReviews(accessToken: string, filter: AdminReviewFilter = 'all') {
  const query: MithrilOpQuery<'direct.listAdminReviews'> | undefined =
    filter === 'all' ? undefined : { filter };
  return mithrilAdminRequest<AdminReviewsListResponse>(
    accessToken,
    `/direct/admin/reviews${mithrilQueryString(query)}`,
  );
}

export async function listAdminTeam(accessToken: string) {
  return mithrilAdminRequest<AdminTeamListResponse>(accessToken, '/direct/admin/team');
}

export async function listAdminCustomers(accessToken: string, search?: string) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.listAdminCustomers'>>(
    accessToken,
    `/direct/admin/customers${mithrilQueryString(search ? { q: search } : undefined)}`,
  );
}

export async function listAdminCustomerTrust(accessToken: string) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.listAdminCustomerTrust'>>(
    accessToken,
    '/direct/admin/customer-trust',
  );
}

export async function listAdminCleanerHealth(accessToken: string) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.listAdminCleanerHealth'>>(
    accessToken,
    '/direct/admin/cleaner-health',
  );
}

export async function listAdminPlacements(accessToken: string) {
  return mithrilAdminRequest<MithrilOpSuccess<'direct.listAdminPlacements'>>(
    accessToken,
    '/direct/admin/placements',
  );
}

export async function signOutSession() {
  const { refreshToken } = await readStoredTokens();
  await logoutRemote(refreshToken);
  await clearStoredTokens();
}
