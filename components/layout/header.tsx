'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Settings, 
  LogOut, 
  User,
  Sparkles,
  Package,
  ShoppingCart,
  Box,
  LayoutDashboard
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/context/theme-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface HeaderProps {
  title: string;
  breadcrumbs?: string[];
}

export function Header({ title, breadcrumbs }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-24 flex items-center justify-between px-12 bg-white/80 dark:bg-[#080808]/80 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-100 dark:border-white/5 transition-colors duration-300">
      <div className="flex flex-col">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1 uppercase font-bold tracking-widest leading-none">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={crumb}>
                <span>{crumb}</span>
                {i < breadcrumbs.length - 1 && <span className="opacity-30">/</span>}
              </React.Fragment>
            ))}
          </div>
        )}
        <h2 className="text-2xl font-display font-black text-black dark:text-white uppercase tracking-tighter">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-black/5 dark:focus-within:border-white/10 transition-all group w-64">
          <Search size={16} className="text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
          <input 
            type="text" 
            placeholder="Search everything..." 
            className="bg-transparent border-none outline-none text-xs font-medium placeholder:text-gray-400 w-full"
          />
          <span className="text-[10px] font-mono opacity-30">⌘K</span>
        </div>

        <div className="h-8 w-px bg-gray-100 dark:bg-white/5 mx-2" />

        {/* Global Utilities */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button 
            onClick={() => {
              toggleTheme();
              toast.success(theme === 'dark' ? 'Light Mode' : 'Dark Mode', { duration: 1500 });
            }}
            className="p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all text-gray-500 hover:text-black dark:hover:text-white relative group"
          >
            <div className="relative w-5 h-5">
              <motion.div
                animate={{ rotate: theme === 'dark' ? 0 : 180, scale: theme === 'dark' ? 1 : 0, opacity: theme === 'dark' ? 1 : 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sun size={20} strokeWidth={1.5} />
              </motion.div>
              <motion.div
                animate={{ rotate: theme === 'dark' ? -180 : 0, scale: theme === 'dark' ? 0 : 1, opacity: theme === 'dark' ? 0 : 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Moon size={20} strokeWidth={1.5} />
              </motion.div>
            </div>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "p-3 rounded-xl transition-all relative group",
                showNotifications ? "bg-gray-50 dark:bg-white/5 text-black dark:text-white" : "text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              )}
            >
              <Bell size={20} strokeWidth={1.5} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#080808]" />
            </button>
            <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
          </div>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-2xl border border-gray-100 dark:border-white/5 transition-all group"
          >
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-black/5 dark:border-white/10 grayscale hover:grayscale-0 transition-all duration-500 group-hover:scale-105">
              <Image
                src="https://picsum.photos/id/64/100/100"
                alt="Profile"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <ChevronDown size={14} className={cn("text-gray-400 transition-transform duration-300", showProfile && "rotate-180")} />
          </button>

          <ProfileMenu isOpen={showProfile} onClose={() => setShowProfile(false)} />
        </div>
      </div>
    </header>
  );
}

function NotificationPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const notifications = [
    { id: 1, title: 'Product Updated', description: 'E-commerce UI Kit v2.0 is live', time: '2m ago', icon: <Package size={14} />, color: 'bg-blue-500' },
    { id: 2, title: 'New Order', description: 'Order #1204 received from Jane', time: '15m ago', icon: <ShoppingCart size={14} />, color: 'bg-green-500' },
    { id: 3, title: 'Campaign Active', description: 'Summer Sale 2024 is now active', time: '1h ago', icon: <Sparkles size={14} />, color: 'bg-purple-500' },
    { id: 4, title: 'Inventory Alert', description: 'Graphic Hoodies stock is below 10', time: '3h ago', icon: <Box size={14} />, color: 'bg-orange-500' },
    { id: 5, title: 'System Message', description: 'Monthly analytics report is ready', time: '5h ago', icon: <LayoutDashboard size={14} />, color: 'bg-gray-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-4 right-0 w-80 bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.15em] opacity-40">Notifications</span>
              <button className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:underline">Clear all</button>
            </div>
            <div className="max-h-[380px] overflow-y-auto py-2 px-2 space-y-1">
              {notifications.map((n) => (
                <button 
                  key={n.id}
                  className="w-full p-3 hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-all flex gap-3 group rounded-2xl"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform", n.color)}>
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold truncate leading-tight">{n.title}</p>
                      <span className="text-[9px] font-mono opacity-30 whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-white/40 truncate mt-0.5">{n.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <button className="w-full p-4 text-[10px] font-black uppercase tracking-[0.2em] border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors opacity-30">
              View all activity
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ProfileMenu({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const menuItems = [
    { icon: User, label: 'Profile Settings', sub: 'Personal information' },
    { icon: Settings, label: 'Account Security', sub: 'Password & 2FA' },
    { icon: Sparkles, label: 'Upgrade Pro', sub: 'Custom domains' },
    { icon: LogOut, label: 'Sign Out', sub: 'Securely exit', danger: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-4 right-0 w-64 bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 dark:border-white/5">
              <p className="text-xs font-black uppercase tracking-widest text-black dark:text-white">Admin Profile</p>
              <p className="text-[10px] font-mono text-blue-500 mt-1 uppercase font-bold tracking-tighter">hiepnguyendevft@gmail.com</p>
            </div>
            <div className="p-2 space-y-1">
              {menuItems.map((item) => (
                <button 
                  key={item.label}
                  className={cn(
                    "w-full p-3 hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-all flex items-center gap-3 group rounded-2xl",
                    item.danger && "hover:bg-red-50 dark:hover:bg-red-500/10"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 group-hover:scale-110 transition-transform",
                    item.danger && "group-hover:text-red-500"
                  )}>
                    <item.icon size={16} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className={cn("text-xs font-bold leading-none", item.danger && "text-red-500")}>{item.label}</p>
                    <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-widest">{item.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
