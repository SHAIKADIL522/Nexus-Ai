'use client';
import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Paperclip, Image, FileCode, SendHorizontal, Lightbulb, Mic } from 'lucide-react';

const SUGGESTIONS = [
  'Create a sprint board',
  'Show stock chart for NVDA TSLA',
  'Analytics dashboard with KPIs',
  'Focus timer 25 minutes',
  'AI productivity insights',
];

interface Props { onSend: (msg: string) => void; isStreaming: boolean; placeholder?: string; }

export default function ChatInput({ onSend, isStreaming, placeholder = 'Ask Nexus to build anything...' }: Props) {
  const [message, setMessage] = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [message]);

  const submit = () => { if (message.trim() && !isStreaming) { onSend(message.trim()); setMessage(''); } };
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } };

  return (
    <div className="relative w-full space-y-2">
      {/* Suggestion chips */}
      <AnimatePresence>
        {focused && !message && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="flex gap-1.5 flex-wrap pb-1"
          >
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setMessage(s); ref.current?.focus(); }}
                className="text-[11px] px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/80 hover:border-violet-500/30 hover:bg-violet-500/[0.06] transition-all"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Animated glow border when focused */}
        {focused && (
          <motion.div
            className="absolute -inset-[1px] rounded-2xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'linear-gradient(90deg, rgba(139,92,246,0.4), rgba(59,130,246,0.3), rgba(6,182,212,0.3), rgba(139,92,246,0.4))',
              backgroundSize: '300% 100%',
              animation: 'border-flow 3s linear infinite',
            }}
          />
        )}

        <div
          className="relative rounded-2xl overflow-hidden transition-all duration-200"
          style={{
            background: 'rgba(12,14,28,0.92)',
            backdropFilter: 'blur(24px)',
            border: focused ? 'none' : '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <textarea
            ref={ref}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={onKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none bg-transparent text-[14px] text-white placeholder-white/20 px-4 pt-3.5 pb-2 focus:outline-none min-h-[56px] max-h-[180px] leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />

          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            <div className="flex items-center gap-1">
              {/* Attach */}
              <div className="relative">
                <button
                  onClick={() => setShowAttach(!showAttach)}
                  className="size-7 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/30 hover:text-white transition-all"
                >
                  <Plus className={`size-3.5 transition-transform ${showAttach ? 'rotate-45' : ''}`} />
                </button>
                <AnimatePresence>
                  {showAttach && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowAttach(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        className="absolute bottom-full left-0 mb-2 z-50 rounded-xl overflow-hidden"
                        style={{ background: 'rgba(12,14,28,0.96)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <div className="p-1.5 min-w-[160px]">
                          {[
                            { icon: <Paperclip className="size-3.5" />, label: 'Upload file' },
                            { icon: <Image className="size-3.5" />, label: 'Add image' },
                            { icon: <FileCode className="size-3.5" />, label: 'Import code' },
                          ].map((item, i) => (
                            <button key={i} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-all text-sm">
                              <span className="text-violet-400">{item.icon}</span>{item.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-white/30 hover:text-white hover:bg-white/5 transition-all">
                <Lightbulb className="size-3.5" />
                <span className="hidden sm:inline">Plan</span>
              </button>

              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-white/30 hover:text-violet-400 hover:bg-violet-500/[0.06] transition-all">
                <Mic className="size-3.5" />
              </button>
            </div>

            <motion.button
              onClick={submit}
              disabled={!message.trim() || isStreaming}
              whileTap={{ scale: 0.92 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                boxShadow: message.trim() ? '0 0 20px rgba(139,92,246,0.4)' : 'none',
              }}
            >
              {isStreaming
                ? (
                  <span className="flex items-center gap-1 px-1">
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        className="size-1.5 rounded-full bg-white/70 block"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </span>
                )
                : (
                  <>
                    <span className="hidden sm:inline text-xs font-medium">Send</span>
                    <SendHorizontal className="size-3.5" />
                  </>
                )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
