'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
import { useRouter, usePathname } from 'next/navigation';
import { useLogout } from '@/lib/hooks/use-auth';

export type NavItem = 'dashboard' | 'products' | 'landing-pages' | 'ads-command' | 'orders';

export function Sidebar() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const items = [
    { id: 'dashboard',     path: '/dashboard',     label: t('nav.dashboard'),     icon: LayoutDashboard },
    { id: 'products',      path: '/inventory',     label: t('nav.products'),      icon: Package },
    { id: 'landing-pages', path: '/landing-pages', label: t('nav.landing_pages'), icon: MousePointer2 },
    { id: 'ads-command',   path: '/ads-command',   label: t('nav.ads_command'),   icon: Terminal },
    { id: 'orders',        path: '/orders',        label: t('nav.orders'),        icon: ShoppingCart },
  ];

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className={cn(
      "h-full bg-white dark:bg-[#080808] border-r border-gray-100 dark:border-white/5 flex flex-col py-8 shrink-0 transition-all duration-300 relative",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 shadow-sm text-gray-500 hover:text-black dark:hover:text-white z-50 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={cn("mb-12", isCollapsed ? "px-0 flex justify-center" : "px-8")}>
        <div
          className={cn("flex items-center gap-4 group cursor-pointer", isCollapsed && "justify-center")}
          onClick={() => router.push('/dashboard')}
        >
          <div className="w-12 h-12 shrink-0 bg-black dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-black shadow-[0_10px_25px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_25px_-10px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-500">
            <Zap size={22} fill="currentColor" />
          </div>
          {!isCollapsed && (
            <div className="space-y-0.5 whitespace-nowrap overflow-hidden">
              <h1 className="font-display font-black text-black dark:text-white leading-none tracking-tighter uppercase text-xl italic">LEVEL-UP</h1>
              <p className="text-[8px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] font-black">Ecommerce OS</p>
            </div>
          )}
        </div>
      </div>

      <nav className={cn("flex-1 space-y-1", isCollapsed ? "px-2" : "px-4")}>
        {items.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={cn(
                "w-full flex items-center gap-4 py-3.5 transition-all duration-200 group relative",
                isCollapsed ? "justify-center px-0 rounded-xl" : "px-4",
                active
                  ? "text-black dark:text-white"
                  : "text-gray-400 hover:text-black dark:hover:text-white",
                active && isCollapsed && "bg-gray-100 dark:bg-white/10"
              )}
            >
              {active && !isCollapsed && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-6 bg-black dark:bg-white"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={18} className={cn(
                "shrink-0",
                active ? "text-black dark:text-white" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
              )} />
              {!isCollapsed && (
                <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="px-4 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
