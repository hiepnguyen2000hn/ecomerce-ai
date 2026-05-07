'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  ChevronDown, 
  HardDrive, 
  CheckCircle2, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface BatchGenerationModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function BatchGenerationModal({ product, isOpen, onClose, onConfirm }: BatchGenerationModalProps) {
  const { t } = useTranslation();
  const [source, setSource] = useState<'ai' | 'drive'>('ai');
  const [strategy, setStrategy] = useState<'auto' | 'manual'>('auto');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const templates = [
    { id: 'modern', name: 'Modern Minimalist', cvr: '4.8%', image: 'https://picsum.photos/seed/lp1/400/300' },
    { id: 'sales', name: 'High-Conv Sales', cvr: '5.2%', image: 'https://picsum.photos/seed/lp2/400/300' },
    { id: 'showcase', name: 'Product Showcase', cvr: '3.9%', image: 'https://picsum.photos/seed/lp3/400/300' },
    { id: 'luxe', name: 'Editorial Luxe', cvr: '4.1%', image: 'https://picsum.photos/seed/lp4/400/300' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-white dark:bg-[#0c0c0c] rounded-[40px] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-10 pt-10 pb-8 flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
              <Zap size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-display font-black text-black dark:text-white uppercase tracking-tight leading-none mb-1">
                {t('landing_pages.batch.title')}
              </h3>
              <p className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest">
                {t('landing_pages.batch.subtitle')} {product.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-black dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-10 pb-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Config Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                {t('landing_pages.batch.display_language')}
              </label>
              <div className="relative">
                <select className="w-full bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold appearance-none outline-none">
                  <option>English (US)</option>
                  <option>Vietnamese</option>
                  <option>Japanese</option>
                </select>
                <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                {t('landing_pages.batch.number_of_lps')}
              </label>
              <input 
                type="number" 
                defaultValue={3}
                className="w-full bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
              />
            </div>
          </div>

          {/* Source Selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
              {t('landing_pages.batch.source_selection')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'ai', icon: Zap, title: t('landing_pages.batch.one_click'), desc: t('landing_pages.batch.one_click_desc') },
                { id: 'drive', icon: HardDrive, title: t('landing_pages.batch.google_drive'), desc: t('landing_pages.batch.google_drive_desc') }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setSource(item.id as any)}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-3xl border-2 transition-all text-left",
                    source === item.id 
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-600/5" 
                      : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    source === item.id ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-400"
                  )}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-black dark:text-white uppercase tracking-tight">{item.title}</h4>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Strategy & Templates */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
              {t('landing_pages.batch.template_strategy')}
            </label>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { id: 'auto', title: t('landing_pages.batch.opt_a'), desc: t('landing_pages.batch.opt_a_desc') },
                { id: 'manual', title: t('landing_pages.batch.opt_b'), desc: t('landing_pages.batch.opt_b_desc') }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setStrategy(item.id as any)}
                  className={cn(
                    "p-6 rounded-3xl border-2 transition-all text-left relative",
                    strategy === item.id 
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-600/5 shadow-xl shadow-indigo-600/5" 
                      : "border-gray-100 dark:border-white/5"
                  )}
                >
                  <h4 className="text-sm font-black text-black dark:text-white uppercase tracking-tight mb-2 pr-8">{item.title}</h4>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest leading-relaxed">{item.desc}</p>
                  {strategy === item.id && (
                    <div className="absolute top-6 right-6 text-indigo-600">
                      <CheckCircle2 size={20} fill="currentColor" className="text-indigo-600" style={{ color: 'white' }} />
                      <CheckCircle2 size={20} className="absolute inset-0" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {strategy === 'manual' && (
              <div className="grid grid-cols-2 gap-4">
                {templates.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={cn(
                      "group bg-white dark:bg-black/20 border rounded-3xl overflow-hidden transition-all",
                      selectedTemplate === tpl.id ? "border-indigo-600" : "border-gray-100 dark:border-white/5"
                    )}
                  >
                    <div className="relative aspect-[16/10]">
                      <Image src={tpl.image} alt={tpl.name} fill className="object-cover" />
                      <div className="absolute top-3 right-3 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full text-[9px] font-black text-white">
                        CVR {tpl.cvr}
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-tight">{tpl.name}</span>
                      {selectedTemplate === tpl.id && <CheckCircle2 size={16} className="text-indigo-600" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="px-10 pb-10">
          <button 
            onClick={onConfirm}
            className="w-full h-20 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-sm overflow-hidden relative group transition-all"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="relative flex items-center justify-center gap-4">
              {t('landing_pages.batch.create_button')}
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
