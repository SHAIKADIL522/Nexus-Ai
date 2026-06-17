'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Aurora from '@/components/aurora/Aurora';
import Sidebar from '@/components/sidebar/Sidebar';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import WidgetRenderer from '@/components/workspace/WidgetRenderer';
import CommandPalette from '@/components/command/CommandPalette';
import { useWorkspaceStore } from '@/store/workspace.store';
import { useChatStore } from '@/store/chat.store';
import { Sparkles, Menu, Layers, MessageSquare, Square, RotateCcw, Home } from 'lucide-react';
import type { ToolExecution, ToolStep } from '@/types';
import Link from 'next/link';

const TOOL_STEPS: Record<string, ToolStep[]> = {
  renderKanbanBoard: [
    { label: 'Understanding request', status: 'pending' },
    { label: 'Selecting workspace tool', status: 'pending' },
    { label: 'Generating structured data', status: 'pending' },
    { label: 'Rendering widget', status: 'pending' },
    { label: 'Hydrating workspace', status: 'pending' },
  ],
  renderStockChart: [
    { label: 'Understanding request', status: 'pending' },
    { label: 'Selecting workspace tool', status: 'pending' },
    { label: 'Fetching market data', status: 'pending' },
    { label: 'Rendering widget', status: 'pending' },
    { label: 'Hydrating workspace', status: 'pending' },
  ],
  renderWeather: [
    { label: 'Understanding request', status: 'pending' },
    { label: 'Selecting workspace tool', status: 'pending' },
    { label: 'Fetching weather data', status: 'pending' },
    { label: 'Rendering widget', status: 'pending' },
    { label: 'Hydrating workspace', status: 'pending' },
  ],
  renderAnalytics: [
    { label: 'Understanding request', status: 'pending' },
    { label: 'Selecting workspace tool', status: 'pending' },
    { label: 'Computing KPI metrics', status: 'pending' },
    { label: 'Rendering widget', status: 'pending' },
    { label: 'Hydrating workspace', status: 'pending' },
  ],
  renderNotes: [
    { label: 'Understanding request', status: 'pending' },
    { label: 'Selecting workspace tool', status: 'pending' },
    { label: 'Drafting content', status: 'pending' },
    { label: 'Rendering widget', status: 'pending' },
    { label: 'Hydrating workspace', status: 'pending' },
  ],
  renderFocusTimer: [
    { label: 'Understanding request', status: 'pending' },
    { label: 'Configuring Pomodoro timer', status: 'pending' },
    { label: 'Setting session goals', status: 'pending' },
    { label: 'Rendering widget', status: 'pending' },
  ],
  renderActivityTimeline: [
    { label: 'Understanding request', status: 'pending' },
    { label: 'Collecting activity data', status: 'pending' },
    { label: 'Rendering timeline', status: 'pending' },
  ],
  renderAIInsights: [
    { label: 'Understanding request', status: 'pending' },
    { label: 'Analyzing workspace data', status: 'pending' },
    { label: 'Generating insights', status: 'pending' },
    { label: 'Rendering widget', status: 'pending' },
  ],
};

const TOOL_WIDGET_TYPE: Record<string, string> = {
  renderKanbanBoard: 'kanban', renderStockChart: 'stock',
  renderWeather: 'weather', renderAnalytics: 'analytics', renderNotes: 'notes',
  renderFocusTimer: 'focusTimer', renderActivityTimeline: 'activityTimeline',
  renderAIInsights: 'aiInsights',
};
const TOOL_TITLE: Record<string, string> = {
  renderKanbanBoard: 'Sprint Board', renderStockChart: 'Stock Chart',
  renderWeather: 'Weather', renderAnalytics: 'Analytics', renderNotes: 'Notes',
  renderFocusTimer: 'Focus Timer', renderActivityTimeline: 'Activity Timeline',
  renderAIInsights: 'AI Insights',
};

type MobileTab = 'chat' | 'widgets';

