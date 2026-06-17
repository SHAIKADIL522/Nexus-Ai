'use client';
import { Suspense } from 'react';
import { useWorkspaceStore } from '@/store/workspace.store';
import { widgetRegistry, WIDGET_META } from '@/ai/widget-registry';
import SafeWidget from './SafeWidget';
import WidgetSkeleton from './widgets/WidgetSkeleton';
import type { Widget, WidgetType } from '@/types';
import { X, Maximize2, Minimize2, GripVertical, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const toolMap: Record<WidgetType, string> = {
  kanban: 'renderKanbanBoard', stock: 'renderStockChart',
  weather: 'renderWeather', analytics: 'renderAnalytics', notes: 'renderNotes',
  focusTimer: 'renderFocusTimer', activityTimeline: 'renderActivityTimeline',
  aiInsights: 'renderAIInsights',
};

// Per-widget glow accent colors
const WIDGET_ACCENTS: Partial<Record<WidgetType, { from: string; glow: string }>> = {
  kanban:           { from: 'rgba(99,102,241,0.08)',  glow: 'rgba(99,102,241,0.15)' },
  stock:            { from: 'rgba(245,158,11,0.07)',  glow: 'rgba(245,158,11,0.12)' },
  weather:          { from: 'rgba(6,182,212,0.07)',   glow: 'rgba(6,182,212,0.12)' },
  analytics:        { from: 'rgba(139,92,246,0.08)',  glow: 'rgba(139,92,246,0.15)' },
  notes:            { from: 'rgba(16,185,129,0.07)',  glow: 'rgba(16,185,129,0.12)' },
  focusTimer:       { from: 'rgba(236,72,153,0.07)',  glow: 'rgba(236,72,153,0.12)' },
  activityTimeline: { from: 'rgba(59,130,246,0.07)',  glow: 'rgba(59,130,246,0.12)' },
  aiInsights:       { from: 'rgba(234,179,8,0.07)',   glow: 'rgba(234,179,8,0.12)' },
};

function WidgetCard({ widget, index }: { widget: Widget; index: number }) {
  const { removeWidget, setActiveWidget, activeWidgetId } = useWorkspaceStore();
  const isActive = activeWidgetId === widget.id;
  const toolKey = toolMap[widget.type];
  const meta = WIDGET_META[toolKey] ?? { icon: '🔲', label: widget.type };
  const WidgetComponent = widgetRegistry[toolKey];
  const accent = WIDGET_ACCENTS[widget.type];

  let props: Record<string, unknown> = {};
  if (widget.type === 'kanban') {
    props = { columns: widget.data, boardTitle: widget.title };
  } else if (widget.type === 'stock') {
    props = { stocks: (widget.data as { stocks?: unknown[] })?.stocks ?? widget.data };
  } else if (typeof widget.data === 'object' && widget.data !== null && !Array.isArray(widget.data)) {
    props = widget.data as unknown as Record<string, unknown>;
  } else {
    props = { content: widget.data, title: widget.title };
  }

  const maxH = widget.type === 'kanban' ? 'max-h-[500px]' : widget.type === 'aiInsights' ? 'max-h-[520px]' : 'max-h-[440px]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="widget-card relative rounded-2xl overflow-hidden"
      style={{
        background: isActive
          ? `linear-gradient(160deg, ${accent?.from ?? 'rgba(139,92,246,0.07)'} 0%, rgba(255,255,255,0.03) 100%)`
          : `linear-gradient(160deg, ${accent?.from ?? 'rgba(255,255,255,0.025)'} 0%, rgba(255,255,255,0.02) 100%)`,
        border: isActive
          ? `1px solid rgba(139,92,246,0.28)`
          : '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        boxShadow: isActive
          ? `0 8px 40px ${accent?.glow ?? 'rgba(139,92,246,0.15)'}, 0 0 0 1px rgba(255,255,255,0.04)`
          : '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top shine line */}
      <div className="absolute top-0 left-4 right-4 h-px opacity-60"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }} />

      {/* Widget header */}
      <div className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <GripVertical className="size-3.5 text-white/15 cursor-grab flex-shrink-0" />
        <span className="text-base leading-none">{meta.icon}</span>
        <span className="text-sm font-semibold text-white/80 flex-1 font-display">{widget.title}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full text-white/25"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {new Date(widget.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="flex items-center gap-0.5 ml-1">
          <button
            onClick={() => setActiveWidget(isActive ? null : widget.id)}
            className="size-6 flex items-center justify-center rounded-lg text-white/25 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            {isActive ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </button>
          <button
            onClick={() => removeWidget(widget.id)}
            className="size-6 flex items-center justify-center rounded-lg text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      <div className={`p-4 overflow-auto custom-scrollbar ${maxH}`}>
        <SafeWidget widgetName={widget.title}>
          <Suspense fallback={<WidgetSkeleton type={widget.type} />}>
            {WidgetComponent
              ? <WidgetComponent {...props} />
              : <p className="text-white/30 text-sm text-center py-4">Unknown widget: {widget.type}</p>
            }
          </Suspense>
        </SafeWidget>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  const prompts = ['Sprint board', 'Stock chart', 'Analytics', 'Focus Timer', 'AI Insights'];
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[420px] text-center px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-5"
      >
        {/* Orb */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)', filter: 'blur(20px)', transform: 'scale(1.5)' }} />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="size-14 rounded-2xl flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <Sparkles className="size-6 text-violet-400/60" />
          </motion.div>
        </div>

        <div>
          <p className="text-white/40 text-sm font-medium font-display">Your workspace is empty</p>
          <p className="text-white/20 text-xs mt-1.5 max-w-[220px] leading-relaxed">
            Ask Nexus to build a widget, or pick a template from the sidebar
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mt-1">
          {prompts.map(s => (
            <span key={s}
              className="text-[11px] px-3 py-1.5 rounded-full text-white/30"
              style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              {s}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function WidgetRenderer() {
  const { widgets } = useWorkspaceStore();
  if (!widgets.length) return <EmptyState />;
  return (
    <div className="flex flex-col gap-4 p-4">
      <AnimatePresence mode="popLayout">
        {widgets.map((w, i) => <WidgetCard key={w.id} widget={w} index={i} />)}
      </AnimatePresence>
    </div>
  );
}
