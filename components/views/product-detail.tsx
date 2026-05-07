'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Sparkles, 
  Image as ImageIcon,
  ChevronLeft
} from 'lucide-react';
import { Product } from '@/lib/mock-data';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

import { TextAnimate } from '@/components/animate-ui/text-animate';
import { InteractiveHoverButton } from '@/components/animate-ui/interactive-hover-button';

import { useUpdateProduct } from '@/lib/hooks/use-products';

export function ProductDetail({ product, onBack }: ProductDetailProps) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(0);
  const updateMutation = useUpdateProduct();
  const images = [product.image, 'https://picsum.photos/id/21/800/800', 'https://picsum.photos/id/22/800/800'];

  const handleSave = () => {
    updateMutation.mutate({ 
      id: product.id, 
      updates: { name: product.name } // Example update
    }, {
      onSuccess: () => {
        onBack();
      }
    });
  };

  return (
    <div className="px-12 py-12">
      <div className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">
              <span>{t('products.management')}</span>
              <span className="text-gray-300 dark:text-gray-800">/</span>
              <span className="text-black dark:text-white">{product.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <button 
            disabled={updateMutation.isPending}
            onClick={onBack}
            className="text-[10px] font-black text-gray-400 hover:text-black dark:hover:text-white uppercase tracking-[0.2em] transition-all disabled:opacity-50"
          >
            {t('common.discard')}
          </button>
          <InteractiveHoverButton 
            className="px-12" 
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? t('common.loading') : t('common.save')}
          </InteractiveHoverButton>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_500px] gap-10 items-start">
        <div className="space-y-10">
          <div className="bg-white dark:bg-[#0c0c0c] rounded-[48px] border border-gray-100 dark:border-white/5 p-10 shadow-sm dark:shadow-none">
            <div className="relative w-full aspect-square rounded-[40px] overflow-hidden bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 mb-10 overflow-hidden group">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full"
              >
                <Image 
                  src={images[selectedImage]} 
                  alt={product.name} 
                  fill 
                  className="object-contain p-12 grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>
            
            <div className="flex items-center gap-6">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative w-24 h-24 rounded-3xl overflow-hidden border-2 transition-all p-1",
                    selectedImage === i ? "border-black dark:border-white bg-black/5 dark:bg-white/10" : "border-gray-100 dark:border-white/5 opacity-40 hover:opacity-100"
                  )}
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden">
                    <Image src={img} alt="" fill className="object-cover grayscale" referrerPolicy="no-referrer" />
                  </div>
                </button>
              ))}
              <button className="flex flex-col items-center justify-center w-24 h-24 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all gap-2">
                <ImageIcon size={24} />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c0c0c] rounded-[48px] border border-gray-100 dark:border-white/5 p-10 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-black text-black dark:text-white uppercase tracking-tighter text-xl">{t('products.variant_groups')}</h3>
              <button className="text-white dark:text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-2 px-4 py-2 bg-black dark:bg-white rounded-full hover:opacity-80 transition-all">
                <Plus size={14} />
                {t('products.add_variant')}
              </button>
            </div>
            
            <div className="space-y-6">
              {[1].map((group) => (
                <div key={group} className="p-8 bg-gray-50/50 dark:bg-black/20 rounded-[40px] border border-gray-100 dark:border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-xs font-black text-black dark:text-white uppercase tracking-widest">Group #{group}</h4>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Gold Clasp Edition', code: '18K', price: '15.00', qty: '450 units' },
                      { label: 'Silver Clasp Edition', code: 'AG', price: '12.00', qty: '1,200 units' }
                    ].map((v, i) => (
                      <div key={i} className="flex items-center gap-6 bg-white dark:bg-[#080808] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 group hover:border-black/20 dark:hover:border-white/20 transition-all">
                        <div className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center font-black text-sm tracking-tighter shadow-lg">
                          {v.code}
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-black text-black dark:text-white uppercase tracking-tight">{v.label}</h5>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{t('products.stock')}: {v.qty}</p>
                        </div>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs">$</span>
                          <input 
                            type="text" 
                            defaultValue={v.price}
                            className="w-28 pl-8 pr-4 py-3 bg-gray-50 dark:bg-black border border-gray-100 dark:border-white/5 rounded-xl text-sm font-black text-black dark:text-white focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <button className="w-full py-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[32px] text-gray-400 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all">
                <Plus size={20} />
                {t('products.new_variant_group')}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-10 sticky top-32">
          <div className="bg-white dark:bg-[#0c0c0c] rounded-[48px] border border-gray-100 dark:border-white/5 p-10 shadow-sm dark:shadow-none">
            <div className="space-y-10">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em]">{t('products.product_name')}</label>
                <TextAnimate 
                  text={product.name}
                  type="char"
                  animation="blur-in"
                  className="text-4xl font-display font-black text-black dark:text-white uppercase tracking-tighter leading-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em]">{t('products.sku')}</label>
                <div className="bg-gray-50 dark:bg-white/5 px-6 py-4 rounded-2xl border border-gray-100 dark:border-white/5">
                  <span className="text-black dark:text-white font-mono text-sm font-black tracking-widest">{product.sku}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em]">{t('products.description')}</label>
                  <button className="text-[9px] font-black text-white dark:text-black uppercase tracking-widest flex items-center gap-2 bg-black dark:bg-white px-3 py-1.5 rounded-full hover:opacity-80 transition-all">
                    <Sparkles size={12} />
                    {t('products.ai_polish')}
                  </button>
                </div>
                <div className="relative">
                  <textarea 
                    className="w-full bg-gray-50 dark:bg-black border border-gray-100 dark:border-white/5 rounded-[32px] p-8 text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed min-h-[400px] focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 resize-none no-scrollbar"
                    defaultValue={product.description}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
