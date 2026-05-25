'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { currentUserAtom, adsConnectionAtom } from '@/lib/store';
import { useInitAuth } from '@/lib/hooks/use-auth';
import { getToken } from '@/lib/api/client';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AdsCommandTabs } from '@/components/layout/ads-command-tabs';
import { motion, AnimatePresence } from 'framer-motion';

function getHeaderInfo(pathname: string): { title: string; breadcrumbs: string[] } {
  if (pathname === '/inventory/create')
    return { title: 'New Product', breadcrumbs: ['Product Management', 'New Product'] };
  if (/^\/inventory\/[^/]+$/.test(pathname))
    return { title: 'Product Management', breadcrumbs: ['Product Management', 'Detail'] };
  if (pathname.startsWith('/inventory'))
    return { title: 'Product Management', breadcrumbs: [] };
  if (pathname.startsWith('/dashboard'))
    return { title: 'Dashboard', breadcrumbs: [] };
  if (/^\/landing-pages\/[^/]+/.test(pathname))
    return { title: 'Landing Pages', breadcrumbs: ['Landing Pages', 'Portfolio'] };
  if (pathname.startsWith('/landing-pages'))
    return { title: 'Landing Pages', breadcrumbs: [] };
  if (pathname.startsWith('/ads-command'))
    return { title: 'Ads Command', breadcrumbs: [] };
  if (pathname.startsWith('/orders'))
    return { title: 'Orders & Fulfilments', breadcrumbs: [] };
  return { title: '', breadcrumbs: [] };
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useAtomValue(currentUserAtom);
  const adsConnection = useAtomValue(adsConnectionAtom);
  const { isLoading: authLoading } = useInitAuth();

  useEffect(() => {
    if (!authLoading && !currentUser && !getToken()) {
      router.replace('/login');
    }
  }, [authLoading, currentUser, router]);

  if (authLoading && !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-[#080808]">
        <div className="w-10 h-10 border-4 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) return null;

  const { title, breadcrumbs } = getHeaderInfo(pathname);

  return (
    <div className="flex h-screen bg-white dark:bg-[#080808] text-black dark:text-white transition-colors duration-500 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Header
          title={title}
          breadcrumbs={breadcrumbs}
          centerContent={pathname.startsWith('/ads-command') && (adsConnection.meta || adsConnection.sheets) ? <AdsCommandTabs /> : undefined}
        />

        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
