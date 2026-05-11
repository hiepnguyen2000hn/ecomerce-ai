import { apiClient } from './client';
import type {
  ApiProduct, CreateProductDto, ProductsListParams,
  LifecycleTransitionDto, CreateVariantGroupDto, UpdateVariantGroupDto,
  CreateVariantDto, UpdateVariantDto,
} from './types';

export function listProducts(params: ProductsListParams = {}): Promise<ApiProduct[]> {
  const qs = new URLSearchParams();
  if (params.page)      qs.set('page',     String(params.page));
  if (params.pageSize)  qs.set('pageSize', String(params.pageSize));
  if (params.sort)      qs.set('sort',     params.sort);
  if (params.q)         qs.set('q',        params.q);
  params.lifecycleStage?.forEach(s => qs.append('lifecycleStage', s));
  params.status?.forEach(s         => qs.append('status', s));
  params.market?.forEach(m         => qs.append('market', m));
  if (params.includeDeleted)        qs.set('includeDeleted', 'true');
  const query = qs.toString() ? `?${qs}` : '';
  return apiClient.get(`/api/v1/products${query}`);
}

export const getProduct     = (id: string): Promise<ApiProduct> =>
  apiClient.get(`/api/v1/products/${id}`);

export const createProduct  = (dto: CreateProductDto): Promise<ApiProduct> =>
  apiClient.post('/api/v1/products', dto);

export const updateProduct  = (id: string, dto: Partial<CreateProductDto>): Promise<ApiProduct> =>
  apiClient.patch(`/api/v1/products/${id}`, dto);

export const deleteProduct  = (id: string): Promise<void> =>
  apiClient.delete(`/api/v1/products/${id}`);

export const transitionLifecycle = (id: string, dto: LifecycleTransitionDto): Promise<void> =>
  apiClient.post(`/api/v1/products/${id}/lifecycle`, dto);

// Variant groups
export const createVariantGroup = (productId: string, dto: CreateVariantGroupDto) =>
  apiClient.post(`/api/v1/products/${productId}/variant-groups`, dto);

export const updateVariantGroup = (productId: string, groupId: string, dto: UpdateVariantGroupDto) =>
  apiClient.patch(`/api/v1/products/${productId}/variant-groups/${groupId}`, dto);

export const deleteVariantGroup = (productId: string, groupId: string): Promise<void> =>
  apiClient.delete(`/api/v1/products/${productId}/variant-groups/${groupId}`);

// Variants
export const createVariant = (productId: string, dto: CreateVariantDto) =>
  apiClient.post(`/api/v1/products/${productId}/variants`, dto);

export const updateVariant = (productId: string, variantId: string, dto: UpdateVariantDto) =>
  apiClient.patch(`/api/v1/products/${productId}/variants/${variantId}`, dto);

export const deleteVariant = (productId: string, variantId: string): Promise<void> =>
  apiClient.delete(`/api/v1/products/${productId}/variants/${variantId}`);

// Images (multipart — bypasses JSON content-type)
export async function uploadProductImage(
  productId: string,
  file: File,
  alt?: string,
  isPrimary?: boolean,
): Promise<void> {
  const form = new FormData();
  form.append('file', file);
  if (alt != null)       form.append('alt', alt);
  if (isPrimary != null) form.append('isPrimary', String(isPrimary));
  await apiClient.upload(`/api/v1/products/${productId}/images`, form);
}

export const deleteProductImage = (productId: string, imageId: string): Promise<void> =>
  apiClient.delete(`/api/v1/products/${productId}/images/${imageId}`);
