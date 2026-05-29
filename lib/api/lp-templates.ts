import { apiClient } from './client';
import type { LpTemplate, CreateLpTemplateDto, UpdateLpTemplateDto } from './types';

export const listLpTemplates = (): Promise<LpTemplate[]> =>
  apiClient.get('/api/v1/lp-templates');

export const getLpTemplate = (id: string): Promise<LpTemplate> =>
  apiClient.get(`/api/v1/lp-templates/${id}`);

export const getTopLpTemplates = async (n?: number): Promise<LpTemplate[]> => {
  const query = n ? `?n=${n}` : '';
  const res = await apiClient.get<{ data: LpTemplate[] }>(`/api/v1/lp-templates/top${query}`);
  return res.data;
};

export const createLpTemplate = (dto: CreateLpTemplateDto): Promise<LpTemplate> =>
  apiClient.post('/api/v1/lp-templates', dto);

export const updateLpTemplate = (id: string, dto: UpdateLpTemplateDto): Promise<LpTemplate> =>
  apiClient.patch(`/api/v1/lp-templates/${id}`, dto);

export const deleteLpTemplate = (id: string): Promise<void> =>
  apiClient.delete(`/api/v1/lp-templates/${id}`);
