import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  addAdminCustomerTrustNote,
  approveAdminCleanerApplication,
  assignAdminBookingCleaner,
  assignAdminServiceRequest,
  cancelAdminBooking,
  createAdminAssistedBooking,
  getAdminBooking,
  getAdminJobInvoice,
  getAdminCleanerApplication,
  getAdminCleanerHealthCase,
  getAdminCustomerTrust,
  listAdminCandidates,
  listBookingCleaners,
  listAdminWhatsAppMessages,
  matchAdminPlacementCandidate,
  notifyAdminBookingCleaner,
  recordAdminBookingCashPayout,
  recordAdminCleanerHealthAction,
  recordAdminCustomerTrustAction,
  resetAdminBookingExclusiveHold,
  rescheduleAdminBooking,
  sendAdminBookingReceipt,
  sendAdminJobInvoice,
  sendAdminWhatsAppMessage,
  sendAdminWhatsAppSms,
  sendAdminNotification,
  sendAdminNotificationBroadcast,
  grantAdminTeamRole,
  revokeAdminTeamRole,
  mergeAdminAccounts,
  creditAdminWorkerWallet,
  createAdminPaymentRequest,
  updateAdminPaymentRequest,
  reviewAdminWorkerLoanRequest,
  upsertAdminJobInvoice,
  updateAdminBookingStatus,
  updateAdminServiceRequest,
  type AdminAssistedBookingRequest,
  type AdminCashPayoutRequest,
  type AdminJobInvoiceSendRequest,
  type AdminJobInvoiceUpsertRequest,
  type AdminResetExclusiveHoldRequest,
  type AdminAssignBookingCleanerRequest,
  type AdminAssignServiceRequestRequest,
  type AdminCancelBookingRequest,
  type AdminCleanerHealthActionRequest,
  type AdminCustomerTrustActionRequest,
  type AdminCustomerTrustNoteRequest,
  type AdminMatchRequest,
  type AdminRescheduleBookingRequest,
  type AdminUpdateBookingStatusRequest,
  type AdminUpdateServiceRequestRequest,
  type AdminWhatsAppSendRequest,
  type AdminTeamGrantRequest,
  type AdminTeamRevokeRequest,
  type AdminAccountMergeRequest,
  type AdminNotificationSendRequest,
  type AdminNotificationBroadcastRequest,
  type AdminWalletCreditRequest,
  type AdminPaymentRequestCreate,
  type PaymentRequestAction,
  type AdminWorkerLoanReviewRequest,
} from '@/lib/mithril';

function useAccessToken() {
  const { accessToken, isSignedIn } = useAuth();
  return { accessToken, enabled: isSignedIn && Boolean(accessToken) };
}

export function useAdminBooking(bookingId: string) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-booking', bookingId],
    enabled: enabled && Boolean(bookingId),
    queryFn: () => getAdminBooking(accessToken!, bookingId),
  });
}

export function useBookingCleaners(serviceId?: number | null) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['booking-cleaners', serviceId],
    enabled: enabled && Boolean(serviceId),
    queryFn: () => listBookingCleaners(accessToken!, serviceId!),
  });
}

export function useAssignBookingCleaner(bookingId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminAssignBookingCleanerRequest) =>
      assignAdminBookingCleaner(accessToken!, bookingId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-booking', bookingId] });
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
  });
}

export function useUpdateBookingStatus(bookingId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminUpdateBookingStatusRequest) =>
      updateAdminBookingStatus(accessToken!, bookingId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-booking', bookingId] }),
  });
}

export function useCancelBooking(bookingId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body?: AdminCancelBookingRequest) => cancelAdminBooking(accessToken!, bookingId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-booking', bookingId] });
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
  });
}

export function useRescheduleBooking(bookingId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminRescheduleBookingRequest) =>
      rescheduleAdminBooking(accessToken!, bookingId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-booking', bookingId] }),
  });
}

export function useAssignServiceRequest(requestId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminAssignServiceRequestRequest) =>
      assignAdminServiceRequest(accessToken!, requestId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-service-requests'] });
    },
  });
}

export function useUpdateServiceRequest(requestId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminUpdateServiceRequestRequest) =>
      updateAdminServiceRequest(accessToken!, requestId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-service-requests'] });
    },
  });
}

export function useAdminWhatsAppMessages(phoneE164: string) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-whatsapp-messages', phoneE164],
    enabled: enabled && Boolean(phoneE164),
    queryFn: () => listAdminWhatsAppMessages(accessToken!, phoneE164),
    refetchInterval: 15_000,
  });
}

export function useSendWhatsAppMessage() {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminWhatsAppSendRequest) => sendAdminWhatsAppMessage(accessToken!, body),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['admin-whatsapp-messages', variables.phoneE164] });
      qc.invalidateQueries({ queryKey: ['admin-whatsapp-threads'] });
    },
  });
}

export function useAdminCandidates() {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-candidates'],
    enabled,
    queryFn: () => listAdminCandidates(accessToken!),
  });
}

export function useMatchPlacement(placementId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminMatchRequest) => matchAdminPlacementCandidate(accessToken!, placementId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-placements'] }),
  });
}

