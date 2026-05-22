'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Facebook, LayoutGrid, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAtom } from 'jotai';
import { adsConnectionAtom, type AdsConnection } from '@/lib/store';
import { loadFbSdk, fbLogin } from '@/lib/fb-sdk';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'ads_connection';
const FB_TOKEN_KEY = 'fb_access_token';

export function AdsConnectView() {
  const [connection, setConnection] = useAtom(adsConnectionAtom);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError]     = useState<string | null>(null);

  // Hydrate connection state from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConnection(JSON.parse(raw) as AdsConnection);
    } catch { /* ignore */ }
  }, [setConnection]);

  // Persist connection update helper (used for Google Sheets mock)
  const markConnected = (key: 'meta' | 'sheets') => {
    const next: AdsConnection = { ...connection, [key]: true };
    setConnection(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  // Real Facebook OAuth popup via JS SDK
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

  // Google Sheets — mock connect for now
  const handleConnectSheets = () => markConnected('sheets');

  const allConnected = connection.meta || connection.sheets;

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
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-4xl mb-10">

        {/* ── Meta Facebook Ads ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0 }}
          className={cn(
            'flex-1 bg-white dark:bg-[#0c0c0c] border rounded-[28px] p-8 flex flex-col gap-6 shadow-sm dark:shadow-none transition-all duration-300',
            connection.meta
              ? 'border-emerald-500/30 dark:border-emerald-500/20'
              : metaError
                ? 'border-red-500/30 dark:border-red-500/20'
                : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10',
          )}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-[#1877F2]">
            <Facebook size={26} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-black text-black dark:text-white uppercase tracking-tight mb-2">
              Meta Facebook Ads
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Fetch campaign spend, impressions, and performance metrics.
            </p>
          </div>

          {/* Error message */}
          {metaError && !connection.meta && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl">
              <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 leading-relaxed">{metaError}</p>
            </div>
          )}

          {connection.meta ? (
            <div className="flex items-center gap-2 px-5 py-3 bg-gray-100 dark:bg-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 select-none">
              <Check size={14} strokeWidth={3} className="text-emerald-500" />
              Connected
            </div>
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
        </motion.div>

        {/* ── Google Sheets ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className={cn(
            'flex-1 bg-white dark:bg-[#0c0c0c] border rounded-[28px] p-8 flex flex-col gap-6 shadow-sm dark:shadow-none transition-all duration-300',
            connection.sheets
              ? 'border-emerald-500/30 dark:border-emerald-500/20'
              : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10',
          )}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-emerald-600">
            <LayoutGrid size={26} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-black text-black dark:text-white uppercase tracking-tight mb-2">
              Google Sheets
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Import sales data, order history, and customer value.
            </p>
          </div>
          {connection.sheets ? (
            <div className="flex items-center gap-2 px-5 py-3 bg-gray-100 dark:bg-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 select-none">
              <Check size={14} strokeWidth={3} className="text-emerald-500" />
              Connected
            </div>
          ) : (
            <button
              onClick={handleConnectSheets}
              className="flex items-center gap-2 px-5 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/10"
            >
              Connect
              <ArrowRight size={13} strokeWidth={3} />
            </button>
          )}
        </motion.div>

      </div>

      {/* Go to Dashboard CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <button
          disabled={!allConnected}
          className={cn(
            'flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all',
            allConnected
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
