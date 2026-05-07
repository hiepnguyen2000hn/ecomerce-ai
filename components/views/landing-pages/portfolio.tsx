'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, ExternalLink, Users, BarChart3, Clock } from 'lucide-react';
import { MOCK_LANDING_PAGES, MOCK_PRODUCTS, LandingPage } from '@/lib/mock-data';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface LandingPagePortfolioProps {
  onSelectPage: (lp: LandingPage) => void;
  onCreateNew: () => void;
}

export function LandingPagePortfolio({ onSelectPage, onCreateNew }: LandingPagePortfolioProps) {
  const { t } = useTranslation();

  return (
    <div className="p-12 space-y-8">
      {/* Search & Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder={t('landing_pages.search_placeholder')} 
              className="w-full py-3.5 pl-12 pr-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black/10 dark:focus:border-white/10 rounded-2xl outline-none text-sm font-medium transition-all"
            />
          </div>
          <button className="p-3.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-2xl border border-transparent transition-all">
            <Filter size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-white text-black rounded-2xl font-bold text-sm shadow-xl shadow-black/5 hover:scale-105 active:scale-95 transition-all">
            <Plus size={18} />
            <span>{t('landing_pages.import_html')}</span>
          </button>
          <button 
            onClick={onCreateNew}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} />
            <span>{t('landing_pages.create_new')}</span>
          </button>
        </div>
      </div>

      {/* Portfolio Table */}
      <div className="bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-50 dark:border-white/5">
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('landing_pages.table.status')}</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('landing_pages.table.config')}</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('landing_pages.table.traffic')}</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('landing_pages.table.conversion')}</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('landing_pages.table.created')}</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LANDING_PAGES.map((lp) => {
              const product = MOCK_PRODUCTS.find(p => p.id === lp.productId);
              return (
                <tr 
                  key={lp.id} 
                  onClick={() => onSelectPage(lp)}
                  className="group hover:bg-gray-50/50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="px-8 py-8">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      lp.status === 'Needs Review' ? "bg-amber-100/50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" : "bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    )}>
                      • {lp.status}
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/10 shrink-0">
                        {product && (
                          <Image 
                            src={product.image} 
                            alt={product.name} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-blue-500 font-mono text-xs font-bold hover:underline">
                        <span>{lp.slug}</span>
                        <ExternalLink size={12} />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-black dark:text-white flex items-center gap-1.5">
                        {lp.traffic.users.toLocaleString()}
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Users</span>
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 italic mt-0.5">{lp.traffic.views.toLocaleString()} Total views</span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-black dark:text-white">{lp.conversion.cvr}%</span>
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          lp.conversion.cvr > 4 ? "bg-emerald-500" : "bg-amber-500"
                        )} />
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 italic mt-0.5">CPA: ${lp.conversion.cpa}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-gray-400">
                      <Clock size={12} strokeWidth={2.5} />
                      <span>{lp.createdAt}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
