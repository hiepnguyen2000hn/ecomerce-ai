'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter, Download, Plus, SlidersHorizontal,
} from 'lucide-react';
import { useAtomValue } from 'jotai';
import { adsTabAtom } from '@/lib/store';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type CampaignStatus = 'PAUSED' | 'SCALING' | 'WARNING' | 'STABLE';
type Grade = 'A' | 'B' | 'C' | 'D';

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  budget: string;
  spent: string;
  grade: Grade;
  roas: number;
  purch: number;
  cpa: string;
  ctr: string;
  freq: number;
  cpm: string;
  hook: string;
  pacing: string;
  bounce: string;
  scroll: string;
  cart: string;
  gap: string;
  conf: string;
  active: boolean;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const HOURLY_DATA = Array.from({ length: 25 }, (_, i) => {
  const h = i.toString().padStart(2, '0') + ':00';
  const base = Math.sin((i / 24) * Math.PI);
  return {
    time: h,
    spent:       Math.round(200 + base * 900 + Math.random() * 120),
    conversions: Math.round(8  + base * 55  + Math.random() * 10),
    roas:        parseFloat((2.5 + base * 2.2 + Math.random() * 0.4).toFixed(2)),
  };
});

const CAMPAIGNS: Campaign[] = [
  {
    id: 'c1', name: 'TOF_US_Lookalike_90D', status: 'PAUSED',
    budget: '$1,200', spent: '$842', grade: 'A', roas: 4.21, purch: 42,
    cpa: '$20.04', ctr: '2.1%', freq: 1.2, cpm: '$14.50',
    hook: '42%', pacing: '92%', bounce: '22%', scroll: '68%',
    cart: '8.2%', gap: '1.2%', conf: '98%', active: false,
  },
  {
    id: 'c2', name: 'RET_US_DPA_7D_ATC', status: 'SCALING',
    budget: '$500', spent: '$498', grade: 'A', roas: 6.82, purch: 89,
    cpa: '$5.60', ctr: '4.8%', freq: 4.2, cpm: '$18.20',
    hook: '61%', pacing: '100%', bounce: '12%', scroll: '91%',
    cart: '18.4%', gap: '0.4%', conf: '99%', active: true,
  },
  {
    id: 'c3', name: 'TOF_UK_Interest_Broad', status: 'WARNING',
    budget: '$800', spent: '$120', grade: 'D', roas: 1.02, purch: 4,
    cpa: '$30.00', ctr: '0.6%', freq: 1.1, cpm: '$22.40',
    hook: '18%', pacing: '15%', bounce: '72%', scroll: '24%',
    cart: '1.1%', gap: '8.4%', conf: '42%', active: true,
  },
  {
    id: 'c4', name: 'MOF_US_Video_Viewers', status: 'STABLE',
    budget: '$2,000', spent: '$1,450', grade: 'B', roas: 2.94, purch: 52,
    cpa: '$27.88', ctr: '1.8%', freq: 2.4, cpm: '$12.10',
    hook: '38%', pacing: '72%', bounce: '31%', scroll: '55%',
    cart: '6.2%', gap: '2.5%', conf: '85%', active: true,
  },
];

const KPI_STATS = [
  {
    label: 'Total Spent',
    value: '$12,450',
    badge: '88% Cap',
    badgeClass: 'text-amber-500 bg-amber-500/10',
  },
  {
    label: 'Average ROAS',
    value: '3.42',
    badge: '+12%',
    badgeClass: 'text-emerald-500 bg-emerald-500/10',
  },
  {
    label: 'Active Campaigns',
    value: '14',
    badge: '2 Launching',
    badgeClass: 'text-blue-500 bg-blue-500/10',
  },
  {
    label: 'Avg. CPA',
    value: '$18.92',
    badge: '-4%',
    badgeClass: 'text-red-500 bg-red-500/10',
  },
];

const STATUS_STYLE: Record<CampaignStatus, string> = {
  PAUSED:  'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400',
  SCALING: 'bg-teal-500/10 text-teal-500',
  WARNING: 'bg-red-500/10 text-red-500',
  STABLE:  'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400',
};

const GRADE_COLOR: Record<Grade, string> = {
  A: 'text-emerald-500',
  B: 'text-blue-500',
  C: 'text-amber-500',
  D: 'text-red-500',
};

type TrendMetric = 'spent' | 'conversions' | 'roas';

