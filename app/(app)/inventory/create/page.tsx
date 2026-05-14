'use client';

import { useRouter } from 'next/navigation';
import { ProductCreate } from '@/components/views/product-create';

export default function InventoryCreatePage() {
  const router = useRouter();
  return <ProductCreate onBack={() => router.push('/inventory')} />;
}
