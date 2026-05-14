'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Grid2X2, List, ExternalLink,
  ChevronLeft, ChevronRight, AlertCircle, Plus, X, Check, RotateCcw
} from 'lucide-react';
import type { ApiProduct, LifecycleStage, ProductStatus } from '@/lib/api/types';
import { staticUrl } from '@/lib/api/config';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { SlidingNumber } from '@/components/animate-ui/sliding-number';
import { useProducts } from '@/lib/hooks/use-products';
import type { ProductsListParams } from '@/lib/api/types';

interface ProductListProps {
  onEditProduct: (product: ApiProduct) => void;
  onCreateProduct: () => void;
}

const LIFECYCLE_STAGES: LifecycleStage[] = ['DRAFT', 'TESTING', 'SCALING', 'MATURE', 'STOPPED'];
const STATUS_OPTIONS: ProductStatus[] = ['ACTIVE', 'LOW_STOCK', 'OUT_OF_STOCK'];
const SORT_OPTIONS = [
  { value: '',           label: 'Default' },
  { value: 'name',      label: 'Name A → Z' },
  { value: '-name',     label: 'Name Z → A' },
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
];

const STATUS_COLORS: Record<ProductStatus, string> = {
  ACTIVE:       'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  LOW_STOCK:    'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  OUT_OF_STOCK: 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400',
};

function MultiChip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
        active
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'border-gray-100 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20',
      )}
    >
      {active && <Check size={10} strokeWidth={3} />}
      {label}
    </button>
  );
}

