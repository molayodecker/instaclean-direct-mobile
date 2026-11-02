import type { components } from './generated/mithril';
import type { MithrilOpQuery } from './openapi';

/** Mithril OpenAPI schema by name (from `lib/mithril/generated/mithril.ts`). */
export type MithrilSchema<Name extends keyof components['schemas']> = components['schemas'][Name];

/** Auth routes are not in the Direct OpenAPI spec yet. */
export type MithrilUser = {
  id: string;
  email: string | null;
  phone?: string | null;
  name?: string | null;
  status?: string | null;
  admin?: boolean;
  reviewer?: boolean;
};

export type MithrilSession = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
  user?: MithrilUser;
};

export type AuthMethodsResponse = {
  methods?: {
    email_password?: boolean;
    phone?: boolean;
    google?: boolean;
    facebook?: boolean;
  };
};

export type AdminBooking = MithrilSchema<'DirectAdminBooking'>;
export type AdminBookingListResponse = MithrilSchema<'DirectAdminBookingListResponse'>;
export type AdminBookingsQuery = MithrilOpQuery<'direct.listAdminBookings'>;

export type AdminLiveJob = MithrilSchema<'DirectAdminLiveJob'>;
export type AdminLiveJobsResponse = MithrilSchema<'DirectAdminLiveJobsResponse'>;

export type AdminServiceRequestItem = MithrilSchema<'DirectAdminServiceRequestItem'>;
export type AdminServiceRequestListResponse = MithrilSchema<'DirectAdminServiceRequestListResponse'>;
export type ServiceRequestStatus = AdminServiceRequestItem['status'];

export const serviceRequestStatuses = [
  'submitted',
  'triaging',
  'matching',
  'assigned',
  'resolved',
  'cancelled',
] as const satisfies readonly ServiceRequestStatus[];

export function isOpenServiceRequestStatus(status: ServiceRequestStatus): boolean {
  return status !== 'resolved' && status !== 'cancelled';
}

export type AdminWhatsAppThread = MithrilSchema<'DirectAdminWhatsAppThread'>;
export type AdminWhatsAppThreadListResponse = MithrilSchema<'DirectAdminWhatsAppThreadListResponse'>;

export type AdminCleaner = MithrilSchema<'DirectAdminCleanerRosterItem'>;
export type AdminCleanerListResponse = MithrilSchema<'DirectAdminCleanerListResponse'>;
export type AdminCleanersQuery = MithrilOpQuery<'direct.listAdminCleaners'>;

export type AdminCleanerApplication = MithrilSchema<'DirectAdminCleanerApplication'>;
export type AdminCleanerApplicationListResponse =
  MithrilSchema<'DirectAdminCleanerApplicationListResponse'>;

export type AdminDispatchMapCleaner = MithrilSchema<'DirectAdminDispatchMapCleaner'>;
export type AdminDispatchMapBooking = MithrilSchema<'DirectAdminDispatchMapBooking'>;
export type AdminDispatchMapResponse = MithrilSchema<'DirectAdminDispatchMapResponse'>;
export type AdminDispatchMapQuery = MithrilOpQuery<'direct.getAdminDispatchMap'>;

export type AppUpdatePolicyChannel = MithrilSchema<'DirectAdminAppUpdatePolicy'>['channel'];
export type AppUpdatePolicyApp = MithrilSchema<'DirectAdminAppUpdatePolicy'>['app'];

export const adminAppUpdatePolicyChannels = ['production', 'preview'] as const satisfies readonly AppUpdatePolicyChannel[];
export const adminAppUpdatePolicyApps = ['customer', 'worker'] as const satisfies readonly AppUpdatePolicyApp[];

export type AdminAppUpdatePolicy = MithrilSchema<'DirectAdminAppUpdatePolicy'>;
export type AdminAppUpdatePolicyListResponse = MithrilSchema<'DirectAdminAppUpdatePolicyListResponse'>;
export type AdminAppUpdatePolicySaveRequest = MithrilSchema<'DirectAdminAppUpdatePolicySaveRequest'>;
export type AdminAppUpdatePolicySaveResponse = MithrilSchema<'DirectAdminAppUpdatePolicySaveResponse'>;

