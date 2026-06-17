'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Play, CheckSquare, Clock, Activity, Zap, AlertCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

interface AgentTask { id: string; description: string; status: 'pending' | 'running' | 'done' | 'error'; output?: string; ts: Date; }
interface Agent { id: string; name: string; description: string; icon: string; color: string; border: string; tasks: AgentTask[]; capabilities: string[]; }

const AGENTS: Agent[] = [
  {
    id: 'research', name: 'Research Agent', icon: '🔍',
    color: 'from-cyan-500/10', border: 'border-cyan-500/20',
    description: 'Autonomously searches the web, synthesizes sources, and generates comprehensive research reports with citations.',
    capabilities: ['Web search via Tavily', 'Content extraction via Firecrawl', 'Report synthesis via NVIDIA NIM', 'Citation management', 'Follow-up generation'],
    tasks: [
      { id:'t1', description:'Research NVIDIA NIM vs AWS Bedrock comparison', status:'done', output:'Completed 8-page comparative analysis with 12 citations. NVIDIA NIM leads in raw throughput (5x); Bedrock offers better managed scaling.', ts: new Date('2025-06-05') },
      { id:'t2', description:'Find top AI startups funded in Q2 2025', status:'done', output:'Identified 23 AI startups with $50M+ funding rounds. Full report with investor details saved to Knowledge Vault.', ts: new Date('2025-06-04') },
    ],
  },
  {
    id: 'career', name: 'Career Agent', icon: '💼',
    color: 'from-amber-500/10', border: 'border-amber-500/20',
    description: 'Analyzes your resume, scores ATS compatibility, generates tailored applications and prepares interview strategies.',
    capabilities: ['ATS resume scoring', 'Cover letter generation', 'Interview question prep', 'LinkedIn optimization', 'Job match analysis'],
    tasks: [
      { id:'t3', description:'Optimize resume for Senior ML Engineer roles at FAANG', status:'done', output:'ATS score improved from 71 to 87. Added 14 key technical keywords. Resume saved as Resume_v2_FAANG.pdf.', ts: new Date('2025-06-03') },
    ],
  },
  {
    id: 'document', name: 'Document Agent', icon: '📄',
    color: 'from-violet-500/10', border: 'border-violet-500/20',
    description: 'Processes uploaded documents to extract insights, generate summaries, answer questions, and create structured notes.',
    capabilities: ['PDF/DOCX/PPTX processing', 'Key insight extraction', 'Auto-summarization', 'Q&A over documents', 'Notes generation'],
    tasks: [
      { id:'t4', description:'Summarize all Q3 strategy documents', status:'done', output:'Processed 4 documents (84 pages). Generated executive summary with 7 action items and key OKRs.', ts: new Date('2025-06-02') },
    ],
  },
  {
    id: 'productivity', name: 'Productivity Agent', icon: '⚡',
    color: 'from-emerald-500/10', border: 'border-emerald-500/20',
    description: 'Manages your tasks, schedules, and workspace. Creates Kanban boards, prioritizes work, and tracks progress.',
    capabilities: ['Task creation & prioritization', 'Smart scheduling', 'Kanban board management', 'Progress tracking', 'Meeting summaries'],
    tasks: [],
  },
];

