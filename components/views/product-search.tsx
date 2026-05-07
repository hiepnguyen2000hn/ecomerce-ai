'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import { Product } from '@/lib/mock-data';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import { TextAnimate } from '@/components/animate-ui/text-animate';

interface ProductSearchProps {
  onSelectProduct: (product: Product) => void;
}

import { useProducts } from '@/lib/hooks/use-products';

export function ProductSearch({ onSelectProduct }: ProductSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const { data: products = [], isLoading } = useProducts();
  
  const filteredProducts = query 
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
    : products.slice(0, 3);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.24))] bg-brand-bg dark:bg-[#080808] px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl text-center mb-16"
      >
        <motion.div 
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center p-6 bg-white dark:bg-white rounded-full mb-10 shadow-2xl shadow-blue-500/20"
        >
          <Search size={36} className="text-black" />
        </motion.div>
        
        <TextAnimate 
          text={t('products.select_product').toUpperCase()}
          type="word"
          animation="slide-up"
          className="text-6xl font-display font-black text-black dark:text-white uppercase tracking-tighter leading-none mb-2"
        />
        <br />
        <TextAnimate 
          text={t('products.to_begin').toUpperCase()}
          type="word"
          animation="blur-in"
          delay={0.4}
          className="text-6xl font-display font-black text-black dark:text-white uppercase tracking-tighter leading-none mb-6 stroke-text"
        />
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-gray-500 max-w-sm mx-auto text-sm font-bold uppercase tracking-widest leading-relaxed mt-4"
        >
          Enter SKU or Product Name to access existing assets or generate new ones.
        </motion.p>
      </motion.div>

      <motion.div 
        layout
        className="w-full max-w-2xl bg-white dark:bg-[#0c0c0c] rounded-[40px] border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5 dark:shadow-black/50 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
          <div className="relative flex items-center group">
            <span className="absolute left-8 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
              <Search size={22} />
            </span>
            <input 
              type="text"
              placeholder={t('products.search_catalog').toUpperCase()}
              className="w-full py-8 pl-18 pr-10 bg-transparent text-xl border-none focus:ring-0 focus:outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700 font-black tracking-tighter uppercase text-black dark:text-white"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="w-8 h-8 border-2 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-700 uppercase tracking-[0.3em]">{t('common.loading')}</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, i) => (
                <motion.button
                  key={product.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onSelectProduct(product)}
                  className="w-full flex items-center gap-6 p-8 hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-all group border-b border-gray-100 dark:border-white/5 last:border-0"
                >
                  <div className="relative w-16 h-16 rounded-[20px] overflow-hidden bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 flex-shrink-0">
                    <Image 
                      src={product.image} 
                      alt={product.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-black text-black dark:text-white uppercase tracking-tight truncate mb-1">{product.name}</h4>
                    <p className="font-mono text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{t('products.sku')}: {product.sku}</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 dark:text-gray-700 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                </motion.button>
              ))}
            </AnimatePresence>
          )}
          
          {!isLoading && filteredProducts.length === 0 && (
            <div className="p-16 text-center text-gray-400 dark:text-gray-700 font-black uppercase tracking-[0.3em] text-xs">
              {t('common.no_results')}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
