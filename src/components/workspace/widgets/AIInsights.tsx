'use client';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { AIInsight } from '@/types';

interface Props { insights?: AIInsight[]; summary?: string; }

const TYPE_CONFIG: Record<string, { bg: string; border: string; dot: string; badge: string }> = {
  positive: { bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.18)',  dot: '#34D399', badge: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
  tip:      { bg: 'rgba(139,92,246,0.06)',   border: 'rgba(139,92,246,0.18)',  dot: '#A78BFA', badge: 'text-violet-300 bg-violet-500/10 border-violet-500/20' },
  neutral:  { bg: 'rgba(59,130,246,0.06)',   border: 'rgba(59,130,246,0.18)',  dot: '#60A5FA', badge: 'text-blue-300 bg-blue-500/10 border-blue-500/20' },
  warning:  { bg: 'rgba(245,158,11,0.06)',   border: 'rgba(245,158,11,0.18)',  dot: '#FBBF24', badge: 'text-amber-300 bg-amber-500/10 border-amber-500/20' },
};

const TYPE_LABEL: Record<string, string> = {
  positive: 'Win', tip: 'Tip', neutral: 'Info', warning: 'Note',
};

export default function AIInsights({ insights = [], summary = '' }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Summary banner */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.06))',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          {/* Shimmer */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }} />

          <div className="flex items-center gap-2 mb-2">
            <div className="size-5 rounded-md flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <Sparkles className="size-3 text-violet-300" />
            </div>
            <p className="text-[11px] text-violet-300 font-semibold uppercase tracking-widest">Today's Summary</p>
            <span className="ml-auto size-1.5 rounded-full bg-violet-400 animate-pulse" />
          </div>
          <p className="text-[13px] text-white/65 leading-relaxed">{summary}</p>
        </motion.div>
      )}

      {/* Insight cards */}
      {insights.map((ins, i) => {
        const cfg = TYPE_CONFIG[ins.type] ?? TYPE_CONFIG.neutral;
        return (
          <motion.div
            key={ins.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="group p-3.5 rounded-xl cursor-default transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none flex-shrink-0">{ins.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-white/90">{ins.title}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ml-auto flex-shrink-0 ${cfg.badge}`}>
                    {TYPE_LABEL[ins.type] ?? 'Info'}
                  </span>
                </div>
                <p className="text-[12px] text-white/45 leading-relaxed">{ins.desc}</p>
              </div>
            </div>
          </motion.div>
        );
      })}

      {insights.length === 0 && !summary && (
        <div className="py-8 text-center text-white/25 text-sm">
          <Sparkles className="size-6 mx-auto mb-2 text-violet-500/30" />
          No insights yet
        </div>
      )}
    </div>
  );
}
