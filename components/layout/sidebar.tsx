'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  MousePointer2, 
  Terminal, 
  ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export type NavItem = 'dashboard' | 'products' | 'landing-pages' | 'ads-command' | 'orders';

interface SidebarProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
}

export function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  const { t } = useTranslation();

  const items = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'products', label: t('nav.products'), icon: Package },
    { id: 'landing-pages', label: t('nav.landing_pages'), icon: MousePointer2 },
    { id: 'ads-command', label: t('nav.ads_command'), icon: Terminal },
    { id: 'orders', label: t('nav.orders'), icon: ShoppingCart },
  ];

  return (
    <div className="w-64 h-full bg-white dark:bg-[#080808] border-r border-gray-100 dark:border-white/5 flex flex-col py-8 shrink-0 transition-colors duration-300">
      <div className="px-8 mb-12 flex items-center gap-3">
        <div className="w-10 h-10 bg-black dark:bg-white rounded-none flex items-center justify-center text-white dark:text-black font-display font-black text-xl tracking-tighter shadow-xl">
          L
        </div>
        <div>
          <h1 className="font-display font-black text-black dark:text-white leading-none tracking-tighter uppercase text-lg">LEVELUP</h1>
          <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-bold mt-1">Ecommerce OS</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {items.map((item) => {
          const isActive = activeItem === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as NavItem)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 transition-all duration-200 group relative",
                isActive 
                   ? "text-black dark:text-white" 
                   : "text-gray-400 hover:text-black dark:hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-6 bg-black dark:bg-white"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={18} className={cn(isActive ? "text-black dark:text-white" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300")} />
              <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-8 mt-auto py-8">
        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('nav.storage')}</p>
          <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mb-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              className="h-full bg-black dark:bg-white" 
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono opacity-50">
            <span>6.5GB / 10GB</span>
            <span>65%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