// --- Mock AI response engine ---
const MOCK_RESPONSES: Record<string, { text: string; toolName: string; data: object }> = {
  kanban: {
    toolName: 'renderKanbanBoard',
    text: "I've created a **Sprint Board** with 4 columns and prioritised tasks. You can drag cards between columns to update status, and click **+** to add new tasks inline.",
    data: {
      boardTitle: 'Engineering Sprint',
      columns: [
        { id: 'backlog', title: 'Backlog', color: '#6366f1', tasks: [
          { id: 't1', title: 'Implement SSE streaming endpoint', priority: 'high', assignee: 'Adil', tag: 'Backend' },
          { id: 't2', title: 'Design widget registry system', priority: 'medium', assignee: 'Team', tag: 'Architecture' },
          { id: 't3', title: 'Add Playwright E2E tests', priority: 'low', assignee: 'QA', tag: 'Testing' },
        ]},
        { id: 'in-progress', title: 'In Progress', color: '#f59e0b', tasks: [
          { id: 't4', title: 'Build Kanban drag & drop UI', priority: 'high', assignee: 'Adil', tag: 'Frontend' },
          { id: 't5', title: 'Mock AI streaming integration', priority: 'high', assignee: 'Adil', tag: 'AI' },
        ]},
        { id: 'review', title: 'In Review', color: '#8b5cf6', tasks: [
          { id: 't6', title: 'Aurora WebGL background', priority: 'medium', assignee: 'Design', tag: 'UI' },
        ]},
        { id: 'done', title: 'Done', color: '#10b981', tasks: [
          { id: 't7', title: 'Next.js 15 migration', priority: 'high', assignee: 'Adil', tag: 'Setup' },
          { id: 't8', title: 'Zustand store architecture', priority: 'medium', assignee: 'Adil', tag: 'State' },
        ]},
      ],
    },
  },
  stock: {
    toolName: 'renderStockChart',
    text: "Here's the **stock performance chart** showing 30-day price history with daily change and percentage movement. Switch between stocks using the tab buttons.",
    data: {
      stocks: ['NVDA', 'TSLA', 'AAPL'].map((sym, si) => {
        const bases = [875, 245, 193];
        const changes = [142.4, -12.7, 18.3];
        const base = bases[si];
        let v = base;
        const now = new Date();
        const data = Array.from({ length: 30 }, (_, i) => {
          v = Math.max(v + (Math.random() - 0.47) * base * 0.025, base * 0.4);
          const d = new Date(now); d.setDate(d.getDate() - (30 - i));
          return { time: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: parseFloat(v.toFixed(2)) };
        });
        const price = data[data.length - 1].value;
        const chg = changes[si];
        return { symbol: sym, price, change: parseFloat((price * chg / 100).toFixed(2)), changePercent: chg, data };
      }),
    },
  },
  analytics: {
    toolName: 'renderAnalytics',
    text: "Your **analytics dashboard** is live with 4 KPI metrics and 8-month trend chart. All data is locally generated — no backend required.",
    data: {
      title: 'Performance Dashboard',
      metrics: [
        { label: 'Active Users', value: '12.4K', change: 22.3 },
        { label: 'Sessions', value: '84.2K', change: 15.8 },
        { label: 'Avg Response', value: '0.9s', change: -18.4 },
        { label: 'Uptime', value: '99.97%', change: 0.02 },
      ],
      chart: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'].map(name => ({
        name, value: Math.round(20000 + Math.random() * 80000),
      })),
    },
  },
  weather: {
    toolName: 'renderWeather',
    text: "Here's the **weather forecast** showing current conditions and a 5-day outlook. Weather data is locally generated for demo purposes.",
    data: {
      city: 'Hyderabad', temp: 34, condition: 'Partly Cloudy',
      humidity: 58, wind: 18,
      forecast: ['Mon','Tue','Wed','Thu','Fri'].map((day, i) => ({
        day, high: 33 + i, low: 23 + i, icon: ['☀️','⛅','🌦','🌧','☀️'][i],
      })),
    },
  },
  notes: {
    toolName: 'renderNotes',
    text: "I've created a **Notes widget** with a starter template. Click **Edit** to modify the content — changes are saved locally.",
    data: {
      title: 'Project Notes',
      content: `# Project Goals\n\n- Build a premium AI-inspired workspace frontend\n- Showcase React, TypeScript, and Next.js skills\n- Deploy to Vercel for recruiter review\n\n## Today's Focus\n\n1. Complete the dashboard layout\n2. Add drag-and-drop widget reordering\n3. Polish animations and transitions\n\n> "The best way to predict the future is to build it." — Alan Kay`,
    },
  },
  focusTimer: {
    toolName: 'renderFocusTimer',
    text: "Your **Pomodoro Focus Timer** is ready. 25-minute work sessions with 5-minute breaks. Start focusing to track your deep work streaks.",
    data: { workMinutes: 25, breakMinutes: 5, sessionsGoal: 4 },
  },
  activityTimeline: {
    toolName: 'renderActivityTimeline',
    text: "Here's your **Activity Timeline** showing recent workspace actions. All events are tracked locally as you work.",
    data: {
      activities: [
        { id: 'a1', action: 'Created Sprint Board', time: '2 min ago', type: 'kanban', icon: '🗂' },
        { id: 'a2', action: 'Added task: SSE streaming', time: '5 min ago', type: 'task', icon: '✅' },
        { id: 'a3', action: 'Opened Finance Workspace template', time: '12 min ago', type: 'template', icon: '📈' },
        { id: 'a4', action: 'Completed 2 Pomodoro sessions', time: '34 min ago', type: 'focus', icon: '🍅' },
        { id: 'a5', action: 'Generated Analytics Dashboard', time: '1 hr ago', type: 'analytics', icon: '📊' },
        { id: 'a6', action: 'Updated Notes widget', time: '2 hr ago', type: 'notes', icon: '📝' },
        { id: 'a7', action: 'Checked Weather — Hyderabad', time: '3 hr ago', type: 'weather', icon: '🌤' },
      ],
    },
  },
  aiInsights: {
    toolName: 'renderAIInsights',
    text: "Here are your **AI Productivity Insights** for today. Focus time increased and task completion is above your weekly average.",
    data: {
      insights: [
        { id: 'i1', title: 'Focus time up 23%', desc: 'Your deep work sessions this week are 23% longer than last week. Morning sessions are most effective.', type: 'positive', icon: '🧠' },
        { id: 'i2', title: '12 tasks completed', desc: 'You completed 12 tasks today — 4 more than your daily average of 8. Design tasks had the fastest resolution time.', type: 'positive', icon: '✅' },
        { id: 'i3', title: 'Peak hour: 10–11 AM', desc: 'Your productivity peak is consistently 10–11 AM. Schedule complex tasks during this window for best output.', type: 'tip', icon: '⚡' },
        { id: 'i4', title: 'Workspace active 4.2 hrs', desc: 'Total workspace time today is 4.2 hours. Consider a 15-minute break to maintain peak performance.', type: 'neutral', icon: '⏱' },
      ],
      summary: 'You completed 12 tasks, wrote 8 notes, and had 4 deep work sessions today. Your productivity score is 87 — above your 7-day average of 74.',
    },
  },
};

