'use client';

import { useRouter } from 'next/navigation';
import { ProductList } from '@/components/views/product-list';
import type { ApiProduct } from '@/lib/api/types';

export default function InventoryPage() {
  const router = useRouter();

  return (
    <ProductList
      onEditProduct={(product: ApiProduct) => router.push(`/inventory/${product.id}`)}
      onCreateProduct={() => router.push('/inventory/create')}
      onViewAnalytics={(product: ApiProduct) => router.push(`/inventory/${product.id}/analytics`)}
    />
  );
}
