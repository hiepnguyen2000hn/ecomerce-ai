import { API_BASE } from './config';

const ACCESS_KEY = 'levelup_access_token';
const REFRESH_KEY = 'levelup_refresh_token';

export const getToken = (): string | null => localStorage.getItem(ACCESS_KEY);
export const setToken = (t: string): void => { localStorage.setItem(ACCESS_KEY, t); };
export const clearToken = (): void => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_KEY);
export const setRefreshToken = (t: string): void => { localStorage.setItem(REFRESH_KEY, t); };

function forceLogout(): never {
  clearToken();
  window.location.replace('/login');
  throw new Error('Session expired');
}

async function buildHeaders(init: RequestInit): Promise<Record<string, string>> {
  const token = getToken();
  return {
    ...(init.body && !(init.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string>),
  };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: await buildHeaders(init),
  });

  // 401 → try refresh once, then retry
  if (res.status === 401) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) forceLogout();

    // attempt token refresh
    const refreshRes = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshRes.ok) forceLogout();

    const { data } = await refreshRes.json();
    setToken(data.accessToken);
    setRefreshToken(data.refreshToken);

    // retry original request with new token
    const retryRes = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: await buildHeaders(init),
    });

    if (!retryRes.ok) {
      if (retryRes.status === 401) forceLogout();
      const err = await retryRes.json().catch(() => ({ message: retryRes.statusText }));
      throw new Error(err.message ?? 'Request failed');
    }

    if (retryRes.status === 204) return undefined as unknown as T;
    return retryRes.json();
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Request failed');
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const apiClient = {
  get:    <T>(path: string)                  => request<T>(path, { method: 'GET' }),
  post:   <T>(path: string, body?: unknown)  => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  <T>(path: string, body?: unknown)  => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string)                  => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, form: FormData)  => request<T>(path, { method: 'POST',  body: form }),
};
