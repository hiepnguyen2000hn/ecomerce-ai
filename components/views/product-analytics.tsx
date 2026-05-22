'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import {
  PauseCircle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageLayout } from '@/components/layout/page-layout';
import type { ApiProduct } from '@/lib/api/types';

interface ProductAnalyticsProps {
  product: ApiProduct;
  onBack: () => void;
}

// ── Mock data ────────────────────────────────────────────────────────────────

const PERF_DATA = [
  { month: 'Jan', revenue: 12000, spend: 4200, velocity: 8500, profit: 7800 },
  { month: 'Feb', revenue: 18000, spend: 5800, velocity: 13000, profit: 12200 },
  { month: 'Mar', revenue: 15000, spend: 5100, velocity: 10500, profit: 9900 },
  { month: 'Apr', revenue: 28000, spend: 7200, velocity: 20000, profit: 20800 },
  { month: 'May', revenue: 38000, spend: 9400, velocity: 30000, profit: 28600 },
  { month: 'Jun', revenue: 32000, spend: 8100, velocity: 24000, profit: 23900 },
  { month: 'Jul', revenue: 41000, spend: 10200, velocity: 33000, profit: 30800 },
  { month: 'Aug', revenue: 36000, spend: 9800, velocity: 28000, profit: 26200 },
  { month: 'Sep', revenue: 45000, spend: 11500, velocity: 37000, profit: 33500 },
];

const FULFILLMENT_DATA = [
  { w: 'W1', approval: 72, rts: 18 },
  { w: 'W2', approval: 80, rts: 14 },
  { w: 'W3', approval: 75, rts: 20 },
  { w: 'W4', approval: 85, rts: 10 },
  { w: 'W5', approval: 78, rts: 12 },
];

const LP_CVR_DATA = [
  { d: 'M', v: 2.1 }, { d: 'T', v: 2.4 }, { d: 'W', v: 2.2 },
  { d: 'T', v: 2.6 }, { d: 'F', v: 2.4 }, { d: 'S', v: 2.8 }, { d: 'S', v: 2.3 },
];
const LP_BOUNCE_DATA = [
  { d: 'M', v: 44 }, { d: 'T', v: 42 }, { d: 'W', v: 46 },
  { d: 'T', v: 40 }, { d: 'F', v: 42 }, { d: 'S', v: 38 }, { d: 'S', v: 41 },
];

const VARIANTS = [
  { name: 'Variant A', sales: 38, cvr: 2.4, revenue: 820, roas: 10.8, trend: 'up' },
  { name: 'Variant B', sales: 54, cvr: 2.4, revenue: 535, roas: 17.2, trend: 'up' },
  { name: 'Variant C', sales: 29, cvr: 2.4, revenue: 280, roas: 17.2, trend: 'up' },
  { name: 'Variant D', sales: 36, cvr: 2.4, revenue: 295, roas: 13.5, trend: 'up' },
  { name: 'Variant E', sales: 31, cvr: 0.3, revenue: 105, roas: 3.2, trend: 'down' },
  { name: 'Variant F', sales: 1,  cvr: 0.7, revenue: 55,  roas: 3.8, trend: 'down' },
];

const AI_INSIGHTS = [
  {
    type: 'warning' as const,
    text: '"A/B Test Variant E" showing low conversion rate. Consider adjusting the CTA or header messaging.',
  },
  {
    type: 'opportunity' as const,
    text: '"Variant B" showing strong ROAS. Consider scaling ad budget by 20–30% to maximise returns.',
  },
];

// ── Metric toggle labels ─────────────────────────────────────────────────────

const CHART_LINES: {
  key: keyof typeof PERF_DATA[0];
  label: string;
  color: string;
}[] = [
  { key: 'revenue',  label: 'POS Revenue',    color: '#10b981' },
  { key: 'spend',    label: 'Ad Spend',        color: '#6366f1' },
  { key: 'velocity', label: 'Sales Velocity',  color: '#f59e0b' },
  { key: 'profit',   label: 'NET Profit',      color: '#3b82f6' },
];

// ── Circular ROAS gauge ──────────────────────────────────────────────────────

function RoasGauge({ value, label, max = 10 }: { value: number; label: string; max?: number }) {
  const r = 48;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = pct * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[120px] h-[120px]">
        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90 absolute inset-0">
          <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="9" className="text-gray-100 dark:text-white/[0.07]" />
          <motion.circle
            cx="60" cy="60" r={r}
            fill="none"
            stroke="#10b981"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - dash }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-black dark:text-white font-display">{value}x</span>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{label}</span>
    </div>
  );
}

// ── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: { d: string; v: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2 shadow-xl text-[10px] font-bold">
      <p className="text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-black dark:text-white">${(p.value / 1000).toFixed(1)}K</span>
        </div>
      ))}
    </div>
  );
}

// ── Card wrapper ─────────────────────────────────────────────────────────────

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none', className)}>
      {children}
    </div>
  );
}

