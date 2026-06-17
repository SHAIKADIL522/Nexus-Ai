'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Zap } from 'lucide-react';
import type { ToolExecution } from '@/types';

interface Props { execution: ToolExecution; toolName?: string; }

export default function ExecutionTimeline({ execution, toolName }: Props) {
  const allDone = execution.steps.every(s => s.status === 'done');
  const doneCount = execution.steps.filter(s => s.status === 'done').length;
  const progress = (doneCount / execution.steps.length) * 100;

  return (
    <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}
      className="my-2 rounded-xl border border-white/[0.07] bg-[#0f0f15]/80 backdrop-blur-sm p-3.5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`size-5 rounded-md flex items-center justify-center ${allDone ? 'bg-emerald-500/20' : 'bg-violet-500/20'}`}>
            {allDone
              ? <Check className="size-3 text-emerald-400" />
              : <motion.div animate={{ rotate:360 }} transition={{ duration:1.5, repeat:Infinity, ease:'linear' }}><Zap className="size-3 text-violet-400" /></motion.div>}
          </div>
          <span className="text-[11px] font-semibold text-[#8a8a92] uppercase tracking-widest">
            {toolName ? `AI → ${toolName.replace('render','')}` : 'AI Execution'}
          </span>
        </div>
        <span className="text-[10px] text-[#4a4a52]">{doneCount}/{execution.steps.length}</span>
      </div>
      <div className="h-0.5 bg-white/[0.05] rounded-full mb-3 overflow-hidden">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" initial={{ width:0 }} animate={{ width:`${progress}%` }} transition={{ duration:0.3 }} />
      </div>
      <div className="flex flex-col gap-1.5">
        {execution.steps.map((step, i) => (
          <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }} className="flex items-center gap-2.5">
            <div className={`size-4 flex items-center justify-center rounded-full flex-shrink-0 transition-all ${step.status==='done' ? 'bg-emerald-500/15 border border-emerald-500/30' : step.status==='running' ? 'bg-violet-500/15 border border-violet-500/40' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
              {step.status==='done'    && <Check className="size-2.5 text-emerald-400" />}
              {step.status==='running' && <Loader2 className="size-2.5 text-violet-400 animate-spin" />}
              {step.status==='pending' && <span className="size-1 rounded-full bg-[#2a2a32]" />}
            </div>
            <span className={`text-xs flex-1 transition-colors ${step.status==='done' ? 'text-[#5a5a62] line-through' : step.status==='running' ? 'text-white font-medium' : 'text-[#3a3a42]'}`}>{step.label}</span>
            {step.status==='running' && <motion.span animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:1, repeat:Infinity }} className="text-[10px] text-violet-400">running…</motion.span>}
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {allDone && execution.widgetId && (
          <motion.div initial={{ opacity:0, height:0, marginTop:0 }} animate={{ opacity:1, height:'auto', marginTop:10 }} className="flex items-center gap-2 pt-2.5 border-t border-white/[0.05]">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-medium">Widget live in workspace →</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
