'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface SelectorSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function SelectorSearch({ value, onChange }: SelectorSearchProps) {
  const { t } = useTranslation();

  return (
    <div className="relative mb-3">
      <div className={cn(
        'relative bg-white dark:bg-[#0c0c0c] border rounded-2xl transition-all duration-500 shadow-xl shadow-black/5 overflow-hidden',
        value
          ? 'border-black dark:border-white ring-4 ring-black/5 dark:ring-white/5'
          : 'border-gray-100 dark:border-white/10'
      )}>
        <input
          type="text"
          placeholder={t('landing_pages.selector.placeholder')}
          className="w-full py-3 pl-5 pr-10 bg-transparent text-sm border-none focus:ring-0 focus:outline-none placeholder:text-gray-400 font-semibold tracking-tight"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      </div>
    </div>
  );
}
