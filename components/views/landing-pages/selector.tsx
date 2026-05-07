'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Package } from 'lucide-react';
import { MOCK_PRODUCTS, Product } from '@/lib/mock-data';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface LandingPageSelectorProps {
  onSelect: (product: Product) => void;
}

export function LandingPageSelector({ onSelect }: LandingPageSelectorProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  
  const filteredProducts = query 
    ? MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
    : MOCK_PRODUCTS.slice(0, 3);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg text-center mb-12"
      >
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-8">
          <Search size={32} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-display font-black text-black dark:text-white uppercase tracking-tighter mb-4">
          {t('landing_pages.selector.title')}
        </h2>
        <p className="text-xs text-gray-400 dark:text-white/30 font-bold uppercase tracking-widest max-w-xs mx-auto">
          {t('products.search_description')}
        </p>
      </motion.div>

      <div className="w-full max-w-xl">
        <div className="relative mb-6">
          <div className={cn(
            "relative bg-white dark:bg-[#0c0c0c] border rounded-3xl transition-all duration-500 shadow-xl shadow-black/5 overflow-hidden",
            query ? "border-black dark:border-white ring-4 ring-black/5 dark:ring-white/5" : "border-gray-100 dark:border-white/10"
          )}>
            <input 
              type="text"
              placeholder={t('landing_pages.selector.placeholder')}
              className="w-full py-5 pl-8 pr-12 bg-transparent text-base border-none focus:ring-0 focus:outline-none placeholder:text-gray-300 font-bold tracking-tight"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-100 dark:bg-white/5 mx-2" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/10 rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, i) => (
              <motion.button
                key={product.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelect(product)}
                className="w-full flex items-center gap-6 p-6 hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-all group border-b border-gray-100 dark:border-white/5 last:border-0"
              >
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 flex-shrink-0">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-black dark:text-white truncate mb-0.5">{product.name}</h4>
                  <p className="font-mono text-[10px] text-gray-500 font-bold uppercase tracking-[0.1em]">SKU: {product.sku}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
