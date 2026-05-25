'use client';

import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { adsConnectionAtom, type AdsConnection } from '@/lib/store';
import { AdsConnectView } from '@/components/views/ads-connect';
import { AdsCommandView } from '@/components/views/ads-command';

const STORAGE_KEY = 'ads_connection';

export default function AdsCommandPage() {
  const [connection, setConnection] = useAtom(adsConnectionAtom);
  const [mounted, setMounted] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AdsConnection;
        setConnection(parsed);
        // If already connected from a previous session, go straight to dashboard
        if (parsed.meta || parsed.sheets) setShowDashboard(true);
      }
    } catch { /* ignore */ }
    setMounted(true);
  }, [setConnection]);

  if (!mounted) return null;

  if (!showDashboard) {
    return <AdsConnectView onGotoDashboard={() => setShowDashboard(true)} />;
  }

  return <AdsCommandView />;
}
