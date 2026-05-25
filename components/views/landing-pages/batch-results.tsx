'use client';

import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Eye, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLpBatchLandingPages } from '@/lib/hooks/use-lp-batch';
import type { ApiLpBatchLandingPage, LpBatchLpStatus } from '@/lib/api/types';
import { PageLayout } from '@/components/layout/page-layout';

const PAGE_SIZE = 10;

const STATUS_COLOR: Record<LpBatchLpStatus, string> = {
  PUBLISHED:    'bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  NEEDS_REVIEW: 'bg-amber-100/50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  DRAFT:        'bg-gray-100/50 text-gray-500 dark:bg-white/5 dark:text-gray-400',
  ARCHIVED:     'bg-red-100/50 text-red-500 dark:bg-red-500/10 dark:text-red-400',
};

interface BatchResultsProps {
  productId: string;
  batchId: string;
  onPreview: (lp: ApiLpBatchLandingPage) => void;
  onBack: () => void;
}

export function BatchResults({ productId, batchId, onPreview, onBack }: BatchResultsProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useLpBatchLandingPages({
    productId,
    page,
    pageSize: PAGE_SIZE,
  });

  const lps = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <PageLayout contentClassName="overflow-y-auto no-scrollbar px-4 sm:px-6 lg:px-10 xl:px-12 py-8 pb-24">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-xl font-display font-black text-black dark:text-white uppercase tracking-tight">
                Generated Landing Pages
              </h2>
              <p className="text-[11px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest mt-0.5">
                Batch {batchId.slice(0, 8)}… · {meta?.total ?? 0} pages
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin" />
            </div>
          ) : lps.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm font-bold">
              No landing pages found.
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-white/5">
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">#</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Code</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Slug</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Market</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Lang</th>
                    <th className="px-6 py-5" />
                  </tr>
                </thead>
                <tbody>
                  {lps.map((lp, idx) => (
                    <tr
                      key={lp.id}
                      className="group border-b border-gray-50/50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-bold text-gray-400">
                          {(page - 1) * PAGE_SIZE + idx + 1}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={cn(
                          'px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap',
                          STATUS_COLOR[lp.status],
                        )}>
                          • {lp.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-black dark:text-white uppercase tracking-tight">
                          {lp.code}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <a
                          href={lp.htmlUrl ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-blue-500 font-mono text-[10px] font-bold hover:underline"
                        >
                          <ExternalLink size={10} />
                          <span className="truncate max-w-[200px]">{lp.slug}</span>
                        </a>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">{lp.marketCode}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">{lp.lang}</span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => onPreview(lp)}
                            title="Preview HTML"
                            className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-black dark:hover:text-white transition-all"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => onPreview(lp)}
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
              {meta.total} total · page {page} of {totalPages}
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
                {page} / {totalPages}
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
