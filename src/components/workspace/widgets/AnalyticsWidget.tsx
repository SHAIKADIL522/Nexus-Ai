'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AnalyticsData, AnalyticsMetric } from '@/types';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: {value:number}[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs"
      style={{ background: 'rgba(12,14,28,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(139,92,246,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <p className="text-white/40 mb-1">{label}</p>
      <p className="text-white font-semibold">${(payload[0].value / 1000).toFixed(1)}K</p>
    </div>
  );
}

interface Props { title?: string; metrics?: AnalyticsMetric[]; chart?: { name: string; value: number }[]; }

export default function AnalyticsWidget({ title = 'Analytics', metrics = [], chart = [] }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl transition-all hover:bg-white/[0.03] cursor-default"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">{m.label}</p>
            <p className="text-xl font-bold text-white font-display">{m.value}</p>
            <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-medium ${m.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {m.change >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {m.change >= 0 ? '+' : ''}{m.change.toFixed(1)}%
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div>
        <p className="text-[11px] text-white/30 uppercase tracking-wider mb-3">{title} — 8-Month Trend</p>
        <div className="h-[130px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} barSize={16}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                {chart.map((_, ci) => (
                  <Cell
                    key={ci}
                    fill={ci === chart.length - 1 ? '#8B5CF6' : 'rgba(139,92,246,0.35)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