export type AdminService = MithrilSchema<'DirectAdminService'>;
export type AdminServiceListResponse = MithrilSchema<'DirectAdminServiceListResponse'>;
export type AdminServiceResponse = MithrilSchema<'DirectAdminServiceResponse'>;
export type AdminServiceUpdateRequest = MithrilSchema<'DirectAdminServiceUpdateRequest'>;

export type AdminPromotionCode = MithrilSchema<'DirectAdminPromotionCode'>;
export type AdminPromotionCodeListResponse = MithrilSchema<'DirectAdminPromotionCodeListResponse'>;
export type AdminPromotionCodeStatus = AdminPromotionCode['status'];

export type AdminReportsDailyPoint = MithrilSchema<'DirectAdminReportsDailyRevenuePoint'>;
export type AdminReportsTopArea = MithrilSchema<'DirectAdminReportsTopAreaPoint'>;
export type AdminReportsSummary = MithrilSchema<'DirectAdminReportsSummary'>;
export type AdminReportsSummaryResponse = MithrilSchema<'DirectAdminReportsSummaryResponse'>;
export type AdminReportsDays = NonNullable<MithrilOpQuery<'direct.getAdminReportsSummary'>['days']>;

export type AdminServiceArea = MithrilSchema<'DirectAdminServiceArea'>;
export type AdminServiceAreaListResponse = MithrilSchema<'DirectAdminServiceAreaListResponse'>;

export type AdminPayoutsSummary = MithrilSchema<'DirectAdminPayoutsSummary'>;
export type AdminPayout = MithrilSchema<'DirectAdminPayout'> & {
  currency?: string;
  recentJobsCount?: number;
  createdAt?: string;
  errorMessage?: string | null;
};
export type AdminPayoutsListResponse = Omit<MithrilSchema<'DirectAdminPayoutsListResponse'>, 'payouts'> & {
  payouts: AdminPayout[];
};

export type AdminReviewStats = MithrilSchema<'DirectAdminReviewStats'>;
export type AdminReview = MithrilSchema<'DirectAdminReview'> & {
  serviceName?: string | null;
  response?: string | null;
  status?: string;
  createdAt?: string;
};
export type AdminReviewsListResponse = Omit<MithrilSchema<'DirectAdminReviewsListResponse'>, 'reviews'> & {
  reviews: AdminReview[];
};
export type AdminReviewFilter = 'all' | 'low' | 'needs_reply' | 'hidden';

export type AdminTeamMember = MithrilSchema<'DirectAdminTeamMember'>;
export type AdminTeamRoleGuideEntry = MithrilSchema<'DirectAdminTeamRoleGuideEntry'>;
export type AdminTeamListResponse = MithrilSchema<'DirectAdminTeamListResponse'>;
export type AdminTeamGrantRequest = MithrilSchema<'DirectAdminTeamGrantRequest'>;
export type AdminTeamRevokeRequest = MithrilSchema<'DirectAdminTeamRevokeRequest'>;

export type AdminAccountMergeRequest = MithrilSchema<'DirectAdminAccountMergeRequest'>;
export type AdminAccountMergeResponse = MithrilSchema<'DirectAdminAccountMergeResponse'>;

export type AdminNotificationDelivery = MithrilSchema<'DirectAdminNotificationDelivery'>;
export type AdminNotificationDeliveryListResponse =
  MithrilSchema<'DirectAdminNotificationDeliveryListResponse'>;
export type AdminNotificationTarget = MithrilSchema<'DirectAdminNotificationTarget'>;
export type AdminNotificationTargetListResponse = MithrilSchema<'DirectAdminNotificationTargetListResponse'>;
export type AdminNotificationSendRequest = MithrilSchema<'DirectAdminNotificationSendRequest'>;
export type AdminNotificationSendResponse = MithrilSchema<'DirectAdminNotificationSendResponse'>;
export type AdminNotificationBroadcastRequest = MithrilSchema<'DirectAdminNotificationBroadcastRequest'>;
export type AdminNotificationBroadcastResponse = MithrilSchema<'DirectAdminNotificationBroadcastResponse'>;

