'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ExternalLink, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Sparkles, 
  RefreshCw,
  Plus,
  Send,
  Eye,
  Settings2,
  ChevronDown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product, MOCK_PRODUCTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LandingPageEditorProps {
  productId: string;
  onBack: () => void;
}

export function LandingPageEditor({ productId, onBack }: LandingPageEditorProps) {
  const { t } = useTranslation();
  const product = MOCK_PRODUCTS.find(p => p.id === productId);
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  if (!product) return null;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-black">
      {/* Top Header */}
      <div className="h-20 bg-white dark:bg-[#0c0c0c] border-b border-gray-100 dark:border-white/5 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-display font-black text-black dark:text-white uppercase tracking-tight">Edit: lp-v1-msg</h3>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">
                <Image src={product.image} alt={product.name} width={16} height={16} className="rounded-sm" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{product.sku}</span>
              </div>
            </div>
            <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1.5 mt-0.5 tracking-wider">
              https://levelup.cdn/lp-v1-msg
              <ExternalLink size={10} />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
            {t('editor.export')}
          </button>
          <button className="px-6 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
            {t('editor.draft')}
          </button>
          <button className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
            {t('editor.publish')}
          </button>
        </div>
      </div>

      {/* Sub Header (Devices & Lang) */}
      <div className="h-16 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Romania
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Tiếng Việt
          </button>
        </div>

        <div className="flex p-1 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
          {[
            { id: 'desktop', icon: Monitor },
            { id: 'tablet', icon: Tablet },
            { id: 'mobile', icon: Smartphone }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setDevice(item.id as any)}
              className={cn(
                "p-2.5 rounded-lg flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all",
                device === item.id 
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-lg" 
                  : "text-gray-400 hover:text-black dark:hover:text-white"
              )}
            >
              <item.icon size={16} />
              {item.id}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Central Canvas */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className={cn(
            "mx-auto bg-white dark:bg-[#0c0c0c] shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5",
            device === 'desktop' ? "w-full max-w-5xl aspect-[16/10]" : 
            device === 'tablet' ? "w-[600px] h-[800px]" : "w-[375px] h-[667px]"
          )}>
            {/* Landing Page Content Simulation */}
            <div className="p-16 space-y-12">
               {/* Label */}
               <div className="flex items-center gap-2">
                 <span className="px-2 py-1 bg-blue-600 rounded text-[8px] font-black text-white uppercase tracking-widest leading-none">Hero Section</span>
               </div>
               
               <div className="relative group/field max-w-2xl mx-auto text-center">
                  <div className="absolute -left-12 top-0 px-2 py-1 bg-blue-600 rounded text-[8px] font-black text-white ml-2 opacity-0 group-hover/field:opacity-100 transition-opacity whitespace-nowrap">H1.HEADLINE</div>
                  <div className="absolute -inset-4 border-2 border-dashed border-blue-600/50 rounded-2xl opacity-0 group-hover/field:opacity-100 transition-opacity pointer-events-none" />
                  <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-600 rounded-full opacity-0 group-hover/field:opacity-100 transition-opacity" />
                  <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-600 rounded-full opacity-0 group-hover/field:opacity-100 transition-opacity" />
                  <div className="absolute -left-1 -bottom-1 w-2 h-2 bg-blue-600 rounded-full opacity-0 group-hover/field:opacity-100 transition-opacity" />
                  <div className="absolute -right-1 -bottom-1 w-2 h-2 bg-blue-600 rounded-full opacity-0 group-hover/field:opacity-100 transition-opacity" />
                  
                  <h1 className="text-7xl font-display font-black tracking-tighter uppercase leading-[0.9] text-black dark:text-white">
                    Next-Gen Recovery For High Performance Athletes
                  </h1>
               </div>

               <p className="max-w-lg mx-auto text-center text-sm font-bold text-gray-500 leading-relaxed uppercase tracking-widest">
                  The ultimate tool to elite recovery. Professional-grade percussion therapy trusted by world champions.
               </p>

               <div className="flex justify-center">
                 <button className="px-12 py-6 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-600/40 text-white font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all">
                   Shop Now - 40% OFF
                 </button>
               </div>

               <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-dashed border-indigo-100 dark:border-white/5 p-4 mt-8">
                 <Image src={product.image} alt="Hero" fill className="object-cover rounded-[1.5rem]" />
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-96 bg-white dark:bg-[#0c0c0c] border-l border-gray-100 dark:border-white/5 flex flex-col shrink-0">
          <div className="p-8 space-y-10 overflow-y-auto flex-1 no-scrollbar">
            {/* AI Optimizer */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-indigo-600" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">AI Optimizer</h4>
              </div>

              <div className="p-6 bg-indigo-50 dark:bg-indigo-600/5 rounded-[2rem] border border-indigo-100 dark:border-indigo-600/20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">CVR Insight</p>
                </div>
                <p className="text-xs font-bold leading-relaxed text-indigo-950 dark:text-indigo-200">
                  Dựa trên <span className="text-indigo-600 dark:text-indigo-400 font-black">CVR 4.8%</span>, hãy tập trung vào <span className="underline decoration-indigo-600 text-indigo-600 dark:text-indigo-400 font-black">Tốc độ phục hồi</span>.
                </p>
                <button className="w-full py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all">
                  <RefreshCw size={14} />
                  Rewrite with AI
                </button>
              </div>
            </div>

            {/* AI Editor Input */}
            <div className="space-y-6 pt-10 border-t border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <Settings2 size={18} className="text-gray-400" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">AI Editor</h4>
              </div>

              <div className="relative group">
                <textarea 
                  placeholder="Which content do you want to update?"
                  className="w-full h-40 bg-gray-50 dark:bg-white/5 rounded-3xl p-6 text-sm font-bold border border-transparent focus:border-indigo-600 transition-all outline-none resize-none no-scrollbar placeholder:text-gray-300"
                />
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-gray-100 dark:border-white/5">
            <button className="w-full py-6 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-black/10">
              <Settings2 size={18} />
              Section Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
