'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '@/lib/mock-data';

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
  });
}

export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const res = await fetch('/api/sales');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
  });
}
