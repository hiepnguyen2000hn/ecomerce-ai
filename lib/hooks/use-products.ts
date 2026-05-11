'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listProducts, createProduct, updateProduct,
  deleteProduct, transitionLifecycle,
} from '@/lib/api/products';
import type { CreateProductDto, ProductsListParams, LifecycleTransitionDto } from '@/lib/api/types';

export function useProducts(params: ProductsListParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => listProducts(params),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductDto) => createProduct(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateProductDto> }) =>
      updateProduct(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useTransitionLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: LifecycleTransitionDto }) =>
      transitionLifecycle(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

// --- Mock-backed hooks (no real endpoints yet) ---

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then(r => r.json()),
  });
}

export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: () => fetch('/api/sales').then(r => r.json()),
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => fetch('/api/customers').then(r => r.json()),
  });
}
