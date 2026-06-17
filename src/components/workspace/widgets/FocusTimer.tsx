'use client';
import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { workMinutes?: number; breakMinutes?: number; sessionsGoal?: number; }

export default function FocusTimer({ workMinutes = 25, breakMinutes = 5, sessionsGoal = 4 }: Props) {
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const total = mode === 'work' ? workMinutes * 60 : breakMinutes * 60;
  const progress = secondsLeft / total;
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const reset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
  }, [mode, workMinutes, breakMinutes]);

  const switchMode = useCallback(() => {
    const next = mode === 'work' ? 'break' : 'work';
    setMode(next);
    setRunning(false);
    setSecondsLeft(next === 'work' ? workMinutes * 60 : breakMinutes * 60);
    if (mode === 'work') setSessions(s => s + 1);
  }, [mode, workMinutes, breakMinutes]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { switchMode(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, switchMode]);

  // SVG ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * progress;
  const isWork = mode === 'work';
  const accentColor = isWork ? '#8B5CF6' : '#06B6D4';

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Mode tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {(['work', 'break'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setRunning(false); setSecondsLeft(m === 'work' ? workMinutes * 60 : breakMinutes * 60); }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={mode === m ? {
              background: m === 'work' ? 'rgba(139,92,246,0.2)' : 'rgba(6,182,212,0.15)',
              border: `1px solid ${m === 'work' ? 'rgba(139,92,246,0.3)' : 'rgba(6,182,212,0.25)'}`,
              color: m === 'work' ? '#C4B5FD' : '#67E8F9',
            } : { color: 'rgba(255,255,255,0.3)' }}
          >
            {m === 'work' ? <Brain className="size-3.5" /> : <Coffee className="size-3.5" />}
            {m === 'work' ? 'Focus' : 'Break'}
          </button>
        ))}
      </div>

      {/* Ring */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full opacity-20" style={{ boxShadow: `0 0 40px ${accentColor}` }} />

        <svg width="140" height="140" className="-rotate-90">
          {/* Track */}
          <circle cx="70" cy="70" r={radius}
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          {/* Progress */}
          <motion.circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference - strokeDash }}
            transition={{ duration: 0.5, ease: 'linear' }}
            style={{ filter: `drop-shadow(0 0 8px ${accentColor}60)` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center gap-0.5">
          <AnimatePresence mode="wait">
            <motion.p
              key={`${mins}:${secs}`}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold text-white font-display tabular-nums"
            >
              {mins}:{secs}
            </motion.p>
          </AnimatePresence>
          <p className="text-[11px] text-white/30">{isWork ? 'Focus' : 'Break'}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="size-9 flex items-center justify-center rounded-xl text-white/40 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <RotateCcw className="size-4" />
        </button>

        <motion.button
          onClick={() => setRunning(!running)}
          whileTap={{ scale: 0.93 }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{
            background: running
              ? 'rgba(255,255,255,0.07)'
              : `linear-gradient(135deg, ${isWork ? '#4F46E5, #7C3AED' : '#0891B2, #0E7490'})`,
            border: running ? '1px solid rgba(255,255,255,0.1)' : 'none',
            boxShadow: running ? 'none' : `0 0 20px ${accentColor}50`,
          }}
        >
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
          {running ? 'Pause' : 'Start'}
        </motion.button>

        <button
          onClick={switchMode}
          className="size-9 flex items-center justify-center rounded-xl text-white/40 hover:text-violet-400 transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Zap className="size-4" />
        </button>
      </div>

      {/* Session dots */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          {Array.from({ length: sessionsGoal }, (_, i) => (
            <motion.div
              key={i}
              className="size-2.5 rounded-full"
              animate={i < sessions ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
              style={{
                background: i < sessions ? '#8B5CF6' : 'rgba(255,255,255,0.08)',
                boxShadow: i < sessions ? '0 0 8px rgba(139,92,246,0.5)' : 'none',
              }}
            />
          ))}
        </div>
        <p className="text-[11px] text-white/25">{sessions}/{sessionsGoal} sessions</p>
      </div>
    </div>
  );
}
