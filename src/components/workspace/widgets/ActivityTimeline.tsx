'use client';
import { motion } from 'framer-motion';
import type { ActivityItem } from '@/types';
import { Activity } from 'lucide-react';

interface Props { activities?: ActivityItem[]; }

const TYPE_STYLES: Record<string, { border: string; bg: string }> = {
  kanban:    { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)' },
  task:      { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)' },
  template:  { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
  focus:     { bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.25)' },
  analytics: { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)' },
  notes:     { bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.25)' },
  weather:   { bg: 'rgba(14,165,233,0.12)',  border: 'rgba(14,165,233,0.25)' },
  default:   { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
};

export default function ActivityTimeline({ activities = [] }: Props) {
  if (!activities.length) {
    return (
      <div className="py-10 text-center">
        <Activity className="size-6 mx-auto mb-2 text-white/15" />
        <p className="text-white/25 text-sm">No activity yet. Start working!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {activities.map((a, i) => {
        const style = TYPE_STYLES[a.type] ?? TYPE_STYLES.default;
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all group hover:bg-white/[0.025] cursor-default"
          >
            {/* Icon dot */}
            <div className="size-7 rounded-lg flex items-center justify-center border flex-shrink-0 text-sm transition-transform group-hover:scale-105"
              style={{ background: style.bg, border: `1px solid ${style.border}` }}>
              {a.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-white/65 group-hover:text-white/90 transition-colors leading-tight truncate">
                {a.action}
              </p>
            </div>

            {/* Time */}
            <span className="text-[10px] text-white/20 flex-shrink-0">{a.time}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
