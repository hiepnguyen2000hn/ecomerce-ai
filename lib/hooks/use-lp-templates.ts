'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listLpTemplates, getLpTemplate, getTopLpTemplates,
  createLpTemplate, updateLpTemplate, deleteLpTemplate,
} from '@/lib/api/lp-templates';
import type { CreateLpTemplateDto, UpdateLpTemplateDto } from '@/lib/api/types';

export function useLpTemplates() {
  return useQuery({
    queryKey: ['lp-templates'],
    queryFn: listLpTemplates,
  });
}

export function useLpTemplate(id: string) {
  return useQuery({
    queryKey: ['lp-templates', id],
    queryFn: () => getLpTemplate(id),
    enabled: !!id,
  });
}

export function useTopLpTemplates(n?: number) {
  return useQuery({
    queryKey: ['lp-templates', 'top', n],
    queryFn: () => getTopLpTemplates(n),
  });
}

export function useCreateLpTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLpTemplateDto) => createLpTemplate(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lp-templates'] }),
  });
}

export function useUpdateLpTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateLpTemplateDto }) =>
      updateLpTemplate(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lp-templates'] }),
  });
}

export function useDeleteLpTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLpTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lp-templates'] }),
  });
}