const TREND_META: Record<TrendMetric, { color: string; label: string }> = {
  spent:       { color: '#4f46e5', label: 'Spent' },
  conversions: { color: '#10b981', label: 'Conversions' },
  roas:        { color: '#ef4444', label: 'ROAS' },
};

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'relative w-10 h-5 rounded-full transition-colors duration-300 shrink-0',
        active ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/10',
      )}
    >
      <motion.div
        animate={{ x: active ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function AdsCommandView() {
  const activeTab                     = useAtomValue(adsTabAtom);
  const [metric, setMetric]           = React.useState<TrendMetric>('spent');
  const [campaigns, setCampaigns]     = React.useState<Campaign[]>(CAMPAIGNS);

  const toggleCampaign = (id: string) =>
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));

  const { color } = TREND_META[metric];

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc] dark:bg-[#080808]">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab !== 'Monitor' ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center py-40 text-gray-400"
            >
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                <SlidersHorizontal size={28} className="opacity-40" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-black dark:text-white">{activeTab}</p>
              <p className="text-xs font-medium mt-2 opacity-60">Coming soon</p>
            </motion.div>
          ) : (
            <motion.div
              key="Monitor"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="px-4 sm:px-6 lg:px-10 xl:px-12 pt-6 pb-24 space-y-5"
            >

              {/* KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5">
                {KPI_STATS.map((kpi, i) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white dark:bg-[#0c0c0c] px-6 py-5"
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{kpi.label}</p>
                    <div className="flex items-end gap-2.5">
                      <span className="text-2xl font-display font-black text-black dark:text-white tracking-tight leading-none">
                        {kpi.value}
                      </span>
                      <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-md mb-0.5', kpi.badgeClass)}>
                        {kpi.badge}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Performance Trends */}
              <div className="bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
                <div className="flex items-start justify-between mb-1 flex-wrap gap-4">
                  <div>
                    <h3 className="text-sm font-display font-black text-black dark:text-white uppercase tracking-tight">
                      Performance Trends
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                      Aggregated real-time metrics across all active clusters
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(Object.entries(TREND_META) as [TrendMetric, { color: string; label: string }][]).map(([key, meta]) => (
                      <button
                        key={key}
                        onClick={() => setMetric(key)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                          metric === key
                            ? 'bg-gray-100 dark:bg-white/10 text-black dark:text-white'
                            : 'text-gray-400 hover:text-black dark:hover:text-white',
                        )}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color }} />
                        {meta.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-56 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={HOURLY_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="adsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-white/5" />
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fontWeight: 700, fill: 'currentColor' }}
                        className="text-gray-400"
                        interval={3}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          background: '#111',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#fff',
                        }}
                      />
                      <Area
                        key={metric}
                        type="monotone"
                        dataKey={metric}
                        stroke={color}
                        strokeWidth={2.5}
                        fill="url(#adsGrad)"
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Live Campaign Performance */}
              <div className="bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50 dark:border-white/5 flex-wrap gap-3">
                  <h3 className="text-sm font-display font-black text-black dark:text-white uppercase tracking-tight">
                    Live Campaign Performance
                  </h3>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 transition-all">
                      <Filter size={11} />
                      Filters
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 transition-all">
                      <Download size={11} />
                      Export CSV
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-600/20">
                      <Plus size={11} strokeWidth={3} />
                      New launch
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[1200px] border-collapse">
                    <thead>
                      <tr className="border-b border-gray-50 dark:border-white/5">
                        {['Campaign', 'Status', 'Budget', 'Spent', 'Grade', 'ROAS', 'Purch', 'CPA', 'CTR', 'Freq', 'CPM', 'Hook', 'Pacing', 'Bounce', 'Scroll', 'Cart', 'Gap', 'Conf', 'Action'].map(col => (
                          <th key={col} className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-[0.18em] text-gray-400 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((c, i) => (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-4 py-3.5">
                            <span className="text-[11px] font-black text-blue-500 font-mono max-w-[170px] truncate block">
                              {c.name}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn('px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest', STATUS_STYLE[c.status])}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-[11px] font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">{c.budget}</td>
                          <td className="px-4 py-3.5 text-[11px] font-black text-black dark:text-white whitespace-nowrap">{c.spent}</td>
                          <td className="px-4 py-3.5">
                            <span className={cn('text-sm font-black', GRADE_COLOR[c.grade])}>{c.grade}</span>
                          </td>
                          <td className="px-4 py-3.5 text-[11px] font-black text-black dark:text-white">{c.roas}</td>
                          <td className="px-4 py-3.5 text-[11px] font-bold text-gray-600 dark:text-gray-400">{c.purch}</td>
                          <td className="px-4 py-3.5 text-[11px] font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">{c.cpa}</td>
                          <td className="px-4 py-3.5 text-[11px] font-bold text-gray-600 dark:text-gray-400">{c.ctr}</td>
                          <td className="px-4 py-3.5 text-[11px] font-bold text-gray-600 dark:text-gray-400">{c.freq}</td>
                          <td className="px-4 py-3.5 text-[11px] font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">{c.cpm}</td>
                          <td className="px-4 py-3.5 text-[11px] font-bold text-gray-600 dark:text-gray-400">{c.hook}</td>
                          <td className="px-4 py-3.5 text-[11px] font-bold text-gray-600 dark:text-gray-400">{c.pacing}</td>
                          <td className="px-4 py-3.5 text-[11px] font-bold text-gray-600 dark:text-gray-400">{c.bounce}</td>
                          <td className="px-4 py-3.5 text-[11px] font-bold text-gray-600 dark:text-gray-400">{c.scroll}</td>
                          <td className="px-4 py-3.5 text-[11px] font-bold text-gray-600 dark:text-gray-400">{c.cart}</td>
                          <td className="px-4 py-3.5 text-[11px] font-bold text-gray-600 dark:text-gray-400">{c.gap}</td>
                          <td className="px-4 py-3.5 text-[11px] font-bold text-gray-600 dark:text-gray-400">{c.conf}</td>
                          <td className="px-4 py-3.5">
                            <Toggle active={c.active} onChange={() => toggleCampaign(c.id)} />
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
