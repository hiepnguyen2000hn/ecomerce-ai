'use client';

import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from '@/lib/context/theme-context';
import { Toaster } from 'sonner';

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <I18nextProvider i18n={i18n}>
          {children}
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'dark:bg-[#121212] dark:text-white dark:border-white/10 font-sans',
            }}
          />
        </I18nextProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