export type AdminWorkerApplicationDraft = MithrilSchema<'DirectAdminCleanerApplicationDraft'>;
export type AdminWorkerApplicationDraftListResponse =
  MithrilSchema<'DirectAdminCleanerApplicationDraftListResponse'>;
export type AdminWorkerApplicationDraftDetail = MithrilSchema<'DirectAdminCleanerApplicationDraftDetail'>;

export type AdminContractSummary = MithrilSchema<'DirectAdminContractSummary'>;
export type AdminContractListResponse = MithrilSchema<'DirectAdminContractList'>;
export type AdminContractDetail = MithrilSchema<'DirectAdminContractDetail'>;

export type AdminWorkerWallet = MithrilSchema<'DirectAdminWorkerWallet'>;
export type AdminWalletCreditRequest = MithrilSchema<'DirectAdminWalletCreditRequest'>;
export type AdminWalletCreditResponse = MithrilSchema<'DirectAdminWalletCreditResponse'>;
export type AdminBillingInvoice = MithrilSchema<'DirectAdminBillingInvoice'>;
export type AdminBillingInvoiceListResponse = MithrilSchema<'DirectAdminBillingInvoiceList'>;
export type AdminPaymentAdvice = MithrilSchema<'DirectAdminPaymentAdvice'>;
export type AdminPaymentAdviceListResponse = MithrilSchema<'DirectAdminPaymentAdviceList'>;
export type AdminPaymentRequest = MithrilSchema<'DirectAdminPaymentRequest'>;
export type AdminPaymentRequestCreate = MithrilSchema<'DirectAdminPaymentRequestCreate'>;
export type AdminPaymentRequestListResponse = MithrilSchema<'DirectAdminPaymentRequestList'>;
export type WorkerLoanRequest = MithrilSchema<'DirectWorkerLoanRequest'>;
export type WorkerLoanRequestListResponse = MithrilSchema<'DirectWorkerLoanRequestList'>;
export type AdminWorkerLoanReviewRequest = MithrilSchema<'DirectWorkerLoanReviewRequest'>;
export type AdminWorkerLoanReviewResponse = MithrilSchema<'DirectWorkerLoanReviewResponse'>;

export type AdminCustomer = MithrilSchema<'DirectAdminCustomer'>;
export type AdminCustomerListResponse = MithrilSchema<'DirectAdminCustomerListResponse'>;

export type AdminCustomerTrustProfile = MithrilSchema<'DirectAdminCustomerTrustProfile'>;
export type AdminCustomerTrustListResponse = MithrilSchema<'DirectAdminCustomerTrustListResponse'>;

export type AdminCleanerHealthCase = MithrilSchema<'DirectAdminCleanerHealthCase'>;
export type AdminCleanerHealthListResponse = MithrilSchema<'DirectAdminCleanerHealthListResponse'>;

export type AdminPlacement = MithrilSchema<'DirectAdminPlacement'>;
export type AdminPlacementsListResponse = MithrilSchema<'DirectAdminPlacementsResponse'>;

export type AdminCandidate = MithrilSchema<'DirectAdminCandidate'>;
export type AdminCandidatesResponse = MithrilSchema<'DirectAdminCandidatesResponse'>;
export type AdminMatchRequest = MithrilSchema<'DirectAdminMatchRequest'>;
export type AdminMatchResponse = MithrilSchema<'DirectAdminMatchResponse'>;

export type AdminCleanerApplicationDetail = MithrilSchema<'DirectAdminCleanerApplicationDetail'>;
export type AdminCleanerApprovalResponse = MithrilSchema<'DirectAdminCleanerApprovalResponse'>;

export type AdminCustomerTrustDetail = MithrilSchema<'DirectAdminCustomerTrustDetail'>;
export type AdminCustomerTrustNote = MithrilSchema<'DirectAdminCustomerTrustNote'>;
export type AdminCustomerTrustNoteRequest = MithrilSchema<'DirectAdminCustomerTrustNoteRequest'>;
export type AdminCustomerTrustActionRequest = MithrilSchema<'DirectAdminCustomerTrustActionRequest'>;
export type AdminOpsMutationResponse = MithrilSchema<'DirectAdminOpsMutationResponse'>;

