export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

export const staticUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) return path;
  return `${API_BASE}${path}`;
};
