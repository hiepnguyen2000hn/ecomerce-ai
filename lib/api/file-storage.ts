import { apiClient } from './client';

export interface StorageFile {
  id: string;
  url: string;
  filename?: string;
  mimeType?: string;
  size?: number;
}

export async function uploadFiles(files: File[]): Promise<StorageFile[]> {
  const form = new FormData();
  files.forEach(f => form.append('files', f));
  const res = await apiClient.upload<{ data: StorageFile[] }>('/api/v1/file-storage/upload', form);
  return res.data;
}

// Ready for future use — not called yet
export async function getFileInfo(id: string): Promise<StorageFile> {
  const res = await apiClient.get<{ data: StorageFile }>(`/api/v1/file-storage/file/${id}`);
  return res.data;
}
