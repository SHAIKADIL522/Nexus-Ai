'use client';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import type { StockData } from '@/types';

const COLORS = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];
const BG_COLORS = ['rgba(139,92,246,0.1)', 'rgba(245,158,11,0.1)', 'rgba(16,185,129,0.1)', 'rgba(239,68,68,0.1)'];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: {value:number}[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs"
      style={{ background: 'rgba(12,14,28,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-white/40 mb-1">{label}</p>
      <p className="text-white font-semibold">${payload[0].value.toLocaleString()}</p>
    </div>
  );
}

interface Props { stocks?: StockData[]; }

export default function StockChart({ stocks = [] }: Props) {
  const [idx, setIdx] = useState(0);
  const active = stocks[idx];
  if (!active) return <p className="text-white/30 text-sm py-4 text-center">No stock data</p>;

  const color = COLORS[idx % COLORS.length];
  const isUp = active.change >= 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Stock tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {stocks.map((s, i) => (
          <button
            key={s.symbol}
            onClick={() => setIdx(i)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
            style={i === idx ? {
              background: BG_COLORS[i % COLORS.length],
              border: `1px solid ${COLORS[i % COLORS.length]}40`,
              color: COLORS[i % COLORS.length],
            } : {
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            <span className="size-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {s.symbol}
          </button>
        ))}
      </div>

      {/* Price display */}
      <div className="flex items-end gap-3">
        <div>
          <p className="text-[11px] text-white/30 uppercase tracking-widest mb-1">{active.symbol}</p>
          <motion.p
            key={active.symbol}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white font-display"
          >
            ${active.price.toLocaleString()}
          </motion.p>
        </div>
        <div className={`flex items-center gap-1 pb-1 text-sm font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {isUp ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          {isUp ? '+' : ''}{active.change.toFixed(2)}
          <span className="text-[11px] opacity-60 ml-1">
            ({active.changePercent >= 0 ? '+' : ''}{active.changePercent.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Area chart */}
      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={active.data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${idx})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
