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
            expand={false}
            richColors
            closeButton={false}
            theme="system"
            duration={3000}
            visibleToasts={3}
            toastOptions={{
              style: {
                borderRadius: '20px',
                padding: '12px 20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '13px',
                fontWeight: '600',
                letterSpacing: '-0.02em',
                boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.2)',
              },
              className: 'group transition-all duration-500 font-sans backdrop-blur-md',
              classNames: {
                toast: 'hover:scale-[1.02] transition-transform active:scale-[0.98]',
                success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
                error: 'bg-red-500/10 border-red-500/20 text-red-500',
                warning: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
                info: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
              }
            }}
          />
        </I18nextProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
