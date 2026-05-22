'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { DeviceType } from './editor-toolbar';

interface EditorCanvasProps {
  htmlUrl?: string | null;
  publicUrl?: string | null;
  device: DeviceType;
}

const DEVICE_CLASS: Record<DeviceType, string> = {
  desktop: 'w-full max-w-5xl h-[calc(100vh-220px)]',
  tablet:  'w-[600px] h-[800px]',
  mobile:  'w-[375px] h-[667px]',
};

export function EditorCanvas({ htmlUrl, publicUrl, device }: EditorCanvasProps) {
  const previewUrl = publicUrl ?? htmlUrl;
  return (
    <div className="flex-1 overflow-y-auto p-8 flex items-start justify-center custom-scrollbar">
      <div
        className={cn(
          'bg-white shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/10',
          DEVICE_CLASS[device],
        )}
      >
        {previewUrl ? (
          <iframe
            src={previewUrl}
            title="Landing page preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-[#0c0c0c]">
            <p className="text-xs font-bold text-gray-300 dark:text-white/20 uppercase tracking-widest">
              No preview available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
