import { mithrilAuthedFetch } from './api';
import { mithrilQueryString } from './openapi';
import type {
  AdminPaymentRequestCreate,
  AdminWalletCreditRequest,
  AdminWalletCreditResponse,
  AdminWorkerWallet,
  AdminWorkerLoanReviewRequest,
  AdminWorkerLoanReviewResponse,
  AdminBillingInvoiceListResponse,
  AdminPaymentAdviceListResponse,
  AdminPaymentRequest,
  AdminPaymentRequestListResponse,
  WorkerLoanRequestListResponse,
} from './types';

function financeFetch<T>(accessToken: string, path: string, init: RequestInit = {}) {
  return mithrilAuthedFetch<T>(accessToken, path, init);
}

export async function getAdminWorkerWallet(accessToken: string, workerId: string) {
  return financeFetch<AdminWorkerWallet>(
    accessToken,
    `/direct/admin/cleaners/${encodeURIComponent(workerId)}/wallet`,
  );
}

export async function creditAdminWorkerWallet(
  accessToken: string,
  workerId: string,
  body: AdminWalletCreditRequest,
) {
  return financeFetch<AdminWalletCreditResponse>(
    accessToken,
    `/direct/admin/cleaners/${encodeURIComponent(workerId)}/wallet-credit`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function listAdminBillingInvoices(accessToken: string, page = 1) {
  return financeFetch<AdminBillingInvoiceListResponse>(
    accessToken,
    `/direct/admin/billing/invoices${mithrilQueryString({ page })}`,
  );
}

export async function listAdminPaymentAdvices(accessToken: string, page = 1) {
  return financeFetch<AdminPaymentAdviceListResponse>(
    accessToken,
    `/direct/admin/billing/payment-advices${mithrilQueryString({ page })}`,
  );
}

export async function listAdminPaymentRequests(accessToken: string) {
  return financeFetch<AdminPaymentRequestListResponse>(
    accessToken,
    '/direct/admin/billing/payment-requests',
  );
}

export async function createAdminPaymentRequest(
  accessToken: string,
  body: AdminPaymentRequestCreate,
) {
  return financeFetch<AdminPaymentRequest>(accessToken, '/direct/admin/billing/payment-requests', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type PaymentRequestAction = 'pause' | 'resume' | 'retry' | 'reminders';

export async function updateAdminPaymentRequest(
  accessToken: string,
  requestId: string,
  action: PaymentRequestAction,
) {
  return financeFetch<AdminPaymentRequest>(
    accessToken,
    `/direct/admin/billing/payment-requests/${encodeURIComponent(requestId)}/${action}`,
    { method: 'POST' },
  );
}

export async function listAdminWorkerLoanRequests(
  accessToken: string,
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'all' = 'pending',
) {
  return financeFetch<WorkerLoanRequestListResponse>(
    accessToken,
    `/direct/admin/worker-loan-requests${mithrilQueryString({ status })}`,
  );
}

export async function reviewAdminWorkerLoanRequest(
  accessToken: string,
  requestId: string,
  body: AdminWorkerLoanReviewRequest,
) {
  return financeFetch<AdminWorkerLoanReviewResponse>(
    accessToken,
    `/direct/admin/worker-loan-requests/${encodeURIComponent(requestId)}/review`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}
