'use client';

import React, { useState } from 'react';
import { 
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
            className="relative flex items-center group outline-none"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "p-1 rounded-full border-2 transition-all duration-500",
                showProfile 
                  ? "border-black dark:border-white bg-black dark:bg-white shadow-[0_0_25px_rgba(0,0,0,0.1)] dark:shadow-[0_0_25px_rgba(255,255,255,0.1)]" 
                  : "border-gray-100 dark:border-white/10"
              )}
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 bg-gray-100 dark:bg-white/5">
                <Image
                  src="https://picsum.photos/id/64/100/100"
                  alt="Profile"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
            
            <span className={cn(
              "absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 rounded-full shadow-sm transition-colors duration-500",
              showProfile ? "border-black dark:border-white" : "border-white dark:border-[#080808]"
            )} />
          </button>

          <ProfileMenu isOpen={showProfile} onClose={() => setShowProfile(false)} />
        </div>
      </div>
    </header>
  );
}

function NotificationPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const notifications = [
    { id: 1, title: 'Product Updated', description: 'E-commerce UI Kit v2.0 is live', time: '2m ago', icon: <Package size={14} />, color: 'from-blue-500 to-cyan-500' },
    { id: 2, title: 'New Order', description: 'Order #1204 received from Jane', time: '15m ago', icon: <ShoppingCart size={14} />, color: 'from-emerald-500 to-teal-500' },
    { id: 3, title: 'Campaign Active', description: 'Summer Sale 2024 is now active', time: '1h ago', icon: <Sparkles size={14} />, color: 'from-violet-500 to-purple-500' },
    { id: 4, title: 'Inventory Alert', description: 'Graphic Hoodies stock is below 10', time: '3h ago', icon: <Box size={14} />, color: 'from-orange-500 to-amber-500' },
    { id: 5, title: 'System Message', description: 'Monthly analytics report is ready', time: '5h ago', icon: <LayoutDashboard size={14} />, color: 'from-slate-500 to-gray-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="absolute top-full mt-4 right-0 w-80 bg-white/90 dark:bg-[#0c0c0c]/90 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-50 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Activity Center</span>
              <div className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-red-500/50" />
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-3 space-y-1">
              {notifications.map((n, i) => (
                <motion.button 
                  key={n.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-full p-4 hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-all flex gap-4 group rounded-[1.5rem]"
                >
                  <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-all duration-500 bg-gradient-to-br shadow-lg", n.color)}>
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold truncate leading-tight tracking-tight">{n.title}</p>
                      <span className="text-[9px] font-mono opacity-30 whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-white/40 truncate mt-1">{n.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
            <button className="w-full p-5 text-[10px] font-black uppercase tracking-[0.3em] border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-gray-400 hover:text-black dark:hover:text-white">
              Archive & History
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ProfileMenu({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const menuItems = [
    { icon: User, label: 'Identity', sub: 'Profile & Bio' },
    { icon: Settings, label: 'Preference', sub: 'Tools & Security' },
    { icon: Sparkles, label: 'Membership', sub: 'Executive Tier' },
    { icon: LogOut, label: 'Disconnect', sub: 'Secure Logout', danger: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="absolute top-full mt-4 right-0 w-72 bg-white/95 dark:bg-[#0c0c0c]/95 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 overflow-hidden"
          >
            <div className="relative p-8 border-b border-gray-100 dark:border-white/5 overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-700" />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Authorized User</p>
                <p className="text-lg font-display font-black text-black dark:text-white mt-1 leading-tight tracking-tighter">HIEP NGUYEN</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <p className="text-[9px] font-mono text-gray-400 dark:text-white/30 uppercase font-bold tracking-widest truncate">hiepnguyendevft@gmail.com</p>
                </div>
              </div>
            </div>
            <div className="p-3 space-y-1">
              {menuItems.map((item, i) => (
                <motion.button 
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "w-full p-4 hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-all flex items-center gap-4 group rounded-[1.5rem]",
                    item.danger && "hover:bg-red-50 dark:hover:bg-red-500/10"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all duration-500 shadow-sm group-hover:shadow-xl",
                    item.danger && "group-hover:bg-red-500 group-hover:text-white"
                  )}>
                    <item.icon size={18} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-bold leading-none tracking-tight transition-colors", item.danger && "text-red-500 group-hover:text-red-600")}>{item.label}</p>
                    <p className="text-[9px] text-gray-400 dark:text-white/20 mt-1.5 uppercase font-black tracking-[0.2em]">{item.sub}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
