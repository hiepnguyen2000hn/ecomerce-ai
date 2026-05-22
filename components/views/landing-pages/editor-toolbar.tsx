'use client';

import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface VersionInfo {
  id: string;
  label: string;
}

interface EditorToolbarProps {
  device: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  versions?: VersionInfo[];
  activeVersionId?: string;
  onVersionChange?: (id: string) => void;
}

const DEVICES: { id: DeviceType; icon: React.ElementType }[] = [
  { id: 'desktop', icon: Monitor },
  { id: 'tablet', icon: Tablet },
  { id: 'mobile', icon: Smartphone },
];

export function EditorToolbar({ device, onDeviceChange, versions, activeVersionId, onVersionChange }: EditorToolbarProps) {
  return (
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

        {versions && versions.length > 1 && (
          <>
            <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />
            <div className="flex p-1 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 gap-0.5">
              {versions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => onVersionChange?.(v.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                    v.id === activeVersionId
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-gray-400 hover:text-black dark:hover:text-white'
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex p-1 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
        {DEVICES.map(item => (
          <button
            key={item.id}
            onClick={() => onDeviceChange(item.id)}
            className={cn(
              'p-2.5 rounded-lg flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all',
              device === item.id
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
                : 'text-gray-400 hover:text-black dark:hover:text-white'
            )}
          >
            <item.icon size={16} />
            {item.id}
          </button>
        ))}
      </div>
    </div>
  );
}
