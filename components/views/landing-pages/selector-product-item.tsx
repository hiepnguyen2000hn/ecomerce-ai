'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Package } from 'lucide-react';
import Image from 'next/image';
import type { ApiProduct } from '@/lib/api/types';
import { staticUrl } from '@/lib/api/config';

interface SelectorProductItemProps {
  product: ApiProduct;
  index: number;
  onSelect: (product: ApiProduct) => void;
}

function ProductThumb({ src, alt }: { src: string | null | undefined; alt: string }) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Package size={20} className="text-white/20" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover group-hover:scale-110 transition-transform duration-700"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export function SelectorProductItem({ product, index, onSelect }: SelectorProductItemProps) {
  return (
    <motion.button
      key={product.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onSelect(product)}
      className="w-full flex items-center gap-3.5 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-all group border-b border-gray-100 dark:border-white/5 last:border-0"
    >
      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex-shrink-0">
        <ProductThumb src={staticUrl(product.primaryImageUrl)} alt={product.name} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-black dark:text-white truncate mb-0.5">{product.name}</h4>
        <p className="font-mono text-[10px] text-gray-500 font-bold uppercase tracking-[0.1em]">SKU: {product.sku}</p>
      </div>
      <ChevronRight size={18} className="text-gray-300 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
    </motion.button>
  );
}
