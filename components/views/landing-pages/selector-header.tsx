'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function SelectorHeader() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-4"
    >
      <div className="w-11 h-11 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 mx-auto mb-3">
        <Search size={20} strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-display font-black text-black dark:text-white uppercase tracking-tighter mb-1">
        {t('landing_pages.selector.title')}
      </h2>
      <p className="text-xs text-gray-400 dark:text-white/30 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
        {t('products.search_description')}
      </p>
    </motion.div>
  );
}