function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-sm font-display font-black text-black dark:text-white uppercase tracking-tight">{title}</h3>
      {action ?? (
        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
          <MoreHorizontal size={14} />
        </button>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────


export function ProductAnalytics({ product, onBack }: ProductAnalyticsProps) {
  const [activeLines, setActiveLines] = useState<Set<string>>(new Set(['revenue', 'spend']));

  const toggleLine = (key: string) =>
    setActiveLines(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <PageLayout
      breadcrumb={[
        { label: 'Inventory', onClick: onBack },
        { label: product.name },
      ]}
      contentClassName="overflow-y-auto no-scrollbar px-4 sm:px-6 lg:px-10 xl:px-12 pb-20"
    >
      {/* Page title row */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between py-6"
      >
        <h1 className="text-2xl font-display font-black text-black dark:text-white uppercase tracking-tight">
          Product Analytics
        </h1>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
          <PauseCircle size={14} />
          Pause All Ads
        </button>
      </motion.div>

      {/* Row 1: Performance chart + ROAS */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 mb-5">
        {/* Performance line chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
              <h3 className="text-sm font-display font-black text-black dark:text-white uppercase tracking-tight">
                Product Performance
              </h3>
              <div className="flex flex-wrap gap-3">
                {CHART_LINES.map(l => (
                  <button
                    key={l.key}
                    onClick={() => toggleLine(l.key as string)}
                    className={cn(
                      'flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
                      activeLines.has(l.key as string) ? 'opacity-100' : 'opacity-30',
                    )}
                  >
                    <span
                      className="w-3 h-3 rounded-sm flex items-center justify-center border-2"
                      style={{ borderColor: l.color, background: activeLines.has(l.key as string) ? l.color : 'transparent' }}
                    />
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={PERF_DATA} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-white/5" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor' }} className="text-gray-400" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor' }} className="text-gray-400" axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} />
                <Tooltip content={<ChartTooltip />} />
                {CHART_LINES.map(l =>
                  activeLines.has(l.key as string) ? (
                    <Line
                      key={l.key}
                      type="monotone"
                      dataKey={l.key as string}
                      stroke={l.color}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  ) : null,
                )}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* ROAS gauges */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full flex flex-col">
            <CardHeader title="ROAS Efficiency" />
            <div className="flex-1 flex items-center justify-around gap-6 py-4">
              <RoasGauge value={2.7} label="3D ROAS" max={10} />
              <RoasGauge value={6.5} label="7D ROAS" max={10} />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Row 2: Fulfillment + LP Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Fulfillment */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader title="Fulfillment" />
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Approval Rate</p>
                <p className="text-2xl font-black text-black dark:text-white font-display mb-3">78%</p>
                <ResponsiveContainer width="100%" height={48}>
                  <BarChart data={FULFILLMENT_DATA} barSize={10} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="approval" fill="#10b981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">RTS</p>
                <p className="text-2xl font-black text-black dark:text-white font-display mb-3">12%</p>
                <ResponsiveContainer width="100%" height={48}>
                  <BarChart data={FULFILLMENT_DATA} barSize={10} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="rts" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Landing Page Performance */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader title="Landing Page Performance" />
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">CVR</p>
                <p className="text-2xl font-black text-black dark:text-white font-display mb-3">2.4%</p>
                <Sparkline data={LP_CVR_DATA} color="#10b981" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Bounce Rate</p>
                <p className="text-2xl font-black text-black dark:text-white font-display mb-3">42%</p>
                <Sparkline data={LP_BOUNCE_DATA} color="#ef4444" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Row 3: Variant table + AI Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        {/* Variant table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-0 overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-gray-50 dark:border-white/5">
              <h3 className="text-sm font-display font-black text-black dark:text-white uppercase tracking-tight">
                A/B Variant Performance
              </h3>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-50 dark:border-white/5">
                  {['Variant', 'Sales', 'CVR', 'Revenue', 'ROAS'].map(col => (
                    <th key={col} className="px-6 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VARIANTS.map((v, i) => (
                  <motion.tr
                    key={v.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.28 + i * 0.04 }}
                    className="group border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-1 h-6 rounded-full shrink-0', v.trend === 'up' ? 'bg-emerald-500' : 'bg-red-400')} />
                        <span className="text-xs font-black text-black dark:text-white">{v.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300">{v.sales}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span className={v.trend === 'up' ? 'text-gray-600 dark:text-gray-300' : 'text-red-500'}>{v.cvr}%</span>
                        {v.trend === 'up'
                          ? <TrendingUp size={12} className="text-emerald-500" />
                          : <TrendingDown size={12} className="text-red-500" />
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300">${v.revenue.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'text-xs font-black',
                        v.roas >= 10 ? 'text-emerald-500' : v.roas >= 5 ? 'text-amber-500' : 'text-red-500',
                      )}>
                        {v.roas}x
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full flex flex-col">
            <CardHeader
              title="AI Insights"
              action={
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                  <Sparkles size={10} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">AI</span>
                </div>
              }
            />
            <div className="space-y-3 flex-1">
              {AI_INSIGHTS.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.06 }}
                  className={cn(
                    'flex gap-3 p-4 rounded-xl border text-xs font-medium leading-relaxed',
                    insight.type === 'warning'
                      ? 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 text-gray-600 dark:text-gray-300'
                      : 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 text-gray-600 dark:text-gray-300',
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    {insight.type === 'warning'
                      ? <AlertTriangle size={14} className="text-amber-500" />
                      : <Lightbulb size={14} className="text-emerald-500" />
                    }
                  </div>
                  <p>{insight.text}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
}
