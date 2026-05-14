'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, ExternalLink, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useLandingPages } from '@/lib/hooks/use-landing-pages';
import type { ApiLandingPage } from '@/lib/api/types';

interface LandingPagePortfolioProps {
  onSelectPage: (lp: ApiLandingPage) => void;
  onCreateNew: () => void;
}

export function LandingPagePortfolio({ onSelectPage, onCreateNew }: LandingPagePortfolioProps) {
  const { t } = useTranslation();
  const { data: landingPages = [], isLoading } = useLandingPages();

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
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm font-bold">
            Loading…
          </div>
        ) : landingPages.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm font-bold">
            No landing pages yet.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-50 dark:border-white/5">
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Slug</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Market</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Lang</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Created</th>
              </tr>
            </thead>
            <tbody>
              {landingPages.map((lp) => (
                <tr
                  key={lp.id}
                  onClick={() => onSelectPage(lp)}
                  className="group hover:bg-gray-50/50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="px-8 py-8">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      lp.status === 'PUBLISHED'    && "bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
                      lp.status === 'NEEDS_REVIEW' && "bg-amber-100/50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
                      lp.status === 'DRAFT'        && "bg-gray-100/50 text-gray-500 dark:bg-white/5 dark:text-gray-400",
                      lp.status === 'ARCHIVED'     && "bg-red-100/50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
                    )}>
                      • {lp.status}
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    <span className="flex items-center gap-1 text-blue-500 font-mono text-xs font-bold">
                      <ExternalLink size={12} />
                      {lp.slug}
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    <span className="text-xs font-mono font-bold text-black dark:text-white">{lp.marketCode}</span>
                  </td>
                  <td className="px-8 py-8">
                    <span className="text-xs font-mono font-bold text-gray-500">{lp.lang}</span>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-gray-400">
                      <Clock size={12} strokeWidth={2.5} />
                      <span>{new Date(lp.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
