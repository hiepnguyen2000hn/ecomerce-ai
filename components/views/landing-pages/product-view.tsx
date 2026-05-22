'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useProduct } from '@/lib/hooks/use-products';
import { getBatchGeneratedLandingPages } from '@/lib/api/lp-batch';
import { LandingPagePortfolio } from './portfolio';
import { LandingPageEditor } from './editor';
import { LandingPageAnalytics } from './analytics';
import { BatchGenerationModal } from './batch-generation-modal';
import type { ApiLpBatchLandingPage } from '@/lib/api/types';

type SubView = 'list' | 'analytics' | 'editor';

interface LandingPageProductViewProps {
  productId: string;
}

export function LandingPageProductView({ productId }: LandingPageProductViewProps) {
  const router = useRouter();
  const { data: product, isLoading } = useProduct(productId);

  const [subView, setSubView] = useState<SubView>('list');
  const [selectedLP, setSelectedLP] = useState<ApiLpBatchLandingPage | null>(null);
  const [batchVersions, setBatchVersions] = useState<ApiLpBatchLandingPage[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);

  const handleSelectPage = (lp: ApiLpBatchLandingPage) => {
    setSelectedLP(lp);
    setSubView('analytics');
  };

  const handleEditPage = async (lp: ApiLpBatchLandingPage) => {
    setSelectedLP(lp);
    setBatchVersions([]);
    setSubView('editor');
    if (lp.batchId) {
      try {
        const lps = await getBatchGeneratedLandingPages(lp.batchId);
        const list = Array.isArray(lps) ? lps : (lps as { data?: ApiLpBatchLandingPage[] })?.data ?? [];
        if (list.length > 1) setBatchVersions(list);
      } catch {
        // silently ignore — editor works fine without versions
      }
    }
  };

  // After SSE done → fetch all LPs → go to editor with first selected
  const handleBatchConfirm = async (batchId: string) => {
    setActiveBatchId(batchId);
    setIsBatchModalOpen(false);
    try {
      const lps = await getBatchGeneratedLandingPages(batchId);
      const list = Array.isArray(lps) ? lps : (lps as { data?: ApiLpBatchLandingPage[] })?.data ?? [];
      const first = list[0];
      if (first) {
        setSelectedLP(first);
        setBatchVersions(list.length > 1 ? list : []);
        setSubView('editor');
        return;
      }
    } catch (err) {
      console.error('[batch] fetch LPs error:', err);
    }
    setSubView('list');
  };

  const handleBackToList = () => {
    setSelectedLP(null);
    setBatchVersions([]);
    setActiveBatchId(null);
    setSubView('list');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm font-bold">
        Product not found.
      </div>
    );
  }

  const renderContent = () => {
    switch (subView) {
      case 'list':
        return (
          <LandingPagePortfolio
            key="list"
            productId={productId}
            onSelectPage={handleSelectPage}
            onEditPage={handleEditPage}
            onCreateNew={() => setIsBatchModalOpen(true)}
            onBack={() => router.push('/landing-pages')}
          />
        );
      case 'analytics':
        return selectedLP ? (
          <LandingPageAnalytics
            key="analytics"
            lp={selectedLP}
            onBack={handleBackToList}
          />
        ) : null;
      case 'editor':
        return selectedLP ? (
          <LandingPageEditor
            key="editor"
            product={product}
            lp={selectedLP}
            versions={batchVersions.length > 1 ? batchVersions : undefined}
            onBack={handleBackToList}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={subView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isBatchModalOpen && (
          <BatchGenerationModal
            product={product}
            isOpen={isBatchModalOpen}
            onClose={() => setIsBatchModalOpen(false)}
            onConfirm={handleBatchConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
