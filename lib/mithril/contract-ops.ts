import { mithrilAuthedFetch } from './api';
import { mithrilQueryString } from './openapi';
import type {
  AdminContractDetail,
  AdminContractListResponse,
  AdminWorkerApplicationDraftDetail,
  AdminWorkerApplicationDraftListResponse,
} from './types';

function opsFetch<T>(accessToken: string, path: string, init: RequestInit = {}) {
  return mithrilAuthedFetch<T>(accessToken, path, init);
}

export function currentContractMonth() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Accra',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date());
  const year = parts.find((p) => p.type === 'year')?.value ?? '2026';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  return `${year}-${month}`;
}

export async function listAdminContracts(accessToken: string, month?: string) {
  const m = month ?? currentContractMonth();
  return opsFetch<AdminContractListResponse>(
    accessToken,
    `/direct/admin/contracts${mithrilQueryString({ month: m })}`,
  );
}

export async function getAdminContract(accessToken: string, contractId: string, month?: string) {
  const m = month ?? currentContractMonth();
  return opsFetch<AdminContractDetail>(
    accessToken,
    `/direct/admin/contracts/${encodeURIComponent(contractId)}${mithrilQueryString({ month: m })}`,
  );
}

export async function listAdminWorkerApplicationDrafts(accessToken: string) {
  return opsFetch<AdminWorkerApplicationDraftListResponse>(
    accessToken,
    '/direct/admin/cleaner-application-drafts',
  );
}

export async function getAdminWorkerApplicationDraft(accessToken: string, draftId: string) {
  return opsFetch<AdminWorkerApplicationDraftDetail>(
    accessToken,
    `/direct/admin/cleaner-application-drafts/${encodeURIComponent(draftId)}`,
  );
}
