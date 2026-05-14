'use client';

import { useRouter, useParams } from 'next/navigation';
import { ProductDetail } from '@/components/views/product-detail';
import { useProduct } from '@/lib/hooks/use-products';
import { AlertCircle } from 'lucide-react';

export default function InventoryDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin" />
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Loading product…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[32px] text-center max-w-sm">
          <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-black text-black dark:text-white uppercase mb-2">Not Found</h3>
          <p className="text-gray-500 text-sm font-bold mb-6">Product could not be loaded.</p>
          <button
            onClick={() => router.push('/inventory')}
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest"
          >
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  return <ProductDetail product={product} onBack={() => router.push('/inventory')} />;
}
