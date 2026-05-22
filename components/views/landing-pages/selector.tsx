'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/lib/hooks/use-products';
import { SelectorHeader } from './selector-header';
import { SelectorSearch } from './selector-search';
import { SelectorProductItem } from './selector-product-item';
import { PageLayout } from '@/components/layout/page-layout';

export function LandingPageSelector() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const { data: listResponse, isLoading } = useProducts({ q: query || undefined, pageSize: 20 });
  const products = listResponse?.data ?? [];
  const displayed = query ? products : products.slice(0, 5);

  return (
    <PageLayout
      breadcrumb={[{ label: 'Landing Pages' }]}
      contentClassName="flex flex-col items-center overflow-hidden px-4 pt-4 pb-4"
    >
      <div className="flex-shrink-0 w-full max-w-xl">
        <SelectorHeader />
        <SelectorSearch value={query} onChange={setQuery} />
      </div>

      <div className="flex-1 w-full max-w-xl overflow-y-auto no-scrollbar min-h-0 mt-2">
        <div className="bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/5 overflow-hidden">
          {isLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm font-bold">Searching…</div>
          ) : (
            <AnimatePresence mode="popLayout">
              {displayed.map((product, i) => (
                <SelectorProductItem
                  key={product.id}
                  product={product}
                  index={i}
                  onSelect={(p) => router.push(`/landing-pages/${p.id}`)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
