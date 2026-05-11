'use client';

import React, { useState } from 'react';
import { Sidebar, NavItem } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ProductSearch } from '@/components/views/product-search';
import { ProductList } from '@/components/views/product-list';
import { ProductDetail } from '@/components/views/product-detail';
import { DashboardView } from '@/components/views/dashboard';
import { LandingPagesView } from '@/components/views/landing-pages';
import { LoginView } from '@/components/views/login-view';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom, useAtomValue } from 'jotai';
import { activeTabAtom, selectedProductAtom, currentUserAtom } from '@/lib/store';
import { useInitAuth, useLogout } from '@/lib/hooks/use-auth';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  const safeT = (key: string, options?: any) => typeof t === 'function' ? t(key, options) : key;
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const [selectedProduct, setSelectedProduct] = useAtom(selectedProductAtom);
  const [isDetailView, setIsDetailView] = useState(false);
  const currentUser  = useAtomValue(currentUserAtom);
  const handleLogout = useLogout();
  useInitAuth();

  // Navigation handlers
  const handleNavigate = (tab: NavItem) => {
    setActiveTab(tab);
    setIsDetailView(false);
    setSelectedProduct(null);
  };

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setIsDetailView(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsDetailView(true);
  };

  const handleBackToList = () => {
    setIsDetailView(false);
    setSelectedProduct(null);
  };

  // Content rendering based on state
  const renderContent = () => {
    if (isDetailView && selectedProduct) {
      return (
        <ProductDetail 
          key="detail" 
          product={selectedProduct} 
          onBack={handleBackToList} 
        />
      );
    }

    switch (activeTab) {
      case 'landing-pages':
        return <LandingPagesView key="landing-pages" />;
      case 'products':
        return (
          <ProductList 
            key="list" 
            onEditProduct={handleEditProduct} 
          />
        );
      case 'dashboard':
        return <DashboardView key="dashboard" />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-20 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">🚧</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">
              {activeTab.replace('-', ' ')} view
            </h2>
            <p className="max-w-xs text-sm font-medium">This section is currently under development as part of the Ecommerce OS suite.</p>
          </div>
        );
    }
  };

  const getHeaderTitle = (): string => {
    if (isDetailView && selectedProduct) return selectedProduct.name;
    switch (activeTab) {
      case 'landing-pages': return String(safeT('landing_pages.portfolio'));
      case 'products': return String(safeT('products.management'));
      case 'dashboard': return String(safeT('nav.dashboard'));
      default: return String(activeTab).charAt(0).toUpperCase() + String(activeTab).slice(1).replace('-', ' ');
    }
  };

  const getBreadcrumbs = () => {
    if (isDetailView && selectedProduct) return [String(safeT('products.management')), selectedProduct.name];
    return [];
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <LoginView onLogin={() => {}} />
          </motion.div>
        ) : (
          <motion.div 
            key="main-app"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-screen bg-white dark:bg-[#080808] text-black dark:text-white transition-colors duration-500 overflow-hidden"
          >
            <Sidebar 
              activeItem={activeTab as NavItem} 
              onNavigate={handleNavigate} 
              onLogout={handleLogout}
            />
            
            <main className="flex-1 flex flex-col overflow-hidden relative">
              <Header 
                title={getHeaderTitle()} 
                breadcrumbs={getBreadcrumbs()} 
                onLogout={handleLogout}
              />
              
              <div className="flex-1 overflow-y-auto no-scrollbar relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDetailView ? `detail-${selectedProduct?.id}` : activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full"
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