function detectIntent(text: string): string {
  const t = text.toLowerCase();
  if (/board|sprint|kanban|task|backlog|project/.test(t)) return 'kanban';
  if (/stock|chart|price|market|nvda|tsla|aapl|finance|crypto/.test(t)) return 'stock';
  if (/analytic|dashboard|kpi|revenue|sales|metric|performance/.test(t)) return 'analytics';
  if (/weather|forecast|temperature|rain|sunny|humidity/.test(t)) return 'weather';
  if (/note|document|write|journal|memo/.test(t)) return 'notes';
  if (/focus|timer|pomodoro|deep work|concentrate/.test(t)) return 'focusTimer';
  if (/activity|timeline|history|recent|actions/.test(t)) return 'activityTimeline';
  if (/insight|ai insight|smart|suggestion|productivity stat|summary/.test(t)) return 'aiInsights';
  return 'kanban';
}

export default function WorkspacePage() {
  const { sidebarOpen, setSidebarOpen, addWidget, widgets, saveSession } = useWorkspaceStore();
  const { messages, addMessage, updateLastAssistant, updateMessageTool, setStreaming, isStreaming, clearMessages } = useChatStore();
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => { useWorkspaceStore.persist.rehydrate(); }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCommandOpen(true); }
      if (e.key === 'Escape') setCommandOpen(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fully local mock AI - no API needed
  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;
    if (text === 'new-session') {
      if (messages.length > 0) {
        saveSession(`Session ${new Date().toLocaleTimeString()}`, messages);
        toast.success('Session saved');
      }
      clearMessages();
      return;
    }

    const userMsgId = addMessage({ role: 'user', content: text });
    const asstMsgId = addMessage({ role: 'assistant', content: '' });
    setStreaming(true);

    const intent = detectIntent(text);
    const response = MOCK_RESPONSES[intent] ?? MOCK_RESPONSES.kanban;
    const steps = TOOL_STEPS[response.toolName] ?? [];

    // Animate tool execution steps
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 280 + Math.random() * 120));
      const currentSteps: ToolStep[] = steps.map((s, si) => ({
        ...s,
        status: si < i ? 'done' : si === i ? 'running' : 'pending',
      }));
      updateMessageTool(asstMsgId, { steps: currentSteps });
    }

    // All steps done + render widget
    const widgetId = addWidget({
      type: (TOOL_WIDGET_TYPE[response.toolName] ?? 'notes') as 'kanban'|'stock'|'weather'|'analytics'|'notes'|'focusTimer'|'activityTimeline'|'aiInsights',
      title: TOOL_TITLE[response.toolName] ?? response.toolName,
      data: response.data as never,
    });

    const doneSteps: ToolStep[] = steps.map(s => ({ ...s, status: 'done' as const }));
    updateMessageTool(asstMsgId, { steps: doneSteps, widgetId });
    toast.success(`${TOOL_TITLE[response.toolName] ?? 'Widget'} rendered in workspace`);

    // Stream text response character by character
    let streamed = '';
    for (let i = 0; i < response.text.length; i++) {
      await new Promise(r => setTimeout(r, 10 + Math.random() * 8));
      streamed += response.text[i];
      updateLastAssistant(streamed);
    }

    setStreaming(false);
    void userMsgId;
  }, [addMessage, updateLastAssistant, updateMessageTool, setStreaming, clearMessages, messages, saveSession, addWidget]);

  const handleStop = useCallback(() => {
    setStreaming(false);
    toast('Generation stopped');
  }, [setStreaming]);

  const handleRetry = useCallback(() => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser) handleSend(lastUser.content);
  }, [messages, handleSend]);

  const SUGGESTIONS = [
    'Engineering sprint board',
    'Stock chart NVDA vs TSLA',
    'Sales analytics dashboard',
    'Weather forecast Hyderabad',
    'Focus timer 25 min',
    'Show AI productivity insights',
    'Activity timeline',
    'Personal notes widget',
  ];
  type MobileTabTuple = [MobileTab, React.ReactNode, string];

  return (
    <div className="flex h-screen w-full overflow-hidden relative" style={{ background: 'var(--bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Aurora />
      </div>
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.022]"
        style={{ backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat:'repeat', backgroundSize:'150px' }} />

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} onPrompt={handleSend} />

      <div className="relative z-20 hidden md:block flex-shrink-0">
        <Sidebar onCommandPalette={() => setCommandOpen(true)} onPrompt={handleSend} />
      </div>

      <div className="flex flex-col flex-1 relative z-10 min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(5,8,22,0.7)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="size-7 flex items-center justify-center rounded-lg text-[#4a4a52] hover:text-white hover:bg-white/5 transition-all">
                <Menu className="size-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)", boxShadow: "0 0 16px rgba(139,92,246,0.4)" }}>
                <Sparkles className="size-3.5 text-white" />
              </div>
              <span className="text-white font-semibold text-sm hidden sm:block font-display tracking-tight">Nexus AI Workspace</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hidden md:block">No API Key · Offline Ready</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[#4a4a52] hover:text-white hover:bg-white/5 text-[11px] transition-all">
              <Home className="size-3" /><span>Home</span>
            </Link>
            <AnimatePresence>
              {isStreaming && (
                <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }}
                  className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-violet-300 text-[11px]" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
                    <motion.span className="size-1.5 rounded-full bg-violet-400 block" animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:0.8, repeat:Infinity }} />
                    Streaming…
                  </div>
                  <button onClick={handleStop}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-red-400 text-[11px] hover:bg-red-500/20 transition-all" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <Square className="size-3" fill="currentColor" />
                    <span className="hidden sm:inline">Stop</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {!isStreaming && messages.length > 1 && (
              <button onClick={handleRetry}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[#4a4a52] hover:text-white hover:bg-white/5 text-[11px] transition-all">
                <RotateCcw className="size-3" />Retry
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-white/25 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-white/[0.05] transition-all" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} onClick={() => setCommandOpen(true)}>
              <kbd className="text-[#4a4a52]">⌘K</kbd><span className="ml-1">commands</span>
            </div>
          </div>
        </header>

        {/* Mobile tabs */}
        <div className="md:hidden flex flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(5,8,22,0.7)", backdropFilter: "blur(16px)" }}>
          {([
            ['chat', <MessageSquare key="c" className="size-3.5" />, 'Chat'],
            ['widgets', <Layers key="w" className="size-3.5" />, `Widgets${widgets.length > 0 ? ` (${widgets.length})` : ''}`],
          ] as MobileTabTuple[]).map(([tab, icon, label]) => (
            <button key={tab} onClick={() => setMobileTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-all ${mobileTab === tab ? 'text-white border-b-2 border-violet-500' : 'text-[#5a5a62]'}`}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Split panels */}
        <div className="flex flex-1 min-h-0">
          {/* Chat panel */}
          <div className={`flex-col ${mobileTab === 'chat' ? 'flex' : 'hidden'} md:flex md:w-[46%] md:min-w-[300px]`}>
            <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
              <AnimatePresence>
                {messages.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="flex flex-col items-center justify-center h-full py-12 text-center">
                    <div className="relative mb-5">
                      <div className="size-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))", border: "1px solid rgba(139,92,246,0.2)" }}>
                        <Sparkles className="size-7 text-violet-400/60" />
                      </div>
                      <motion.div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
                        animate={{ scale:[1,1.15,1] }} transition={{ duration:2, repeat:Infinity }}>
                        <span className="text-[10px] text-emerald-400">✦</span>
                      </motion.div>
                    </div>
                    <p className="text-sm font-semibold text-white/40 mb-1.5 font-display">Ask Nexus to build</p>
                    <p className="text-xs text-white/20 max-w-[260px] mb-5 leading-relaxed">
                      I render interactive widgets — Kanban boards, stock charts, analytics dashboards, focus timers, and more.
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-w-[320px]">
                      {SUGGESTIONS.map(s => (
                        <button key={s} onClick={() => handleSend(s)}
                          className="text-[11px] px-3 py-2 rounded-xl text-white/40 hover:text-white/90 hover:bg-white/[0.06] transition-all text-left leading-tight" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  messages.map(m => <ChatMessage key={m.id} message={m} />)
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
            <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <ChatInput onSend={handleSend} isStreaming={isStreaming} />
            </div>
          </div>

          {/* Widget panel */}
          <div className={`flex-col flex-1 min-w-0 ${mobileTab === 'widgets' ? 'flex' : 'hidden'} md:flex overflow-y-auto custom-scrollbar`}>
            <WidgetRenderer />
          </div>
        </div>
      </div>
    </div>
  );
}
