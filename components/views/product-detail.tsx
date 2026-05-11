'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Sparkles,
  Image as ImageIcon,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import type { ApiProduct } from '@/lib/api/types';
import { staticUrl } from '@/lib/api/config';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useUpdateProduct } from '@/lib/hooks/use-products';
import { showToast } from '@/lib/toast';

interface ProductDetailProps {
  product: ApiProduct;
  onBack: () => void;
}

export function ProductDetail({ product, onBack }: ProductDetailProps) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(0);
  const updateMutation = useUpdateProduct();

  const images = product.images && product.images.length > 0
    ? product.images.map(img => staticUrl(img.url))
    : [staticUrl(product.primaryImageUrl) || `https://picsum.photos/seed/${product.sku}/800/800`];

  const totalStock = product.variants?.reduce((sum, v) => sum + v.stockQty, 0) ?? 0;

  const handleSave = () => {
    updateMutation.mutate({
      id: product.id,
      updates: { name: product.name }
    }, {
      onSuccess: () => {
        showToast.success(t('common.save'), `${product.name} updated successfully.`);
        onBack();
      },
      onError: (err) => {
        showToast.error(t('common.error'), err.message);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc] dark:bg-[#050505] overflow-y-auto no-scrollbar">
      {/* Header / Breadcrumbs */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-10 py-6 bg-[#f8f9fc]/80 dark:bg-[#050505]/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
          <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors" onClick={onBack}>
            {t('nav.products')}
          </span>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-black dark:text-white font-bold">{product.name}</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white uppercase tracking-widest transition-all"
          >
            {t('common.discard')}
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-8 py-3 bg-[#1D4ED8] hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {updateMutation.isPending ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>

      <div className="px-10 pb-20 grid grid-cols-1 xl:grid-cols-[1fr_550px] gap-12 items-start">
        {/* Left Column: Visuals */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#0c0c0c] rounded-[40px] border border-gray-100 dark:border-white/5 p-12 shadow-sm dark:shadow-none"
          >
            <div className="relative w-full aspect-square rounded-[32px] overflow-hidden bg-[#fafbfc] dark:bg-black/40 border border-gray-50 dark:border-white/5 group">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full p-8"
              >
                {images[selectedImage] ? (
                  <Image
                    src={images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={48} />
                  </div>
                )}
              </motion.div>
            </div>

            <div className="flex items-center gap-4 mt-8 flex-wrap">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-0.5 shrink-0",
                    selectedImage === i ? "border-blue-600" : "border-gray-100 dark:border-white/5 opacity-60 hover:opacity-100"
                  )}
                >
                  <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-gray-50 dark:bg-black">
                    <Image src={img} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                </button>
              ))}
              <button className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-400 hover:border-blue-600 hover:text-blue-600 transition-all gap-1">
                <ImageIcon size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest">Add</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Info & Variants */}
        <div className="space-y-8">
          {/* General Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#0c0c0c] rounded-[40px] border border-gray-100 dark:border-white/5 p-10 shadow-sm dark:shadow-none space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">{t('products.product_name')}</label>
                <h2 className="text-3xl font-display font-black text-black dark:text-white uppercase tracking-tighter leading-none">
                  {product.name}
                </h2>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">{t('products.sku_reference')}</label>
                <div className="bg-[#f0f4ff] dark:bg-blue-600/10 px-6 py-4 rounded-2xl border border-blue-100 dark:border-blue-600/20">
                  <span className="text-blue-600 dark:text-blue-400 font-mono text-sm font-black tracking-widest">{product.sku}</span>
                </div>
              </div>
            </div>

            {/* Price + Stock row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">Retail Price</label>
                <p className="text-xl font-black text-black dark:text-white">
                  {product.retailPriceAmount ? `${product.retailPriceAmount} ${product.retailPriceCurrency ?? ''}` : '—'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">COGS</label>
                <p className="text-xl font-black text-black dark:text-white">
                  {product.cogsAmount ? `${product.cogsAmount} ${product.cogsCurrency ?? ''}` : '—'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">Total Stock</label>
                <p className="text-xl font-black text-black dark:text-white">{totalStock.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">{t('products.description')}</label>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-all">
                  <Sparkles size={14} className="text-blue-600" />
                  {t('products.ai_rewrite')}
                </button>
              </div>
              <div className="relative">
                <textarea
                  className="w-full bg-[#f8f9fb] dark:bg-black border border-gray-100 dark:border-white/5 rounded-[24px] p-8 text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed min-h-[160px] focus:ring-1 focus:ring-blue-600/20 outline-none transition-all resize-none no-scrollbar"
                  defaultValue={product.description ?? ''}
                />
              </div>
            </div>
          </motion.div>

          {/* Variant Groups from API */}
          {product.variantGroups && product.variantGroups.length > 0 && (
            <div className="space-y-6">
              {product.variantGroups.map((group, gi) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (gi + 1) }}
                  className="bg-white dark:bg-[#0c0c0c] rounded-[40px] border border-gray-100 dark:border-white/5 p-10 shadow-sm dark:shadow-none"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-black dark:text-white uppercase tracking-tighter text-lg">
                      {group.name}
                    </h3>
                    <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-600/10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-600/20 transition-all">
                      <Plus size={14} />
                      {t('products.add_variant')}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {group.options.map((opt) => {
                      // find matching variant for this option
                      const variant = product.variants?.find(v =>
                        Object.values(v.optionCombinationJson).includes(opt.name)
                      );
                      return (
                        <div key={opt.id} className="flex items-center gap-6 bg-[#fcfdfe] dark:bg-[#080808] p-5 rounded-[32px] border border-gray-50 dark:border-white/5 group hover:border-blue-600/10 dark:hover:border-blue-600/20 transition-all">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-[10px] tracking-tighter shadow-sm shrink-0 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 uppercase">
                            {opt.skuSuffix ?? opt.name.slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-black text-black dark:text-white uppercase tracking-tight truncate">{opt.name}</h5>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                              {variant ? `${t('products.available_units', { qty: variant.stockQty.toLocaleString() })}` : 'No variant'}
                            </p>
                          </div>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs">
                              {variant?.currency ?? product.retailPriceCurrency ?? '€'}
                            </div>
                            <input
                              type="text"
                              defaultValue={variant?.priceAmount ?? product.retailPriceAmount ?? ''}
                              className="w-28 pl-8 pr-4 py-3 bg-[#f3f6ff] dark:bg-black border border-transparent dark:border-white/5 rounded-xl text-sm font-black text-black dark:text-white focus:ring-1 focus:ring-blue-600/20 outline-none transition-all"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}

              <button className="w-full py-5 bg-white dark:bg-white/5 border-2 border-dashed border-gray-100 dark:border-white/10 rounded-[24px] text-gray-400 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] hover:border-blue-600/30 hover:text-blue-600 transition-all shadow-sm">
                <Plus size={18} />
                {t('products.add_variant_group')}
              </button>
            </div>
          )}

          {/* Markets */}
          {product.marketCodes && product.marketCodes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#0c0c0c] rounded-[40px] border border-gray-100 dark:border-white/5 p-10 shadow-sm dark:shadow-none"
            >
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4 block">Markets</label>
              <div className="flex flex-wrap gap-2">
                {product.marketCodes.map(code => (
                  <span key={code} className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">
                    {code}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
