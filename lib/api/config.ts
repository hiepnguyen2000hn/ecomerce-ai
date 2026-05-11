export const API_BASE = 'http://10.1.4.98:3006';

export const staticUrl = (path?: string | null): string =>
  path ? `${API_BASE}${path}` : '';
