'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingPagePortfolio } from './portfolio';
import { LandingPageSelector } from './selector';
import { LandingPageAnalytics } from './analytics';
import { LandingPageEditor } from './editor';
import { BatchGenerationModal } from './batch-generation-modal';
import type { ApiProduct, ApiLandingPage } from '@/lib/api/types';

export type LandingPageViewType = 'list' | 'selector' | 'analytics' | 'editor';

export function LandingPagesView() {
  const [view, setView] = useState<LandingPageViewType>('list');
  const [selectedLP, setSelectedLP] = useState<ApiLandingPage | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const handleSelectPage = (lp: ApiLandingPage) => {
    setSelectedLP(lp);
    setView('analytics');
  };

  const handleCreateNew = () => {
    setView('selector');
  };

  const handleProductSelect = (product: ApiProduct) => {
    setSelectedProduct(product);
    setIsBatchModalOpen(true);
  };

  const handleBatchConfirm = () => {
    setIsBatchModalOpen(false);
    setView('editor');
  };

  const handleBackToList = () => {
    setSelectedLP(null);
    setSelectedProduct(null);
    setView('list');
  };

  const renderContent = () => {
    switch (view) {
      case 'list':
        return (
          <LandingPagePortfolio 
            key="list" 
            onSelectPage={handleSelectPage} 
            onCreateNew={handleCreateNew} 
          />
        );
      case 'selector':
        return (
          <LandingPageSelector 
            key="selector" 
            onSelect={handleProductSelect} 
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
        return (
          <LandingPageEditor 
            key="editor"
            productId={selectedProduct?.id || '1'}
            onBack={handleBackToList}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-brand-bg dark:bg-[#080808]">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
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
        {isBatchModalOpen && selectedProduct && (
          <BatchGenerationModal 
            product={selectedProduct}
            isOpen={isBatchModalOpen}
            onClose={() => setIsBatchModalOpen(false)}
            onConfirm={handleBatchConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