function AgentCard({ agent, onSelect, isSelected }: { agent: Agent; onSelect: () => void; isSelected: boolean }) {
  const runningCount = agent.tasks.filter(t => t.status === 'running').length;
  return (
    <div onClick={onSelect}
      className={`group p-5 rounded-2xl cursor-pointer transition-all bg-gradient-to-br ${agent.color} to-transparent border ${isSelected ? agent.border.replace('/20','/40') : agent.border}`}
      style={{ boxShadow: isSelected ? `0 0 24px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.06)` : undefined }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl flex items-center justify-center text-2xl" style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>{agent.icon}</div>
          <div>
            <h3 className="font-bold font-display text-white/90">{agent.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`size-1.5 rounded-full ${runningCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
              <span className="text-[10px] text-white/40">{runningCount > 0 ? 'Running' : 'Ready'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] text-violet-300" style={{ background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.2)' }}>
          <Activity className="size-3" /> {agent.tasks.length} tasks
        </div>
      </div>
      <p className="text-xs text-white/45 leading-relaxed mb-4">{agent.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {agent.capabilities.slice(0,3).map(c => (
          <span key={c} className="text-[10px] px-2 py-0.5 rounded-full text-white/40" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>{c}</span>
        ))}
        {agent.capabilities.length > 3 && <span className="text-[10px] text-white/30">+{agent.capabilities.length - 3} more</span>}
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [selectedId, setSelectedId] = useState<string>('research');
  const [taskInput, setTaskInput] = useState('');
  const [running, setRunning] = useState(false);

  const selected = agents.find(a => a.id === selectedId)!;

  function runTask() {
    if (!taskInput.trim() || running) return;
    const newTask: AgentTask = { id: Date.now().toString(), description: taskInput.trim(), status: 'running', ts: new Date() };
    setAgents(prev => prev.map(a => a.id === selectedId ? { ...a, tasks: [newTask, ...a.tasks] } : a));
    setTaskInput('');
    setRunning(true);
    setTimeout(() => {
      setAgents(prev => prev.map(a => a.id === selectedId ? {
        ...a, tasks: a.tasks.map(t => t.id === newTask.id ? {
          ...t, status: 'done',
          output: `Agent completed: "${newTask.description}". Connect your API keys (NVIDIA_API_KEY, TAVILY_API_KEY) to enable real autonomous execution with live results.`
        } : t)
      } : a));
      setRunning(false);
    }, 2800);
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black font-display mb-2">Agent Hub</h1>
          <p className="text-white/40 text-sm">Autonomous AI agents powered by NVIDIA NIM — delegate complex tasks and get results</p>
        </div>

        {/* Provider status */}
        <div className="mb-8 flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.15)' }}>
          <Zap className="size-4 text-violet-400 flex-shrink-0" />
          <p className="text-xs text-white/60">All agents use the <span className="text-violet-300 font-semibold">Provider Manager</span> — NVIDIA NIM primary, OpenRouter fallback. Set API keys in <code className="px-1 rounded text-[11px]" style={{background:'rgba(255,255,255,0.08)'}}>/.env.local</code> to enable real agent execution.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent grid */}
          <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} onSelect={() => setSelectedId(agent.id)} isSelected={selectedId === agent.id} />
            ))}
          </div>

          {/* Agent detail */}
          <div className="lg:col-span-2 space-y-5">
            <AnimatePresence mode="wait">
              <motion.div key={selectedId} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                {/* Task input */}
                <div className="p-5 rounded-2xl mb-5" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">{selected.icon}</span>
                    <h2 className="font-bold font-display text-white/90">{selected.name}</h2>
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
                      <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Capabilities</label>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.capabilities.map(c => (
                        <span key={c} className="text-[10px] px-2.5 py-1 rounded-full text-violet-300" style={{ background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                  <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">New Task</label>
                  <div className="flex gap-2">
                    <input value={taskInput} onChange={e => setTaskInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && runTask()}
                      placeholder={`Describe what the ${selected.name} should do...`}
                      className="flex-1 px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25" />
                    <button onClick={runTask} disabled={!taskInput.trim() || running}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all hover:-translate-y-0.5"
                      style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow:'0 0 16px rgba(124,58,237,0.3)' }}>
                      {running ? <><div className="size-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Running</> : <><Play className="size-4"/>Run</>}
                    </button>
                  </div>
                </div>

                {/* Task history */}
                <div>
                  <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock className="size-4" /> Task History ({selected.tasks.length})
                  </h3>
                  {selected.tasks.length === 0 ? (
                    <div className="py-12 text-center rounded-2xl" style={{ background:'rgba(255,255,255,0.015)', border:'1px solid rgba(255,255,255,0.06)' }}>
                      <Bot className="size-8 text-white/10 mx-auto mb-3" />
                      <p className="text-white/25 text-sm">No tasks yet. Give this agent something to do!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selected.tasks.map(task => (
                        <motion.div key={task.id} layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                          className="p-4 rounded-2xl" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)' }}>
                          <div className="flex items-start gap-3">
                            <div className={`size-8 rounded-xl flex items-center justify-center flex-shrink-0 ${task.status === 'done' ? 'bg-emerald-500/15' : task.status === 'running' ? 'bg-amber-500/15' : 'bg-red-500/15'}`}>
                              {task.status === 'done' ? <CheckSquare className="size-4 text-emerald-400" /> : task.status === 'running' ? <div className="size-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" /> : <AlertCircle className="size-4 text-red-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white/80 mb-1">{task.description}</p>
                              {task.output && <p className="text-xs text-white/45 leading-relaxed">{task.output}</p>}
                              <p className="text-[10px] text-white/25 mt-2">{task.ts.toLocaleString()}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
