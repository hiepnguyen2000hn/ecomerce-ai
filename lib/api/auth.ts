import { apiClient, setToken, setRefreshToken, clearToken } from './client';
import type { LoginResponse, UserMe, ApiDataResponse } from './types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<ApiDataResponse<LoginResponse>>('/api/v1/auth/login', { email, password });
  setToken(res.data.accessToken);
  setRefreshToken(res.data.refreshToken);
  return res.data;
}

export async function refreshAccessToken(token: string): Promise<LoginResponse> {
  const res = await apiClient.post<ApiDataResponse<LoginResponse>>('/api/v1/auth/refresh', { refreshToken: token });
  setToken(res.data.accessToken);
  setRefreshToken(res.data.refreshToken);
  return res.data;
}

export async function getMe(): Promise<UserMe> {
  const res = await apiClient.get<ApiDataResponse<UserMe>>('/api/v1/auth/me');
  return res.data;
}

export function logout(): void {
  clearToken();
}