export type AdminCleanerHealthCaseDetail = MithrilSchema<'DirectAdminCleanerHealthCaseDetail'>;
export type AdminCleanerHealthCaseAction = MithrilSchema<'DirectAdminCleanerHealthCaseAction'>;
export type AdminCleanerHealthActionRequest = MithrilSchema<'DirectAdminCleanerHealthActionRequest'>;

export type AdminWhatsAppMessage = MithrilSchema<'DirectAdminWhatsAppMessage'>;
export type AdminWhatsAppMessageListResponse = MithrilSchema<'DirectAdminWhatsAppMessageListResponse'>;
export type AdminWhatsAppSendRequest = MithrilSchema<'DirectAdminWhatsAppSendRequest'>;
export type AdminWhatsAppMutationResponse = MithrilSchema<'DirectAdminWhatsAppMutationResponse'>;

export type AdminAssignServiceRequestRequest = MithrilSchema<'DirectAdminAssignServiceRequestRequest'>;
export type AdminUpdateServiceRequestRequest = MithrilSchema<'DirectAdminUpdateServiceRequestRequest'>;
export type AdminServiceRequestMutationResponse = MithrilSchema<'DirectAdminServiceRequestMutationResponse'>;

export type AdminAssignBookingCleanerRequest = MithrilSchema<'DirectAdminAssignBookingCleanerRequest'>;
export type AdminUpdateBookingStatusRequest = MithrilSchema<'DirectAdminUpdateBookingStatusRequest'>;
export type AdminCancelBookingRequest = MithrilSchema<'DirectCancelBookingRequest'>;
export type AdminRescheduleBookingRequest = MithrilSchema<'DirectRescheduleBookingRequest'>;
export type AdminAssistedBookingRequest = MithrilSchema<'DirectAdminAssistedBookingRequest'>;
export type AdminAssistedBookingResponse = MithrilSchema<'DirectAdminAssistedBookingResponse'>;
export type AdminJobInvoice = MithrilSchema<'DirectAdminJobInvoice'>;
export type AdminJobInvoiceUpsertRequest = MithrilSchema<'DirectAdminJobInvoiceUpsertRequest'>;
export type AdminJobInvoiceSendRequest = MithrilSchema<'DirectAdminJobInvoiceSendRequest'>;
export type AdminJobInvoiceSendResponse = MithrilSchema<'DirectAdminJobInvoiceSendResponse'>;
export type AdminCashPayoutRequest = MithrilSchema<'DirectAdminCashPayoutRequest'>;
export type AdminCashPayoutResponse = MithrilSchema<'DirectAdminCashPayoutResponse'>;
export type AdminBookingNotifyResponse = MithrilSchema<'DirectAdminBookingNotifyResponse'>;
export type AdminResetExclusiveHoldRequest = MithrilSchema<'DirectAdminResetExclusiveHoldRequest'>;

export type BookingCleaner = MithrilSchema<'DirectBookingCleaner'>;
export type BookingCleanersResponse = MithrilSchema<'DirectBookingCleanerListResponse'>;

export const adminMutableServiceRequestStatuses = [
  'triaging',
  'matching',
  'resolved',
  'cancelled',
] as const satisfies readonly AdminUpdateServiceRequestRequest['status'][];

export const adminBookingStatusOptions = [
  'pending',
  'confirmed',
  'scheduled',
  'en_route',
  'arrived',
  'in_progress',
  'completed',
] as const satisfies readonly AdminUpdateBookingStatusRequest['status'][];

export const adminCleanerHealthActionTypes = [
  'monitor',
  'coaching',
  'training',
  'warning',
  'investigation',
  'resolved',
  'dismissed',
] as const satisfies readonly AdminCleanerHealthActionRequest['actionType'][];

export const adminCustomerTrustActions = [
  'mark_reviewed',
  'clear_manual_review',
  'require_manual_review',
  'require_id_before_payment',
  'require_id_before_dispatch',
] as const satisfies readonly AdminCustomerTrustActionRequest['action'][];
