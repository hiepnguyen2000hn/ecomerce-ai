'use client';

import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import type { ApiProduct, ApiLpBatchLandingPage } from '@/lib/api/types';
import { staticUrl } from '@/lib/api/config';
import { cn } from '@/lib/utils';

const STATUS_COLOR: Record<string, string> = {
  PUBLISHED:    'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  NEEDS_REVIEW: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400',
  DRAFT:        'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400',
  ARCHIVED:     'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400',
};

interface EditorHeaderProps {
  product: ApiProduct;
  lp: ApiLpBatchLandingPage;
  onBack: () => void;
}

export function EditorHeader({ product, lp, onBack }: EditorHeaderProps) {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);

  return (
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
            <h3 className="text-lg font-display font-black text-black dark:text-white uppercase tracking-tight">
              {lp.code}
            </h3>

            <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">
              {imgError ? (
                <div className="w-4 h-4 rounded-sm bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                  <Package size={10} className="text-gray-400" />
                </div>
              ) : (
                <Image
                  src={product.primaryImageUrl ? staticUrl(product.primaryImageUrl) : `https://picsum.photos/seed/${product.sku}/64/64`}
                  alt={product.name}
                  width={16}
                  height={16}
                  className="rounded-sm"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              )}
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{product.sku}</span>
            </div>

            <span className={cn(
              'px-2.5 py-1 rounded-lg border text-[10px] font-mono font-black uppercase tracking-widest',
              STATUS_COLOR[lp.status] ?? STATUS_COLOR.DRAFT,
            )}>
              {lp.status.replace('_', ' ')}
            </span>
          </div>

          {(lp.publicUrl ?? lp.htmlUrl) && (
            <a
              href={lp.publicUrl ?? lp.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1.5 mt-0.5 tracking-wider"
            >
              {lp.slug ?? lp.code}
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="px-6 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
          {t('editor.draft')}
        </button>
        <button className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
          {t('editor.publish')}
        </button>
      </div>
    </div>
  );
}
