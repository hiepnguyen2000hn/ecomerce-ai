'use client';

import React from 'react';
import { useDashboard } from '@/lib/hooks/use-products';
import { TrendingUp, TrendingDown, Users, ShoppingBag, Activity } from 'lucide-react';
import { SlidingNumber } from '@/components/animate-ui/sliding-number';

export function DashboardView() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-12 flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-12 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {data?.stats.map((stat: any, i: number) => (
          <div key={i} className="bg-white dark:bg-[#0c0c0c] p-8 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none transition-all hover:scale-[1.02]">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-4xl font-display font-black text-black dark:text-white uppercase tracking-tighter">{stat.value}</h3>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0c0c0c] rounded-[48px] border border-gray-100 dark:border-white/5 p-10">
        <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tighter mb-10 flex items-center gap-3">
          <Activity size={24} className="text-blue-500" />
          Recent Global Activity
        </h3>
        <div className="space-y-6">
          {data?.recentActivity.map((activity: any) => (
            <div key={activity.id} className="flex items-center gap-6 p-6 bg-gray-50/50 dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/5 group hover:border-black/5 dark:hover:border-white/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black">
                {activity.type.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-black dark:text-white uppercase tracking-tight">{activity.message}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