export function useAdminCleanerApplication(applicationId: string) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-cleaner-application', applicationId],
    enabled: enabled && Boolean(applicationId),
    queryFn: () => getAdminCleanerApplication(accessToken!, applicationId),
  });
}

export function useApproveCleanerApplication(applicationId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => approveAdminCleanerApplication(accessToken!, applicationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-cleaner-application', applicationId] });
      qc.invalidateQueries({ queryKey: ['admin-cleaner-applications'] });
      qc.invalidateQueries({ queryKey: ['admin-workers'] });
    },
  });
}

export function useAdminCustomerTrustDetail(customerId: string) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-customer-trust-detail', customerId],
    enabled: enabled && Boolean(customerId),
    queryFn: () => getAdminCustomerTrust(accessToken!, customerId),
  });
}

export function useAddCustomerTrustNote(customerId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminCustomerTrustNoteRequest) =>
      addAdminCustomerTrustNote(accessToken!, customerId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-customer-trust-detail', customerId] }),
  });
}

export function useCustomerTrustAction(customerId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminCustomerTrustActionRequest) =>
      recordAdminCustomerTrustAction(accessToken!, customerId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-customer-trust-detail', customerId] });
      qc.invalidateQueries({ queryKey: ['admin-customer-trust'] });
    },
  });
}

export function useAdminCleanerHealthCase(caseId: string) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-cleaner-health-case', caseId],
    enabled: enabled && Boolean(caseId),
    queryFn: () => getAdminCleanerHealthCase(accessToken!, caseId),
  });
}

export function useRecordCleanerHealthAction(caseId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminCleanerHealthActionRequest) =>
      recordAdminCleanerHealthAction(accessToken!, caseId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-cleaner-health-case', caseId] });
      qc.invalidateQueries({ queryKey: ['admin-cleaner-health'] });
    },
  });
}

export function useCreateAssistedBooking() {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminAssistedBookingRequest) => createAdminAssistedBooking(accessToken!, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
  });
}

export function useAdminJobInvoice(bookingId: string) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-job-invoice', bookingId],
    enabled: enabled && Boolean(bookingId),
    queryFn: () => getAdminJobInvoice(accessToken!, bookingId),
    retry: false,
  });
}

export function useUpsertJobInvoice(bookingId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminJobInvoiceUpsertRequest) => upsertAdminJobInvoice(accessToken!, bookingId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-job-invoice', bookingId] }),
  });
}

export function useSendJobInvoice(bookingId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminJobInvoiceSendRequest) => sendAdminJobInvoice(accessToken!, bookingId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-job-invoice', bookingId] }),
  });
}

export function useNotifyBookingCleaner(bookingId: string) {
  const { accessToken } = useAccessToken();
  return useMutation({
    mutationFn: () => notifyAdminBookingCleaner(accessToken!, bookingId),
  });
}

export function useSendBookingReceipt(bookingId: string) {
  const { accessToken } = useAccessToken();
  return useMutation({
    mutationFn: () => sendAdminBookingReceipt(accessToken!, bookingId),
  });
}

export function useResetBookingHold(bookingId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body?: AdminResetExclusiveHoldRequest) =>
      resetAdminBookingExclusiveHold(accessToken!, bookingId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-booking', bookingId] }),
  });
}

export function useRecordCashPayout(bookingId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminCashPayoutRequest) => recordAdminBookingCashPayout(accessToken!, bookingId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-booking', bookingId] }),
  });
}

export function useSendWhatsAppSms() {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminWhatsAppSendRequest) => sendAdminWhatsAppSms(accessToken!, body),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['admin-whatsapp-messages', variables.phoneE164] });
    },
  });
}

export function useGrantTeamRole() {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminTeamGrantRequest) => grantAdminTeamRole(accessToken!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-team'] }),
  });
}

export function useRevokeTeamRole() {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminTeamRevokeRequest) => revokeAdminTeamRole(accessToken!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-team'] }),
  });
}

export function useMergeAccounts() {
  const { accessToken } = useAccessToken();
  return useMutation({
    mutationFn: (body: AdminAccountMergeRequest) => mergeAdminAccounts(accessToken!, body),
  });
}

export function useSendAdminNotification() {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminNotificationSendRequest) => sendAdminNotification(accessToken!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notification-deliveries'] }),
  });
}

export function useSendNotificationBroadcast() {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminNotificationBroadcastRequest) =>
      sendAdminNotificationBroadcast(accessToken!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notification-deliveries'] }),
  });
}

export function useCreditWorkerWallet(workerId: string) {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminWalletCreditRequest) => creditAdminWorkerWallet(accessToken!, workerId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-worker-wallet', workerId] }),
  });
}

export function useCreatePaymentRequest() {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminPaymentRequestCreate) => createAdminPaymentRequest(accessToken!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-payment-requests'] }),
  });
}

export function usePaymentRequestAction() {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, action }: { requestId: string; action: PaymentRequestAction }) =>
      updateAdminPaymentRequest(accessToken!, requestId, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-payment-requests'] }),
  });
}

export function useReviewWorkerLoan() {
  const { accessToken } = useAccessToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, body }: { requestId: string; body: AdminWorkerLoanReviewRequest }) =>
      reviewAdminWorkerLoanRequest(accessToken!, requestId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-worker-loans'] }),
  });
}
