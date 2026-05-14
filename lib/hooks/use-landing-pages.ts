'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listLandingPages, getLandingPage, getLandingPagesByProduct,
  createLandingPage, updateLandingPage, deleteLandingPage,
  transitionLandingPageStatus,
} from '@/lib/api/landing-pages';
import type {
  CreateLandingPageDto, UpdateLandingPageDto, StatusTransitionDto,
} from '@/lib/api/types';

export function useLandingPages() {
  return useQuery({
    queryKey: ['landing-pages'],
    queryFn: listLandingPages,
  });
}

export function useLandingPage(id: string) {
  return useQuery({
    queryKey: ['landing-pages', id],
    queryFn: () => getLandingPage(id),
    enabled: !!id,
  });
}

export function useLandingPagesByProduct(productId: string) {
  return useQuery({
    queryKey: ['landing-pages', 'by-product', productId],
    queryFn: () => getLandingPagesByProduct(productId),
    enabled: !!productId,
  });
}

export function useCreateLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLandingPageDto) => createLandingPage(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landing-pages'] }),
  });
}

export function useUpdateLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateLandingPageDto }) =>
      updateLandingPage(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landing-pages'] }),
  });
}

export function useDeleteLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLandingPage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landing-pages'] }),
  });
}

export function useTransitionLandingPageStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: StatusTransitionDto }) =>
      transitionLandingPageStatus(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landing-pages'] }),
  });
}
