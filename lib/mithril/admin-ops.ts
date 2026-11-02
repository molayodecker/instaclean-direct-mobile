import { mithrilAuthedFetch } from './api';
import type { MithrilOpBody, MithrilOpSuccess } from './openapi';
import { mithrilQueryString } from './openapi';
import type {
  AdminAssignBookingCleanerRequest,
  AdminAssignServiceRequestRequest,
  AdminBooking,
  AdminCancelBookingRequest,
  AdminCleanerApplicationDetail,
  AdminCleanerApprovalResponse,
  AdminCleanerHealthActionRequest,
  AdminCleanerHealthCaseDetail,
  AdminCustomerTrustActionRequest,
  AdminCustomerTrustDetail,
  AdminCustomerTrustNoteRequest,
  AdminMatchRequest,
  AdminMatchResponse,
  AdminOpsMutationResponse,
  AdminRescheduleBookingRequest,
  AdminUpdateBookingStatusRequest,
  AdminUpdateServiceRequestRequest,
  AdminWhatsAppMessageListResponse,
  AdminWhatsAppMutationResponse,
  AdminWhatsAppSendRequest,
  AdminAssistedBookingRequest,
  AdminAssistedBookingResponse,
  AdminJobInvoice,
  AdminJobInvoiceSendRequest,
  AdminJobInvoiceSendResponse,
  AdminJobInvoiceUpsertRequest,
  AdminCashPayoutRequest,
  AdminCashPayoutResponse,
  AdminBookingNotifyResponse,
  AdminResetExclusiveHoldRequest,
  AdminTeamGrantRequest,
  AdminTeamMember,
  AdminTeamRevokeRequest,
  AdminAccountMergeRequest,
  AdminAccountMergeResponse,
  AdminNotificationDeliveryListResponse,
  AdminNotificationTarget,
  AdminNotificationTargetListResponse,
  AdminNotificationSendRequest,
  AdminNotificationSendResponse,
  AdminNotificationBroadcastRequest,
  AdminNotificationBroadcastResponse,
  BookingCleanersResponse,
} from './types';

function adminFetch<T>(accessToken: string, path: string, init: RequestInit = {}) {
  return mithrilAuthedFetch<T>(accessToken, path, init);
}

export async function getAdminBooking(accessToken: string, bookingId: string) {
  return adminFetch<MithrilOpSuccess<'direct.showAdminBooking'>>(
    accessToken,
    `/direct/admin/bookings/${encodeURIComponent(bookingId)}`,
  );
}

export async function listBookingCleaners(accessToken: string, serviceId: number) {
  return mithrilAuthedFetch<BookingCleanersResponse>(
    accessToken,
    `/direct/booking-cleaners${mithrilQueryString({ serviceId })}`,
  );
}