export function ProductList({ onEditProduct, onCreateProduct }: ProductListProps) {
  const { t } = useTranslation();

  // ── Search (debounced) ──
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(searchInput), 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  // ── Quick lifecycle tab ──
  const [activeLifecycle, setActiveLifecycle] = useState<'All' | LifecycleStage>('All');

  // ── Advanced filter panel state ──
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus[]>([]);
  const [marketInput, setMarketInput] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // active filters count badge
  const activeFilterCount = [
    sort !== '',
    statusFilter.length > 0,
    marketInput.trim() !== '',
    includeDeleted,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSort('');
    setStatusFilter([]);
    setMarketInput('');
    setIncludeDeleted(false);
  };

  // ── Build API params ──
  const params: ProductsListParams = {
    q:              debouncedQ || undefined,
    sort:           sort || undefined,
    lifecycleStage: activeLifecycle !== 'All' ? [activeLifecycle] : undefined,
    status:         statusFilter.length > 0 ? statusFilter : undefined,
    market:         marketInput.trim()
                      ? marketInput.split(',').map(m => m.trim()).filter(Boolean)
                      : undefined,
    includeDeleted: includeDeleted || undefined,
  };

  const { data: products = [], isLoading, error } = useProducts(params);

  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

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
      {/* ── Toolbar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto_auto] gap-6 mb-12">

        {/* Search */}
        <div className="relative flex items-center group">
          <Search size={16} className="absolute left-5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder={t('products.search_catalog').toUpperCase()}
            className="w-full bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 py-3 pl-14 pr-10 rounded-2xl focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 transition-all text-[10px] font-bold uppercase tracking-widest placeholder:text-gray-400 dark:placeholder:text-gray-600 text-black dark:text-white"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-4 text-gray-400 hover:text-black dark:hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Advanced Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-6 py-4 bg-white dark:bg-[#121212] border rounded-2xl text-xs font-black uppercase tracking-widest transition-all group',
              showFilters || activeFilterCount > 0
                ? 'border-blue-600 text-blue-600'
                : 'border-gray-100 dark:border-white/5 text-gray-400 hover:text-black dark:hover:text-white',
            )}
          >
            <Filter size={18} className={cn('transition-colors', showFilters || activeFilterCount > 0 ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500')} />
            <span>{t('common.advanced_filter')}</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showFilters && (
              <>
                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowFilters(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 rounded-[28px] shadow-2xl z-50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 dark:border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white">Filters</span>
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                    >
                      <RotateCcw size={11} />
                      Reset
                    </button>
                  </div>

                  <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">

                    {/* Sort */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Sort by</label>
                      <div className="grid grid-cols-1 gap-1.5">
                        {SORT_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setSort(opt.value)}
                            className={cn(
                              'flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left',
                              sort === opt.value
                                ? 'bg-black dark:bg-white text-white dark:text-black'
                                : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10',
                            )}
                          >
                            {opt.label}
                            {sort === opt.value && <Check size={12} strokeWidth={3} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Stock Status</label>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map(s => (
                          <MultiChip
                            key={s}
                            label={s.replace('_', ' ')}
                            active={statusFilter.includes(s)}
                            onClick={() =>
                              setStatusFilter(prev =>
                                prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s],
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* Market codes */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">
                        Market Codes
                        <span className="ml-2 text-gray-300 normal-case font-medium tracking-normal">comma-separated</span>
                      </label>
                      <input
                        type="text"
                        value={marketInput}
                        onChange={e => setMarketInput(e.target.value)}
                        placeholder="RO, SK, DE..."
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-600/30 rounded-xl text-xs font-mono font-bold uppercase tracking-widest text-black dark:text-white outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                      />
                      {marketInput.trim() && (
                        <div className="flex flex-wrap gap-1.5">
                          {marketInput.split(',').map(m => m.trim()).filter(Boolean).map(m => (
                            <span key={m} className="px-2 py-1 bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Include Deleted */}
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-xs font-black text-black dark:text-white">Include Deleted</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">Show soft-deleted products</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIncludeDeleted(p => !p)}
                        className={cn(
                          'relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none',
                          includeDeleted ? 'bg-blue-600' : 'bg-gray-200 dark:bg-white/10',
                        )}
                      >
                        <motion.div
                          animate={{ x: includeDeleted ? 20 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Apply footer */}
                  <div className="px-5 pb-5">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                    >
                      Apply Filters
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Layout toggle */}
        <div className="flex p-1.5 bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-2xl">
          <button
            onClick={() => setViewLayout('grid')}
            className={cn('p-2.5 rounded-xl transition-all', viewLayout === 'grid' ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-gray-400 hover:text-black dark:hover:text-white')}
          >
            <Grid2X2 size={18} />
          </button>
          <button
            onClick={() => setViewLayout('list')}
            className={cn('p-2.5 rounded-xl transition-all', viewLayout === 'list' ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-gray-400 hover:text-black dark:hover:text-white')}
          >
            <List size={18} />
          </button>
        </div>

        {/* Create button */}
        <button
          onClick={onCreateProduct}
          className="flex items-center gap-2 px-6 py-3.5 bg-[#1D4ED8] hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all whitespace-nowrap"
        >
          <Plus size={16} />
          New Product
        </button>
      </div>

      {/* ── Lifecycle quick tabs ── */}
      <div className="space-y-6 mb-16">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-700 uppercase tracking-[0.3em] mr-4 flex-shrink-0">{t('common.lifecycle_status')}</span>
          {(['All', ...LIFECYCLE_STAGES] as const).map(stage => (
            <button
              key={stage}
              onClick={() => setActiveLifecycle(stage)}
              className={cn(
                'px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap',
                activeLifecycle === stage
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600',
              )}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* ── Product grid / list ── */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Search size={28} className="opacity-40" />
          </div>
          <p className="text-sm font-black uppercase tracking-widest">No products found</p>
          <p className="text-xs font-medium mt-2 opacity-60">Try adjusting your filters</p>
        </div>
      ) : (
        <div className={cn('grid gap-10', viewLayout === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
          <AnimatePresence mode="popLayout">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
                className={cn(
                  'bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 rounded-[40px] overflow-hidden group hover:border-black/20 dark:hover:border-white/20 transition-all duration-500 flex flex-col shadow-sm dark:shadow-none',
                  viewLayout === 'list' && 'flex-row h-40 md:h-48',
                )}
              >
                <div className={cn('p-8 pb-0 flex items-start justify-between shrink-0', viewLayout === 'list' && 'hidden')}>
                  <div className="flex flex-col gap-3">
                    <div className="font-mono text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest">{p.sku}</div>
                    <div className="flex gap-2 flex-wrap">
                      <span className={cn(
                        'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm',
                        p.lifecycleStage === 'SCALING' ? 'bg-blue-600 text-white' :
                        p.lifecycleStage === 'TESTING' ? 'bg-black dark:bg-white text-white dark:text-black' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
                      )}>
                        {p.lifecycleStage}
                      </span>
                      {p.status && (
                        <span className={cn('px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest', STATUS_COLORS[p.status])}>
                          {p.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={cn('p-8 flex-1 flex flex-col', viewLayout === 'list' && 'flex-row items-center p-6 gap-8 pb-6')}>
                  <div className={cn(
                    'relative rounded-[32px] overflow-hidden bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 shrink-0',
                    viewLayout === 'grid' ? 'w-full aspect-[16/10] mb-10' : 'w-32 h-32 md:w-40 md:h-40',
                  )}>
                    <Image
                      src={staticUrl(p.primaryImageUrl) || `https://picsum.photos/seed/${p.sku}/800/800`}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out grayscale group-hover:grayscale-0"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col h-full">
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1 min-w-0 flex flex-col">
                        {viewLayout === 'list' && (
                          <div className="font-mono text-[8px] text-gray-400 uppercase tracking-[0.2em] mb-1">{p.sku}</div>
                        )}
                        <h3 className={cn(
                          'font-display font-black text-black dark:text-white leading-none tracking-tighter uppercase group-hover:text-blue-500 transition-colors truncate',
                          viewLayout === 'grid' ? 'text-3xl mb-4' : 'text-xl md:text-2xl mb-2',
                        )}>{p.name}</h3>
                        <p className={cn('text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium', viewLayout === 'grid' ? 'mb-8' : 'hidden md:block')}>
                          {p.description}
                        </p>

                        {viewLayout === 'list' && (
                          <div className="mt-auto flex items-center gap-4 flex-wrap">
                            <span className={cn(
                              'px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest',
                              p.lifecycleStage === 'SCALING' ? 'bg-blue-600 text-white' :
                              p.lifecycleStage === 'TESTING' ? 'bg-black dark:bg-white text-white dark:text-black' :
                              'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
                            )}>
                              {p.lifecycleStage}
                            </span>
                            {p.status && (
                              <span className={cn('px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest', STATUS_COLORS[p.status])}>
                                {p.status.replace('_', ' ')}
                              </span>
                            )}
                            {p.marketCodes && p.marketCodes.length > 0 && (
                              <>
                                <div className="h-4 w-px bg-gray-100 dark:bg-white/5" />
                                <span className="text-[9px] font-mono font-bold text-gray-400">{p.marketCodes.join(', ')}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {viewLayout === 'list' && (
                        <button
                          onClick={() => onEditProduct(p)}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all transform group-hover:rotate-45 shadow-xl shadow-black/10 shrink-0 self-center"
                        >
                          <ExternalLink size={18} />
                        </button>
                      )}
                    </div>

                    {viewLayout === 'grid' && (
                      <div className="mt-auto flex items-center justify-between pt-8 border-t border-gray-100 dark:border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-1">{t('common.available_variants')}</span>
                          <span className="text-xs font-mono text-gray-500">
                            {p.variants && p.variants.length > 0
                              ? p.variants.map(v => v.sku).join(', ')
                              : '—'}
                          </span>
                        </div>
                        <button
                          onClick={() => onEditProduct(p)}
                          className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all transform group-hover:rotate-45 shadow-xl shadow-black/10"
                        >
                          <ExternalLink size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Pagination ── */}
      <div className="mt-24 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">{t('common.showing')}</p>
          <SlidingNumber value={products.length} className="text-xs font-black text-black dark:text-white" />
          <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">{t('common.products').toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-3 text-black dark:text-white">
          <button className="p-3 border border-gray-100 dark:border-white/5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all">
            <ChevronLeft size={16} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-full font-black text-xs">1</button>
          <button className="p-3 border border-gray-100 dark:border-white/5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
