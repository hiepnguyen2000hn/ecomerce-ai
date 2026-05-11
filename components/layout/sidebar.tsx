'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  MousePointer2, 
  Terminal, 
  ShoppingCart,
  Zap,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export type NavItem = 'dashboard' | 'products' | 'landing-pages' | 'ads-command' | 'orders';

interface SidebarProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
  onLogout?: () => void;
}

export function Sidebar({ activeItem, onNavigate, onLogout }: SidebarProps) {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const items = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'products', label: t('nav.products'), icon: Package },
    { id: 'landing-pages', label: t('nav.landing_pages'), icon: MousePointer2 },
    { id: 'ads-command', label: t('nav.ads_command'), icon: Terminal },
    { id: 'orders', label: t('nav.orders'), icon: ShoppingCart },
  ];

  return (
    <div className={cn(
      "h-full bg-white dark:bg-[#080808] border-r border-gray-100 dark:border-white/5 flex flex-col py-8 shrink-0 transition-all duration-300 relative",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 shadow-sm text-gray-500 hover:text-black dark:hover:text-white z-50 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={cn("mb-12", isCollapsed ? "px-0 flex justify-center" : "px-8")}>
        <div className={cn("flex items-center gap-4 group cursor-pointer", isCollapsed && "justify-center")} onClick={() => onNavigate('dashboard')}>
          <div className="w-12 h-12 shrink-0 bg-black dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-black shadow-[0_10px_25px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_25px_-10px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-500">
            <Zap size={22} fill="currentColor" />
          </div>
          {!isCollapsed && (
            <div className="space-y-0.5 whitespace-nowrap overflow-hidden">
              <h1 className="font-display font-black text-black dark:text-white leading-none tracking-tighter uppercase text-xl italic italic">LEVEL-UP</h1>
              <p className="text-[8px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] font-black">Ecommerce OS</p>
            </div>
          )}
        </div>
      </div>

      <nav className={cn("flex-1 space-y-1", isCollapsed ? "px-2" : "px-4")}>
        {items.map((item) => {
          const isActive = activeItem === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as NavItem)}
              className={cn(
                "w-full flex items-center gap-4 py-3.5 transition-all duration-200 group relative",
                isCollapsed ? "justify-center px-0 rounded-xl" : "px-4",
                isActive 
                   ? "text-black dark:text-white" 
                   : "text-gray-400 hover:text-black dark:hover:text-white",
                isActive && isCollapsed && "bg-gray-100 dark:bg-white/10"
              )}
            >
              {isActive && !isCollapsed && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-6 bg-black dark:bg-white"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={18} className={cn("shrink-0", isActive ? "text-black dark:text-white" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300")} />
              {!isCollapsed && (
                <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="px-4 mt-auto space-y-4">
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
      )}
    </div>
  );
}
