import { apiClient } from './client';
import type { ApiUser } from './types';

export const listUsers = (): Promise<ApiUser[]> =>
  apiClient.get('/api/v1/users');

export const getUser = (id: string): Promise<ApiUser> =>
  apiClient.get(`/api/v1/users/${id}`);
