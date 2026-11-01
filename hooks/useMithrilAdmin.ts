import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  getAdminDispatchMap,
  listAdminAppUpdatePolicies,
  listAdminBookings,
  listAdminCleanerApplications,
  listAdminCleaners,
  listAdminLiveJobs,
  listAdminPromotionCodes,
  listAdminPayouts,
  listAdminReviews,
  listAdminTeam,
  listAdminCustomers,
  listAdminCustomerTrust,
  listAdminCleanerHealth,
  listAdminPlacements,
  listAdminServiceAreas,
  listAdminServices,
  getAdminReportsSummary,
  getAdminService,
  listAdminServiceRequests,
  listAdminWhatsAppThreads,
  listAdminNotificationDeliveries,
  searchAdminNotificationTargets,
  listAdminBillingInvoices,
  listAdminPaymentAdvices,
  listAdminPaymentRequests,
  listAdminWorkerLoanRequests,
  getAdminWorkerWallet,
  listAdminContracts,
  getAdminContract,
  listAdminWorkerApplicationDrafts,
  getAdminWorkerApplicationDraft,
  saveAdminAppUpdatePolicy,
  updateAdminService,
  type AdminAppUpdatePolicySaveRequest,
  type AdminBookingsQuery,
  type AdminReportsDays,
  type AdminReviewFilter,
  type AdminServiceUpdateRequest,
} from '@/lib/mithril';

function useAccessToken() {
  const { accessToken, isSignedIn } = useAuth();
  return { accessToken, enabled: isSignedIn && Boolean(accessToken) };
}

export function useAdminBookings(filters?: Pick<AdminBookingsQuery, 'status' | 'q'>) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-bookings', filters?.status ?? 'all', filters?.q ?? ''],
    enabled,
    queryFn: () => listAdminBookings(accessToken!, filters),
  });
}

export function useAdminLiveJobs() {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-live-jobs'],
    enabled,
    queryFn: () => listAdminLiveJobs(accessToken!),
    refetchInterval: 30_000,
  });
}

export function useAdminServiceRequests() {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-service-requests'],
    enabled,
    queryFn: () => listAdminServiceRequests(accessToken!),
  });
}

export function useAdminWhatsAppThreads() {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-whatsapp-threads'],
    enabled,
    queryFn: () => listAdminWhatsAppThreads(accessToken!),
  });
}

export function useAdminDispatchMap(daysAhead = 7) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-dispatch-map', daysAhead],
    enabled,
    queryFn: () => getAdminDispatchMap(accessToken!, { daysAhead }),
    refetchInterval: 60_000,
  });
}

export function useAdminCleaners(search?: string) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-workers', search ?? ''],
    enabled,
    queryFn: () => listAdminCleaners(accessToken!, { q: search, limit: 100 }),
  });
}

/** Same as useAdminCleaners — roster from Mithril admin workers API. */
export function useAdminWorkers(search?: string) {
  return useAdminCleaners(search);
}

export function useAdminCleanerApplications() {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-cleaner-applications'],
    enabled,
    queryFn: () => listAdminCleanerApplications(accessToken!, { status: 'pending' }),
  });
}

export function useAdminAppUpdatePolicies() {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-app-update-policy'],
    enabled,
    queryFn: () => listAdminAppUpdatePolicies(accessToken!),
  });
}

export function useSaveAppUpdatePolicy() {
  const { accessToken } = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminAppUpdatePolicySaveRequest) => saveAdminAppUpdatePolicy(accessToken!, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-app-update-policy'] }),
  });
}

export function useAdminServices() {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-services'],
    enabled,
    queryFn: () => listAdminServices(accessToken!),
  });
}

export function useAdminService(serviceId: string) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-service', serviceId],
    enabled: enabled && Boolean(serviceId),
    queryFn: () => getAdminService(accessToken!, serviceId),
  });
}

export function useUpdateAdminService(serviceId: string) {
  const { accessToken } = useAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminServiceUpdateRequest) => updateAdminService(accessToken!, serviceId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['admin-service', serviceId] });
    },
  });
}