export async function assignAdminBookingCleaner(
  accessToken: string,
  bookingId: string,
  body: AdminAssignBookingCleanerRequest,
) {
  return adminFetch<AdminBooking>(
    accessToken,
    `/direct/admin/bookings/${encodeURIComponent(bookingId)}/assign`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function updateAdminBookingStatus(
  accessToken: string,
  bookingId: string,
  body: AdminUpdateBookingStatusRequest,
) {
  return adminFetch<AdminBooking>(
    accessToken,
    `/direct/admin/bookings/${encodeURIComponent(bookingId)}/status`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function cancelAdminBooking(
  accessToken: string,
  bookingId: string,
  body: AdminCancelBookingRequest = {},
) {
  return adminFetch<MithrilOpSuccess<'direct.cancelAdminBooking'>>(
    accessToken,
    `/direct/admin/bookings/${encodeURIComponent(bookingId)}/cancel`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function rescheduleAdminBooking(
  accessToken: string,
  bookingId: string,
  body: AdminRescheduleBookingRequest,
) {
  return adminFetch<AdminBooking>(
    accessToken,
    `/direct/admin/bookings/${encodeURIComponent(bookingId)}/reschedule`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function assignAdminServiceRequest(
  accessToken: string,
  requestId: string,
  body: AdminAssignServiceRequestRequest,
) {
  return adminFetch<MithrilOpSuccess<'direct.assignAdminServiceRequest'>>(
    accessToken,
    `/direct/admin/service-requests/${encodeURIComponent(requestId)}/assign`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function updateAdminServiceRequest(
  accessToken: string,
  requestId: string,
  body: AdminUpdateServiceRequestRequest,
) {
  return adminFetch<MithrilOpSuccess<'direct.updateAdminServiceRequest'>>(
    accessToken,
    `/direct/admin/service-requests/${encodeURIComponent(requestId)}/status`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function listAdminWhatsAppMessages(accessToken: string, phoneE164: string) {
  return adminFetch<AdminWhatsAppMessageListResponse>(
    accessToken,
    `/direct/admin/whatsapp/messages${mithrilQueryString({ phone: phoneE164 })}`,
  );
}

export async function sendAdminWhatsAppMessage(accessToken: string, body: AdminWhatsAppSendRequest) {
  return adminFetch<AdminWhatsAppMutationResponse>(accessToken, '/direct/admin/whatsapp/send', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function listAdminCandidates(accessToken: string) {
  return adminFetch<MithrilOpSuccess<'direct.listAdminCandidates'>>(
    accessToken,
    '/direct/admin/candidates',
  );
}

export async function matchAdminPlacementCandidate(
  accessToken: string,
  placementId: string,
  body: AdminMatchRequest,
) {
  return adminFetch<AdminMatchResponse>(
    accessToken,
    `/direct/admin/placements/${encodeURIComponent(placementId)}/matches`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function getAdminCleanerApplication(accessToken: string, applicationId: string) {
  return adminFetch<MithrilOpSuccess<'direct.showAdminCleanerApplication'>>(
    accessToken,
    `/direct/admin/cleaner-applications/${encodeURIComponent(applicationId)}`,
  );
}

export async function approveAdminCleanerApplication(accessToken: string, applicationId: string) {
  return adminFetch<AdminCleanerApprovalResponse>(
    accessToken,
    `/direct/admin/cleaner-applications/${encodeURIComponent(applicationId)}/approve`,
    { method: 'POST' },
  );
}

export async function getAdminCustomerTrust(accessToken: string, customerId: string) {
  return adminFetch<MithrilOpSuccess<'direct.showAdminCustomerTrust'>>(
    accessToken,
    `/direct/admin/customer-trust/${encodeURIComponent(customerId)}`,
  );
}

export async function addAdminCustomerTrustNote(
  accessToken: string,
  customerId: string,
  body: AdminCustomerTrustNoteRequest,
) {
  return adminFetch<AdminOpsMutationResponse>(
    accessToken,
    `/direct/admin/customer-trust/${encodeURIComponent(customerId)}/notes`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function recordAdminCustomerTrustAction(
  accessToken: string,
  customerId: string,
  body: AdminCustomerTrustActionRequest,
) {
  return adminFetch<AdminOpsMutationResponse>(
    accessToken,
    `/direct/admin/customer-trust/${encodeURIComponent(customerId)}/actions`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function getAdminCleanerHealthCase(accessToken: string, caseId: string) {
  return adminFetch<MithrilOpSuccess<'direct.showAdminCleanerHealthCase'>>(
    accessToken,
    `/direct/admin/cleaner-health/${encodeURIComponent(caseId)}`,
  );
}

export async function recordAdminCleanerHealthAction(
  accessToken: string,
  caseId: string,
  body: AdminCleanerHealthActionRequest,
) {
  return adminFetch<MithrilOpSuccess<'direct.recordAdminCleanerHealthAction'>>(
    accessToken,
    `/direct/admin/cleaner-health/${encodeURIComponent(caseId)}/actions`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function createAdminAssistedBooking(accessToken: string, body: AdminAssistedBookingRequest) {
  return adminFetch<AdminAssistedBookingResponse>(accessToken, '/direct/admin/bookings', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getAdminJobInvoice(accessToken: string, bookingId: string) {
  return adminFetch<AdminJobInvoice>(
    accessToken,
    `/direct/admin/bookings/${encodeURIComponent(bookingId)}/invoice`,
  );
}

export async function upsertAdminJobInvoice(
  accessToken: string,
  bookingId: string,
  body: AdminJobInvoiceUpsertRequest,
) {
  return adminFetch<AdminJobInvoice>(
    accessToken,
    `/direct/admin/bookings/${encodeURIComponent(bookingId)}/invoice`,
    { method: 'PUT', body: JSON.stringify(body) },
  );
}

export async function sendAdminJobInvoice(
  accessToken: string,
  bookingId: string,
  body: AdminJobInvoiceSendRequest,
) {
  return adminFetch<AdminJobInvoiceSendResponse>(
    accessToken,
    `/direct/admin/bookings/${encodeURIComponent(bookingId)}/invoice/send`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function notifyAdminBookingCleaner(accessToken: string, bookingId: string) {
  return adminFetch<AdminBookingNotifyResponse>(
    accessToken,
    `/direct/admin/bookings/${encodeURIComponent(bookingId)}/notify-cleaner`,
    { method: 'POST' },
  );
}

export async function sendAdminBookingReceipt(accessToken: string, bookingId: string) {
  return adminFetch<AdminBookingNotifyResponse>(
    accessToken,
    `/direct/admin/bookings/${encodeURIComponent(bookingId)}/send-receipt`,
    { method: 'POST' },
  );
}

export async function resetAdminBookingExclusiveHold(
  accessToken: string,
  bookingId: string,
  body: AdminResetExclusiveHoldRequest = {},
) {
  return adminFetch<MithrilOpSuccess<'direct.resetAdminBookingExclusiveHold'>>(
    accessToken,
    `/direct/admin/bookings/${encodeURIComponent(bookingId)}/reset-hold`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function recordAdminBookingCashPayout(
  accessToken: string,
  bookingId: string,
  body: AdminCashPayoutRequest,
) {
  return adminFetch<AdminCashPayoutResponse>(
    accessToken,
    `/direct/admin/bookings/${encodeURIComponent(bookingId)}/cash-payout`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function sendAdminWhatsAppSms(accessToken: string, body: AdminWhatsAppSendRequest) {
  return adminFetch<AdminWhatsAppMutationResponse>(accessToken, '/direct/admin/whatsapp/sms', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function grantAdminTeamRole(accessToken: string, body: AdminTeamGrantRequest) {
  return adminFetch<AdminTeamMember>(accessToken, '/direct/admin/team/grant', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function revokeAdminTeamRole(accessToken: string, body: AdminTeamRevokeRequest) {
  return adminFetch<AdminTeamMember>(accessToken, '/direct/admin/team/revoke', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function mergeAdminAccounts(accessToken: string, body: AdminAccountMergeRequest) {
  return adminFetch<AdminAccountMergeResponse>(accessToken, '/direct/admin/accounts/merge', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function listAdminNotificationDeliveries(
  accessToken: string,
  page = 1,
  limit = 25,
) {
  return adminFetch<AdminNotificationDeliveryListResponse>(
    accessToken,
    `/direct/admin/notifications${mithrilQueryString({ page, limit })}`,
  );
}

export async function searchAdminNotificationTargets(accessToken: string, q: string) {
  const query = q.trim().slice(0, 120);
  if (query.length < 2) return { targets: [] as AdminNotificationTarget[] };
  return adminFetch<AdminNotificationTargetListResponse>(
    accessToken,
    `/direct/admin/notification-targets${mithrilQueryString({ q: query })}`,
  );
}

export async function sendAdminNotification(accessToken: string, body: AdminNotificationSendRequest) {
  return adminFetch<AdminNotificationSendResponse>(accessToken, '/direct/admin/notifications', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function sendAdminNotificationBroadcast(
  accessToken: string,
  body: AdminNotificationBroadcastRequest,
) {
  return adminFetch<AdminNotificationBroadcastResponse>(
    accessToken,
    '/direct/admin/notification-broadcast',
    { method: 'POST', body: JSON.stringify(body) },
  );
}
