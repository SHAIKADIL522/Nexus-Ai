'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from '@/store/workspace.store';
import { WORKSPACE_TEMPLATES } from '@/data/templates';
import {
  ChevronLeft, Plus, Sparkles,
  LayoutTemplate, Trash2, ChevronDown,
  BarChart2, Kanban, CloudSun, StickyNote,
  Timer, Activity, Brain, Home, Command, Zap,
} from 'lucide-react';
import Link from 'next/link';
import StatusPill from '@/components/ui/status-pill';

const QUICK_WIDGETS = [
  { label: 'Sprint Board', icon: <Kanban className="size-3.5" />, color: 'text-indigo-400', prompt: 'Create an engineering sprint board' },
  { label: 'Analytics',    icon: <BarChart2 className="size-3.5" />, color: 'text-violet-400', prompt: 'Show analytics dashboard with KPI metrics' },
  { label: 'Stock Chart',  icon: <BarChart2 className="size-3.5" />, color: 'text-amber-400', prompt: 'Show stock chart for NVDA TSLA AAPL' },
  { label: 'Weather',      icon: <CloudSun className="size-3.5" />, color: 'text-cyan-400', prompt: 'Show weather forecast for Hyderabad' },
  { label: 'Notes',        icon: <StickyNote className="size-3.5" />, color: 'text-emerald-400', prompt: 'Create a notes widget' },
  { label: 'Focus Timer',  icon: <Timer className="size-3.5" />, color: 'text-rose-400', prompt: 'Focus timer 25 minutes' },
  { label: 'AI Insights',  icon: <Brain className="size-3.5" />, color: 'text-yellow-400', prompt: 'Show AI productivity insights' },
  { label: 'Timeline',     icon: <Activity className="size-3.5" />, color: 'text-blue-400', prompt: 'Activity timeline' },
];

interface Props { onCommandPalette: () => void; onPrompt: (p: string) => void; }

export default function Sidebar({ onCommandPalette, onPrompt }: Props) {
  const { sidebarOpen, setSidebarOpen, clearWidgets, widgets } = useWorkspaceStore();
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [widgetsOpen, setWidgetsOpen] = useState(true);

  const runTemplate = async (prompts: string[]) => {
    for (let i = 0; i < prompts.length; i++) {
      await new Promise(r => setTimeout(r, i * 400));
      onPrompt(prompts[i]);
    }
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -272, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -272, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col w-68 flex-shrink-0 h-full overflow-hidden z-30 relative"
          style={{ width: 264 }}
        >
          {/* Glass background */}
          <div className="absolute inset-0 bg-[rgba(5,8,22,0.82)] backdrop-blur-2xl border-r border-white/[0.06]" />

          {/* Subtle inner glow */}
          <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-violet-600/[0.04] to-transparent pointer-events-none" />

          <div className="relative flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="relative size-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                  <Sparkles className="size-4 text-white" />
                  <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-[#050816]" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-white tracking-tight">Nexus</p>
                  <StatusPill label="AI Ready" status="active" className="text-[9px] px-1.5 py-0.5" />
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="size-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <ChevronLeft className="size-4" />
              </button>
            </div>

            {/* Nav */}
            <nav className="px-3 py-3 border-b border-white/[0.05] space-y-0.5">
              <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.05] transition-all text-sm group">
                <Home className="size-4 group-hover:text-violet-400 transition-colors" />
                Home
              </Link>
              <button
                onClick={onCommandPalette}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.05] transition-all text-sm group"
              >
                <Command className="size-4 group-hover:text-violet-400 transition-colors" />
                Command Palette
                <kbd className="ml-auto text-[9px] px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-white/30">⌘K</kbd>
              </button>
            </nav>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-3 space-y-1">
              {/* Quick Widgets */}
              <div>
                <button
                  onClick={() => setWidgetsOpen(v => !v)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors mb-1"
                >
                  <Zap className="size-3" />
                  Quick Add
                  <ChevronDown className={`size-3 ml-auto transition-transform ${widgetsOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {widgetsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5">
                        {QUICK_WIDGETS.map(w => (
                          <button
                            key={w.label}
                            onClick={() => onPrompt(w.prompt)}
                            className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.05] transition-all text-sm"
                          >
                            <span className={`${w.color} transition-transform group-hover:scale-110`}>{w.icon}</span>
                            {w.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Templates */}
              <div className="pt-1">
                <button
                  onClick={() => setTemplatesOpen(v => !v)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors mb-1"
                >
                  <LayoutTemplate className="size-3" />
                  Templates
                  <ChevronDown className={`size-3 ml-auto transition-transform ${templatesOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {templatesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5">
                        {WORKSPACE_TEMPLATES.map(t => (
                          <button
                            key={t.id}
                            onClick={() => runTemplate(t.prompts)}
                            className="group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-all"
                          >
                            <span className="text-base leading-none flex-shrink-0">{t.icon}</span>
                            <div className="text-left min-w-0">
                              <p className="text-sm text-white/70 group-hover:text-white transition-colors truncate">{t.name}</p>
                              <p className="text-[10px] text-white/25">{t.tags.length} widgets</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.05] px-3 py-3 space-y-1">
              {widgets.length > 0 && (
                <button
                  onClick={clearWidgets}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/[0.08] transition-all text-sm"
                >
                  <Trash2 className="size-3.5" />
                  Clear Workspace
                  <span className="ml-auto text-[10px] bg-red-400/10 border border-red-400/20 px-1.5 py-0.5 rounded-full">{widgets.length}</span>
                </button>
              )}
              <button
                onClick={() => onPrompt('new-session')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.05] transition-all text-sm"
              >
                <Plus className="size-3.5" />
                New Session
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
