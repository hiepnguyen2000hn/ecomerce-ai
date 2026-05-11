import { apiClient, setToken, setRefreshToken, clearToken } from './client';
import type { LoginResponse, UserMe } from './types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/api/v1/auth/login', { email, password });
  setToken(res.accessToken);
  setRefreshToken(res.refreshToken);
  return res;
}

export async function refreshAccessToken(token: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/api/v1/auth/refresh', { refreshToken: token });
  setToken(res.accessToken);
  setRefreshToken(res.refreshToken);
  return res;
}

export function getMe(): Promise<UserMe> {
  return apiClient.get<UserMe>('/api/v1/auth/me');
}

export function logout(): void {
  clearToken();
}
