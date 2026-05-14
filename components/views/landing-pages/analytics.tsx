'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ExternalLink, 
  Settings2, 
  ArrowUpRight, 
  ArrowDownRight,
  MousePointer2,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { ApiLandingPage } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface LandingPageAnalyticsProps {
  lp: ApiLandingPage;
  onBack: () => void;
}

const SCROLL_DATA = [
  { p: '0%', v: 95 },
  { p: '25%', v: 82 },
  { p: '50%', v: 45 },
  { p: '75%', v: 28 },
  { p: '100%', v: 18 },
];

const SOURCE_DATA = [
  { name: 'Facebook', value: 450, color: '#4f46e5' },
  { name: 'TikTok', value: 300, color: '#000000' },
  { name: 'Google Search', value: 140, color: '#cbd5e1' },
];

export function LandingPageAnalytics({ lp, onBack }: LandingPageAnalyticsProps) {
  const { t } = useTranslation();

  return (
    <div className="p-8 space-y-8 pb-20">
      {/* Sub Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h3 className="text-xl font-display font-black text-black dark:text-white uppercase tracking-tight">{t('landing_pages.analytics.title')}: {lp.slug}</h3>
            <a href={`https://levelup.cdn/${lp.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-bold text-blue-500 hover:underline flex items-center gap-1.5 mt-0.5">
              https://levelup.cdn/{lp.slug}
              <ExternalLink size={10} />
            </a>
          </div>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
          <span>{t('landing_pages.analytics.edit')}</span>
          <Settings2 size={16} />
        </button>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: t('landing_pages.analytics.kpi.cv_rate'), value: '3.2%', trend: '+0.4%', up: true, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
          { label: t('landing_pages.analytics.kpi.cpa'), value: '$12.5', trend: '-12%', up: false, icon: DollarSign, color: 'bg-blue-50 text-blue-600' },
          { label: t('landing_pages.analytics.kpi.roi'), value: '4.2x', trend: '+1.2x', up: true, icon: Zap, color: 'bg-violet-50 text-violet-600' },
          { label: t('landing_pages.analytics.kpi.active_users'), value: '890', trend: '+240', up: true, icon: Users, color: 'bg-gray-50 text-gray-600' },
        ].map((kpi, i) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 rounded-[2.5rem] shadow-xl shadow-black/5"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", kpi.color)}>
                <kpi.icon size={20} strokeWidth={2.5} />
              </div>
              <span className={cn(
                "text-[10px] font-black px-2 py-1 rounded-lg",
                kpi.up ? "bg-emerald-100/50 text-emerald-600" : "bg-red-100/50 text-red-600"
              )}>
                {kpi.trend}
              </span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
            <p className="text-3xl font-display font-black text-black dark:text-white tracking-tighter">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Source Distribution */}
        <div className="col-span-4 bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl shadow-black/5 flex flex-col items-center">
          <div className="w-full flex items-center gap-3 mb-8">
            <BarChart3 size={16} className="text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('landing_pages.analytics.charts.source_dist')}</span>
          </div>
          
          <div className="w-full h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SOURCE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {SOURCE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-display font-black text-black dark:text-white leading-none">890</span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Users</span>
            </div>
          </div>

          <div className="w-full space-y-3 mt-4">
            {SOURCE_DATA.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs font-bold text-gray-500">{s.name}</span>
                </div>
                <span className="text-xs font-black text-black dark:text-white italic">{s.value} Users</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="col-span-8 bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl shadow-black/5">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <TrendingUp size={16} className="text-gray-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('landing_pages.analytics.charts.funnel')}</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center h-80 relative">
            {/* Custom Funnel UI using simple CSS/motion for Wao effect */}
            <div className="w-full max-w-lg space-y-4">
              {[
                { label: 'Visitors', value: '1,250', width: '100%', color: 'from-blue-100 to-blue-200' },
                { label: 'Engaged', value: '890', width: '80%', color: 'from-blue-200 to-blue-300' },
                { label: 'Form Start', value: '310', width: '45%', color: 'from-cyan-200 to-cyan-300' },
                { label: 'Conversion', value: '40', width: '15%', color: 'from-emerald-300 to-emerald-400' },
              ].map((step, i) => (
                <div key={step.label} className="relative flex flex-col items-center group">
                  <div className="flex items-center justify-between w-full mb-1 px-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{step.label}</span>
                    <span className="text-xs font-black text-black dark:text-white">{step.value}</span>
                  </div>
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "h-12 rounded-xl bg-gradient-to-r shadow-sm origin-center group-hover:scale-y-110 transition-transform",
                      step.color
                    )}
                    style={{ width: step.width }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Scroll Depth */}
        <div className="col-span-8 bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl shadow-black/5">
          <div className="flex items-center gap-3 mb-12">
            <MousePointer2 size={16} className="text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('landing_pages.analytics.charts.scroll_depth')}</span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SCROLL_DATA}>
                <defs>
                  <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="p" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                />
                <YAxis hide />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="v" 
                  stroke="#4f46e5" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorV)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight */}
        <div className="col-span-4 bg-[#1e1b4b] dark:bg-[#1e1b4b] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/50 flex flex-col text-white">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight">{t('landing_pages.analytics.ai_insight.title')}</p>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t('landing_pages.analytics.ai_insight.subtitle')}</p>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors cursor-default group">
              <p className="text-xs font-medium leading-relaxed italic text-white/80 group-hover:text-white transition-colors">
                &quot;Detected 73% drop-off in Section 3. AI recommends changing headline from &apos;Buy Now&apos; to &apos;Try for Free&apos; to increase engagement.&quot;
              </p>
            </div>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors cursor-default group">
              <p className="text-xs font-medium leading-relaxed italic text-white/80 group-hover:text-white transition-colors">
                &quot;TikTok traffic shows highest ROI (5.5x). Suggest increasing budget by 20% for this segment.&quot;
              </p>
            </div>
          </div>

          <button className="w-full mt-10 p-5 bg-white text-indigo-950 font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
            {t('landing_pages.analytics.ai_insight.apply')}
            <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
