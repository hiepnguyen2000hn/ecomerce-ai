'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Facebook, LayoutGrid, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAtom } from 'jotai';
import { adsConnectionAtom, type AdsConnection } from '@/lib/store';
import { loadFbSdk, fbLogin } from '@/lib/fb-sdk';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'ads_connection';
const FB_TOKEN_KEY = 'fb_access_token';

interface Props {
  onGotoDashboard: () => void;
}

// Conic gradient: transparent background → fade in → bright star head → fading tail → transparent
const STAR_GRADIENT =
  'conic-gradient(from 0deg, transparent 0deg, rgba(16,185,129,0.1) 35deg, rgba(16,185,129,0.85) 65deg, #10b981 78deg, rgba(52,211,153,0.55) 100deg, rgba(52,211,153,0.15) 135deg, transparent 165deg)';

export function AdsConnectView({ onGotoDashboard }: Props) {
  const [connection, setConnection] = useAtom(adsConnectionAtom);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError]     = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConnection(JSON.parse(raw) as AdsConnection);
    } catch { /* ignore */ }
  }, [setConnection]);

  const markConnected = (key: 'meta' | 'sheets') => {
    const next: AdsConnection = { ...connection, [key]: true };
    setConnection(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const handleConnectMeta = async () => {
    setMetaLoading(true);
    setMetaError(null);
    try {
      await loadFbSdk();
      const token = await fbLogin('ads_read');
      try { localStorage.setItem(FB_TOKEN_KEY, token); } catch { /* ignore */ }
      markConnected('meta');
    } catch (err) {
      setMetaError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setMetaLoading(false);
    }
  };

  const handleConnectSheets = () => markConnected('sheets');

  const anyConnected = connection.meta || connection.sheets;

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-[#080808] px-8 py-20">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-14"
      >
        <h1 className="text-5xl font-display font-black text-black dark:text-white uppercase tracking-tighter leading-none mb-4">
          Connect Your Data
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
          Link your accounts to start syncing advertising and sales data.
        </p>
      </motion.div>

      {/* Provider cards */}
      <motion.div
        layout
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row items-stretch gap-6 w-full max-w-4xl mb-10 justify-center"
      >
        <AnimatePresence>

          {/* ── Meta Facebook Ads ── */}
          {(!anyConnected || connection.meta) && (
            <motion.div
              key="meta"
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.82,
                filter: 'blur(10px)',
                transition: { duration: 0.85, delay: 0.3, ease: [0.4, 0, 1, 1] },
              }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
                layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
              }}
              // 1.5px padding = border zone; star border fills this zone when connected
              className="relative flex flex-col h-full w-full sm:w-96 shrink-0 rounded-[28px] p-[1.5px]"
            >
              {/* Static border — not connected */}
              {!connection.meta && (
                <div className={cn(
                  'absolute inset-0 rounded-[28px] border pointer-events-none',
                  metaError
                    ? 'border-red-500/30 dark:border-red-500/20'
                    : 'border-gray-100 dark:border-white/5',
                )} />
              )}

              {/* Star border — connected */}
              <AnimatePresence>
                {connection.meta && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3.5, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
                      style={{ position: 'absolute', inset: '-100%', background: STAR_GRADIENT }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inner card — always fills the padded area */}
              <div className="relative flex-1 bg-white dark:bg-[#0c0c0c] rounded-[27px] p-8 flex flex-col gap-6 shadow-sm dark:shadow-none">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-[#1877F2]">
                  <Facebook size={26} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black text-black dark:text-white uppercase tracking-tight mb-2">
                    Meta Facebook Ads
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed min-h-[2.5rem]">
                    Fetch campaign spend, impressions, and performance metrics.
                  </p>
                </div>

                {metaError && !connection.meta && (
                  <div className="flex items-start gap-2 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl">
                    <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-red-600 dark:text-red-400 leading-relaxed">{metaError}</p>
                  </div>
                )}

                {connection.meta ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="flex items-center gap-2 px-5 py-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 select-none"
                  >
                    <Check size={14} strokeWidth={3} />
                    Connected
                  </motion.div>
                ) : (
                  <button
                    onClick={handleConnectMeta}
                    disabled={metaLoading}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1877F2] hover:bg-[#1565c0] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:cursor-wait"
                  >
                    {metaLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Facebook size={13} />
                        {metaError ? 'Retry' : 'Connect with Facebook'}
                        <ArrowRight size={13} strokeWidth={3} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Google Sheets ── */}
          {(!anyConnected || connection.sheets) && (
            <motion.div
              key="sheets"
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.82,
                filter: 'blur(10px)',
                transition: { duration: 0.85, delay: 0.3, ease: [0.4, 0, 1, 1] },
              }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
                delay: anyConnected ? 0 : 0.1,
                layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
              }}
              className="relative flex flex-col h-full w-full sm:w-96 shrink-0 rounded-[28px] p-[1.5px]"
            >
              {/* Static border — not connected */}
              {!connection.sheets && (
                <div className="absolute inset-0 rounded-[28px] border border-gray-100 dark:border-white/5 pointer-events-none" />
              )}

              {/* Star border — connected */}
              <AnimatePresence>
                {connection.sheets && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3.5, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
                      style={{ position: 'absolute', inset: '-100%', background: STAR_GRADIENT }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inner card */}
              <div className="relative bg-white dark:bg-[#0c0c0c] rounded-[27px] p-8 flex flex-col gap-6 shadow-sm dark:shadow-none">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-emerald-600">
                  <LayoutGrid size={26} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black text-black dark:text-white uppercase tracking-tight mb-2">
                    Google Sheets
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed min-h-[2.5rem]">
                    Import sales data, order history, and customer value.
                  </p>
                </div>

                {connection.sheets ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="flex items-center gap-2 px-5 py-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 select-none"
                  >
                    <Check size={14} strokeWidth={3} />
                    Connected
                  </motion.div>
                ) : (
                  <button
                    onClick={handleConnectSheets}
                    className="flex items-center gap-2 px-5 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/10"
                  >
                    Connect
                    <ArrowRight size={13} strokeWidth={3} />
                  </button>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      {/* Go to Dashboard CTA */}
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5, layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
        className="flex flex-col items-center gap-4"
      >
        <button
          disabled={!anyConnected}
          onClick={onGotoDashboard}
          className={cn(
            'flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300',
            anyConnected
              ? 'bg-black dark:bg-white text-white dark:text-black hover:scale-[1.03] active:scale-95 shadow-2xl shadow-black/20 dark:shadow-white/10'
              : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed',
          )}
        >
          Go to Dashboard
          <ArrowRight size={14} strokeWidth={3} />
        </button>
        <p className="text-[10px] text-gray-400 font-medium max-w-xs text-center leading-relaxed">
          * Connect at least one account to access the unified reporting dashboard.
        </p>
      </motion.div>
    </div>
  );
}
