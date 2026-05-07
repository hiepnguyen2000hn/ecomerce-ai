'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Filter, 
  Grid2X2, 
  List, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Product } from '@/lib/mock-data';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ProductListProps {
  onEditProduct: (product: Product) => void;
}

import { TextAnimate } from '@/components/animate-ui/text-animate';
import { SlidingNumber } from '@/components/animate-ui/sliding-number';

import { useProducts } from '@/lib/hooks/use-products';

export function ProductList({ onEditProduct }: ProductListProps) {
  const { t } = useTranslation();
  const [activeStatus, setActiveStatus] = useState('All');
  const { data: products = [], isLoading, error } = useProducts();

  const STATUS_FILTERS = ['All', 'Draft', 'Testing', 'Scaling', 'Mature', 'Stopped'];

  const filteredProducts = products.filter(p => {
    const statusMatch = activeStatus === 'All' || p.status === activeStatus;
    return statusMatch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin" />
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[32px] text-center max-w-sm">
          <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-black text-black dark:text-white uppercase mb-2">{t('common.error')}</h3>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-tight leading-relaxed">
            Unable to connect to the global inventory system. Please verify your connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-12 py-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div className="flex flex-col">
          <TextAnimate 
            text={t('products.inventory')}
            type="word"
            animation="slide-up"
            className="text-[80px] lg:text-[120px] leading-[0.85] font-display font-black tracking-tighter uppercase text-left p-0 text-black dark:text-white"
          />
          <TextAnimate 
            text={t('products.management')}
            type="word"
            animation="blur-in"
            delay={0.2}
            className="text-[80px] lg:text-[120px] leading-[0.85] font-display font-black tracking-tighter uppercase text-left p-0 stroke-text"
          />
        </div>
        <div className="flex flex-col items-start md:items-end gap-6 max-w-sm">
          <p className="text-gray-500 text-left md:text-right text-sm font-medium leading-relaxed">
            Configure your global product catalog with advanced variant controls and real-time inventory tracking.
          </p>
          <button className="bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest py-3.5 px-8 rounded-full transition-all hover:opacity-80 shadow-xl shadow-black/5 dark:shadow-white/5 flex items-center gap-2 text-xs">
            <Plus size={18} />
            <span>Add Manual Product</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-6 mb-12">
        <div className="relative flex items-center group">
          <Search size={20} className="absolute left-6 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
          <input 
            type="text" 
            placeholder={t('products.search_catalog').toUpperCase()}
            className="w-full bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 py-4 pl-16 pr-6 rounded-2xl focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 transition-all text-xs font-bold uppercase tracking-widest placeholder:text-gray-400 dark:placeholder:text-gray-600 text-black dark:text-white"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white hover:border-black/10 dark:hover:border-white/20 transition-all group">
          <Filter size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span>Advanced Filter</span>
        </button>
        <div className="flex p-1.5 bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-2xl">
          <button className="p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl">
            <Grid2X2 size={18} />
          </button>
          <button className="p-2.5 text-gray-400 hover:text-black dark:hover:text-white">
            <List size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-6 mb-16">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-700 uppercase tracking-[0.3em] mr-4 flex-shrink-0">Lifecyle Status</span>
          {STATUS_FILTERS.map(status => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap",
                activeStatus === status 
                  ? "bg-blue-600 text-white" 
                  : "bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
              className="bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 rounded-[40px] overflow-hidden group hover:border-black/20 dark:hover:border-white/20 transition-all duration-500 flex flex-col h-full shadow-sm dark:shadow-none"
            >
              <div className="p-8 pb-0 flex items-start justify-between">
                <div className="flex flex-col gap-3">
                  <div className="font-mono text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest">{p.sku}</div>
                  <div className="flex gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                      p.status === 'Scaling' ? "bg-blue-600 text-white" :
                      p.status === 'Testing' ? "bg-black dark:bg-white text-white dark:text-black" :
                      "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    )}>
                      {p.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="relative w-full aspect-[16/10] rounded-[32px] overflow-hidden mb-10 bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5">
                  <Image 
                    src={p.image} 
                    alt={p.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out grayscale group-hover:grayscale-0" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-3xl font-display font-black text-black dark:text-white mb-4 leading-none tracking-tighter uppercase group-hover:text-blue-500 transition-colors">{p.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-8 leading-relaxed font-medium">
                    {p.description}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-8 border-t border-gray-100 dark:border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-1">Available Variants</span>
                      <span className="text-xs font-mono text-gray-500">RED, ORANGE, BLUE</span>
                    </div>
                    <button 
                      onClick={() => onEditProduct(p)}
                      className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all transform group-hover:rotate-45 shadow-xl shadow-black/10"
                    >
                      <ExternalLink size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-24 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">Showing</p>
          <SlidingNumber value={filteredProducts.length} className="text-xs font-black text-black dark:text-white" />
          <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">of 124 PRODUCTS</p>
        </div>
        <div className="flex items-center gap-3 text-black dark:text-white">
          <button className="p-3 border border-gray-100 dark:border-white/5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all transition-colors"><ChevronLeft size={16} /></button>
          <button className="w-10 h-10 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-full font-black text-xs">1</button>
          <button className="w-10 h-10 flex items-center justify-center border border-gray-100 dark:border-white/5 text-gray-500 rounded-full font-black text-xs hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all">2</button>
          <button className="p-3 border border-gray-100 dark:border-white/5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