export function useAdminPromotionCodes() {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-promotion-codes'],
    enabled,
    queryFn: () => listAdminPromotionCodes(accessToken!),
  });
}

export function useAdminReportsSummary(days: AdminReportsDays) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-reports-summary', days],
    enabled,
    queryFn: () => getAdminReportsSummary(accessToken!, days),
  });
}

export function useAdminServiceAreas() {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-service-areas'],
    enabled,
    queryFn: () => listAdminServiceAreas(accessToken!),
  });
}

export function useAdminPayouts(status?: string) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-payouts', status ?? 'all'],
    enabled,
    queryFn: () => listAdminPayouts(accessToken!, status),
  });
}

export function useAdminReviews(filter: AdminReviewFilter = 'all') {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-reviews', filter],
    enabled,
    queryFn: () => listAdminReviews(accessToken!, filter),
  });
}

export function useAdminTeam() {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-team'],
    enabled,
    queryFn: () => listAdminTeam(accessToken!),
  });
}

export function useAdminCustomers(search?: string) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-customers', search ?? ''],
    enabled,
    queryFn: () => listAdminCustomers(accessToken!, search),
  });
}

export function useAdminCustomerTrust() {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-customer-trust'],
    enabled,
    queryFn: () => listAdminCustomerTrust(accessToken!),
  });
}

export function useAdminCleanerHealth() {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-cleaner-health'],
    enabled,
    queryFn: () => listAdminCleanerHealth(accessToken!),
  });
}

export function useAdminPlacements() {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-placements'],
    enabled,
    queryFn: () => listAdminPlacements(accessToken!),
  });
}

export function useAdminNotificationDeliveries(page = 1) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-notification-deliveries', page],
    enabled,
    queryFn: () => listAdminNotificationDeliveries(accessToken!, page, 25),
  });
}

export function useAdminNotificationTargets(search: string) {
  const { accessToken, enabled } = useAccessToken();
  const q = search.trim();
  return useQuery({
    queryKey: ['admin-notification-targets', q],
    enabled: enabled && q.length >= 2,
    queryFn: () => searchAdminNotificationTargets(accessToken!, q),
  });
}

export function useAdminBillingInvoices(page = 1) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-billing-invoices', page],
    enabled,
    queryFn: () => listAdminBillingInvoices(accessToken!, page),
  });
}

export function useAdminPaymentAdvices(page = 1) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-payment-advices', page],
    enabled,
    queryFn: () => listAdminPaymentAdvices(accessToken!, page),
  });
}

export function useAdminPaymentRequests() {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-payment-requests'],
    enabled,
    queryFn: () => listAdminPaymentRequests(accessToken!),
  });
}

export function useAdminWorkerLoanRequests(
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'all' = 'pending',
) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-worker-loans', status],
    enabled,
    queryFn: () => listAdminWorkerLoanRequests(accessToken!, status),
  });
}

export function useAdminWorkerWallet(workerId: string) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-worker-wallet', workerId],
    enabled: enabled && Boolean(workerId),
    queryFn: () => getAdminWorkerWallet(accessToken!, workerId),
    retry: false,
  });
}

export function useAdminContracts(month?: string) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-contracts', month ?? 'current'],
    enabled,
    queryFn: () => listAdminContracts(accessToken!, month),
  });
}

export function useAdminContract(contractId: string, month?: string) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-contract', contractId, month ?? 'current'],
    enabled: enabled && Boolean(contractId),
    queryFn: () => getAdminContract(accessToken!, contractId, month),
  });
}

export function useAdminWorkerApplicationDrafts() {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-worker-application-drafts'],
    enabled,
    queryFn: () => listAdminWorkerApplicationDrafts(accessToken!),
  });
}

export function useAdminWorkerApplicationDraft(draftId: string) {
  const { accessToken, enabled } = useAccessToken();
  return useQuery({
    queryKey: ['admin-worker-application-draft', draftId],
    enabled: enabled && Boolean(draftId),
    queryFn: () => getAdminWorkerApplicationDraft(accessToken!, draftId),
  });
}
