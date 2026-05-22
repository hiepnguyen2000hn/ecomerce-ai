import { apiClient, getToken } from './client';
import { API_BASE } from './config';
import type {
  ApiLpBatch,
  CreateLpBatchDto,
  CreateLpBatchResponse,
  ApiLpBatchLandingPage,
  LpBatchLandingPagesParams,
  LpBatchLandingPagesListResponse,
  TransitionLpStatusDto,
} from './types';

export const createLpBatch = (dto: CreateLpBatchDto): Promise<CreateLpBatchResponse> =>
  apiClient.post('/api/v1/lp-batch', dto);

export const listLpBatchesByProduct = (productId: string): Promise<ApiLpBatch[]> =>
  apiClient.get(`/api/v1/lp-batch?productId=${encodeURIComponent(productId)}`);

export const getLpBatch = (id: string): Promise<ApiLpBatch> =>
  apiClient.get(`/api/v1/lp-batch/${id}`);

export const listLpBatchLandingPages = (
  params: LpBatchLandingPagesParams = {},
): Promise<LpBatchLandingPagesListResponse> => {
  const qs = new URLSearchParams();
  if (params.productId) qs.set('productId', params.productId);
  if (params.status)    qs.set('status', params.status);
  if (params.search)    qs.set('search', params.search);
  if (params.page)      qs.set('page', String(params.page));
  if (params.pageSize)  qs.set('pageSize', String(params.pageSize));
  const query = qs.toString();
  return apiClient.get(`/api/v1/lp-batch/landing-pages${query ? `?${query}` : ''}`);
};

export const getLpBatchLandingPage = (id: string): Promise<ApiLpBatchLandingPage> =>
  apiClient.get(`/api/v1/lp-batch/landing-pages/${id}`);

export const transitionLpBatchLandingPageStatus = (
  id: string,
  dto: TransitionLpStatusDto,
): Promise<ApiLpBatchLandingPage> =>
  apiClient.patch(`/api/v1/lp-batch/landing-pages/${id}/status`, dto);

export async function uploadLpBatchAiResults(batchId: string, files: File[]): Promise<void> {
  const token = getToken();
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  const res = await fetch(`${API_BASE}/api/v1/lp-batch/${batchId}/ai-results`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Failed to upload AI results');
  }
}

export const getBatchGeneratedLandingPages = (batchId: string): Promise<ApiLpBatchLandingPage[]> =>
  apiClient.get(`/api/v1/lp-batch/${batchId}/landing-pages`);

export async function getLpBatchDriveFileBlob(batchId: string, fileId: string): Promise<Blob> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/v1/lp-batch/${batchId}/drive-files/${fileId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Failed to fetch Drive file');
  }
  return res.blob();
}
