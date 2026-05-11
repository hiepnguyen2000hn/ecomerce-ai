export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

export const staticUrl = (path?: string | null): string =>
  path ? `${API_BASE}${path}` : '';
