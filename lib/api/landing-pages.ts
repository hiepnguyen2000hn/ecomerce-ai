import { apiClient } from './client';
import type {
  ApiLandingPage,
  CreateLandingPageDto,
  UpdateLandingPageDto,
  StatusTransitionDto,
} from './types';

export const listLandingPages = (): Promise<ApiLandingPage[]> =>
  apiClient.get('/api/v1/landing-pages');

export const getLandingPage = (id: string): Promise<ApiLandingPage> =>
  apiClient.get(`/api/v1/landing-pages/${id}`);

export const getLandingPagesByProduct = (productId: string): Promise<ApiLandingPage[]> =>
  apiClient.get(`/api/v1/landing-pages/by-product/${productId}`);

export const createLandingPage = (dto: CreateLandingPageDto): Promise<ApiLandingPage> =>
  apiClient.post('/api/v1/landing-pages', dto);

export const updateLandingPage = (id: string, dto: UpdateLandingPageDto): Promise<ApiLandingPage> =>
  apiClient.patch(`/api/v1/landing-pages/${id}`, dto);

export const deleteLandingPage = (id: string): Promise<void> =>
  apiClient.delete(`/api/v1/landing-pages/${id}`);

export const transitionLandingPageStatus = (
  id: string,
  dto: StatusTransitionDto,
): Promise<ApiLandingPage> =>
  apiClient.post(`/api/v1/landing-pages/${id}/status`, dto);
