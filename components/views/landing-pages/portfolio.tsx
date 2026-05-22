'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search, Plus, Filter, ExternalLink,
  ChevronLeft, ChevronRight, ArrowLeft,
  BarChart2, Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useLpBatchLandingPages } from '@/lib/hooks/use-lp-batch';
import type { ApiLpBatchLandingPage, LpBatchLpStatus } from '@/lib/api/types';
import { PageLayout } from '@/components/layout/page-layout';

const STATUS_OPTIONS: { value: '' | LpBatchLpStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'NEEDS_REVIEW', label: 'Needs Review' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const DASH = <span className="text-xs text-gray-300 dark:text-white/20 font-mono select-none">—</span>;

function LpThumbnail({ url }: { url?: string }) {
  const [failed, setFailed] = React.useState(!url);
  if (failed || !url) {
    return (
      <div className="w-12 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
        <span className="text-[8px] font-black text-gray-300 dark:text-white/20 uppercase tracking-widest">LP</span>
      </div>
    );
  }
  return (
    <div className="relative w-12 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-white/5">
      <Image src={url} alt="preview" fill className="object-cover" onError={() => setFailed(true)} />
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-CA');
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} ${time}`;
}

interface LandingPagePortfolioProps {
  productId?: string;
  onSelectPage: (lp: ApiLpBatchLandingPage) => void;  // → analytics view
  onEditPage?: (lp: ApiLpBatchLandingPage) => void;   // → editor view (optional)
  onCreateNew: () => void;
  onBack?: () => void;
}

export function LandingPagePortfolio({ productId, onSelectPage, onEditPage, onCreateNew, onBack }: LandingPagePortfolioProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | LpBatchLpStatus>('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data, isLoading } = useLpBatchLandingPages({
    productId: productId || undefined,
    status: status || undefined,
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const landingPages = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;


  return (
    <PageLayout contentClassName="overflow-y-auto no-scrollbar px-4 sm:px-6 lg:px-10 xl:px-12 py-8 pb-24">
      <div className="space-y-8">
        {/* Search & Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1 max-w-md group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder={t('landing_pages.search_placeholder')}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full py-3.5 pl-12 pr-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-black/10 dark:focus:border-white/10 rounded-2xl outline-none text-sm font-medium transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={cn(
                "p-3.5 rounded-2xl border border-transparent transition-all",
                showFilters
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
              )}
            >
              <Filter size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-3.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-2xl border border-transparent transition-all text-gray-500"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={18} />
              <span>{t('landing_pages.create_new')}</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setStatus(opt.value); setPage(1); }}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  status === opt.value
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

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
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-white/5">
                    <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Status</th>
                    <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Configuration &amp; Preview</th>
                    <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Traffic</th>
                    <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">CVR</th>
                    <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Order</th>
                    <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Conf.</th>
                    <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">AI Diagnosis</th>
                    <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Created</th>
                    <th className="px-6 py-6" />
                  </tr>
                </thead>
                <tbody>
                  {landingPages.map((lp) => (
                    <tr
                      key={lp.id}
                      onClick={() => onSelectPage(lp)}
                      className="group border-b border-gray-50/50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                          lp.status === 'PUBLISHED'    && "bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
                          lp.status === 'NEEDS_REVIEW' && "bg-amber-100/50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
                          lp.status === 'DRAFT'        && "bg-gray-100/50 text-gray-500 dark:bg-white/5 dark:text-gray-400",
                          lp.status === 'ARCHIVED'     && "bg-red-100/50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
                        )}>
                          • {lp.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* CONFIGURATION & PREVIEW */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <LpThumbnail url={lp.htmlUrl} />
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-black text-black dark:text-white uppercase tracking-tight truncate max-w-[160px]">
                              {lp.code}
                            </p>
                            <a
                              href={`/${lp.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1 text-blue-500 font-mono text-[10px] font-bold hover:underline"
                            >
                              <ExternalLink size={10} />
                              <span className="truncate max-w-[140px]">{lp.slug}</span>
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* TRAFFIC */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        {lp.analytics?.clicks != null && lp.analytics?.impressions != null ? (
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-black dark:text-white">
                              {lp.analytics.clicks.toLocaleString()}{' '}
                              <span className="font-bold text-gray-400 text-[10px]">USERS</span>
                            </p>
                            <p className="text-[10px] font-bold text-gray-400">
                              {lp.analytics.impressions.toLocaleString()} Total views
                            </p>
                          </div>
                        ) : DASH}
                      </td>

                      {/* CVR */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        {lp.analytics?.cvr != null ? (
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-emerald-500">
                              {(lp.analytics.cvr * 100).toFixed(1)}%
                            </p>
                            {lp.analytics.revenue != null &&
                              lp.analytics.conversions != null &&
                              lp.analytics.conversions > 0 && (
                              <p className="text-[10px] font-bold text-gray-400">
                                CPA: ${(lp.analytics.revenue / lp.analytics.conversions).toFixed(1)}
                              </p>
                            )}
                          </div>
                        ) : DASH}
                      </td>

                      {/* ORDER */}
                      <td className="px-6 py-5">
                        {lp.analytics?.conversions != null ? (
                          <span className="text-xs font-black text-black dark:text-white font-mono">
                            {lp.analytics.conversions.toLocaleString()}
                          </span>
                        ) : DASH}
                      </td>

                      {/* CONF. */}
                      <td className="px-6 py-5">
                        {lp.analytics?.confidence != null ? (
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 font-mono">
                            {Math.round(lp.analytics.confidence * 100)}%
                          </span>
                        ) : DASH}
                      </td>

                      {/* AI DIAGNOSIS */}
                      <td className="px-6 py-5">
                        {lp.analytics?.aiDiagnosis ? (
                          <span className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                            lp.analytics.aiDiagnosis === 'HIGH PERFORMANCE'
                              ? "bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : lp.analytics.aiDiagnosis === 'LP BOTTLENECK'
                              ? "bg-rose-100/50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                              : "bg-gray-100/50 text-gray-500 dark:bg-white/5 dark:text-gray-400"
                          )}>
                            {lp.analytics.aiDiagnosis}
                          </span>
                        ) : DASH}
                      </td>

                      {/* CREATED */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-[11px] font-mono font-bold text-gray-400">
                          {formatDateTime(lp.createdAt)}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-5">
                        <div
                          className="flex items-center gap-2"
                          onClick={e => e.stopPropagation()}
                        >
                          {/* Analytics */}
                          <button
                            onClick={() => onSelectPage(lp)}
                            title="View analytics"
                            className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-black dark:hover:text-white transition-all"
                          >
                            <BarChart2 size={14} />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => onEditPage?.(lp)}
                            title="Edit"
                            className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-black dark:hover:text-white transition-all"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {meta && (
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              {meta.total} total · page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 text-xs font-black tabular-nums">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
