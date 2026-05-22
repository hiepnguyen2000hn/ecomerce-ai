'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { adsTabAtom, type AdsTab } from '@/lib/store';
import { cn } from '@/lib/utils';

const TABS: AdsTab[] = ['Monitor', 'Launcher', 'Strategy', 'Logs'];

export function AdsCommandTabs() {
  const [activeTab, setActiveTab] = useAtom(adsTabAtom);

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-full p-1">
      {TABS.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={cn(
            'px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all',
            activeTab === tab
              ? 'bg-white dark:bg-white text-black shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
