'use client';
import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BarChart2, CloudSun, StickyNote, Kanban,
  Trash2, Plus, Timer, Activity, Brain, Search, Sparkles, Zap,
} from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace.store';
import { WORKSPACE_TEMPLATES } from '@/data/templates';

const QUICK_COMMANDS = [
  { group: 'Create Widget', items: [
    { id:'kanban',    label:'Sprint Board',             icon:<Kanban className="size-4 text-indigo-400"/>,  prompt:'Create an engineering sprint board with backlog, in-progress, review and done columns' },
    { id:'stock',     label:'Stock Chart',              icon:<BarChart2 className="size-4 text-amber-400"/>, prompt:'Show stock chart for NVDA TSLA AAPL' },
    { id:'weather',   label:'Weather Forecast',         icon:<CloudSun className="size-4 text-cyan-400"/>,  prompt:'Show weather forecast for Hyderabad' },
    { id:'analytics', label:'Analytics Dashboard',      icon:<LayoutDashboard className="size-4 text-violet-400"/>, prompt:'Show analytics dashboard with KPI metrics' },
    { id:'notes',     label:'Notes Widget',             icon:<StickyNote className="size-4 text-emerald-400"/>, prompt:'Create a notes widget' },
    { id:'timer',     label:'Focus Timer',              icon:<Timer className="size-4 text-rose-400"/>,     prompt:'Focus timer 25 minutes' },
    { id:'insights',  label:'AI Productivity Insights', icon:<Brain className="size-4 text-yellow-400"/>,   prompt:'Show AI productivity insights' },
    { id:'timeline',  label:'Activity Timeline',        icon:<Activity className="size-4 text-blue-400"/>,  prompt:'Activity timeline' },
  ]},
  { group: 'Workspace', items: [
    { id:'clear', label:'Clear All Widgets',  icon:<Trash2 className="size-4 text-red-400"/>,  prompt:'__clear__' },
    { id:'new',   label:'New Session',        icon:<Plus className="size-4 text-blue-400"/>,   prompt:'new-session' },
  ]},
];

interface Props { open: boolean; onClose: () => void; onPrompt: (p: string) => void; }

export default function CommandPalette({ open, onClose, onPrompt }: Props) {
  const [search, setSearch] = useState('');
  const { clearWidgets } = useWorkspaceStore();

  useEffect(() => { if (!open) setSearch(''); }, [open]);

  const run = async (prompt: string) => {
    onClose();
    if (prompt === '__clear__') { clearWidgets(); return; }
    if (prompt === '__reload__') { window.location.reload(); return; }
    onPrompt(prompt);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(5,8,22,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[14%] left-1/2 -translate-x-1/2 z-50 w-full max-w-[560px] px-4"
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-1 rounded-3xl opacity-50"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.2))', filter: 'blur(16px)' }} />

              <Command
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(10,12,26,0.96)',
                  backdropFilter: 'blur(32px)',
                  border: '1px solid rgba(139,92,246,0.25)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                }}
                shouldFilter
              >
                {/* Search bar */}
                <div className="flex items-center gap-3 px-4 py-4 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <Search className="size-4 text-violet-400 flex-shrink-0" />
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search commands, create widgets, run templates…"
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/25 focus:outline-none"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                  <div className="flex items-center gap-1">
                    <kbd className="text-[10px] px-2 py-0.5 rounded-lg text-white/25" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>ESC</kbd>
                  </div>
                </div>

                <Command.List className="max-h-[420px] overflow-y-auto py-2 custom-scrollbar">
                  <Command.Empty className="py-12 text-center text-sm text-white/25">
                    <div className="flex flex-col items-center gap-2">
                      <Sparkles className="size-6 text-violet-500/40" />
                      No commands found
                    </div>
                  </Command.Empty>

                  {/* Templates */}
                  <Command.Group
                    heading="Workspace Templates"
                    className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-white/20 [&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:items-center [&_[cmdk-group-heading]]:gap-1.5"
                  >
                    {WORKSPACE_TEMPLATES.map(t => (
                      <Command.Item
                        key={t.id}
                        value={t.name}
                        onSelect={async () => {
                          onClose();
                          for (let i = 0; i < t.prompts.length; i++) {
                            await new Promise(r => setTimeout(r, i * 400));
                            onPrompt(t.prompts[i]);
                          }
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl cursor-pointer text-sm text-white/60 hover:text-white data-[selected=true]:bg-white/[0.06] data-[selected=true]:text-white transition-colors group"
                      >
                        <span className="text-base leading-none">{t.icon}</span>
                        <span className="flex-1">{t.name}</span>
                        <span className="text-[10px] text-white/20 group-data-[selected=true]:text-white/40">
                          {t.tags.length} widgets
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>

                  {/* Quick commands */}
                  {QUICK_COMMANDS.map(group => (
                    <Command.Group
                      key={group.group}
                      heading={group.group}
                      className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-white/20"
                    >
                      {group.items.map(item => (
                        <Command.Item
                          key={item.id}
                          value={item.label}
                          onSelect={() => run(item.prompt)}
                          className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl cursor-pointer text-sm text-white/60 hover:text-white data-[selected=true]:bg-white/[0.06] data-[selected=true]:text-white transition-colors"
                        >
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="flex-1">{item.label}</span>
                          <Zap className="size-3 text-white/15 data-[selected=true]:text-violet-400" />
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}
                </Command.List>

                {/* Footer hint */}
                <div className="flex items-center justify-between px-4 py-2.5 border-t"
                  style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                  <div className="flex items-center gap-3 text-[10px] text-white/25">
                    <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/[0.05] border border-white/[0.06]">↑↓</kbd> navigate</span>
                    <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/[0.05] border border-white/[0.06]">↵</kbd> select</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-violet-400/50">
                    <Sparkles className="size-3" />
                    Nexus AI
                  </div>
                </div>
              </Command>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
