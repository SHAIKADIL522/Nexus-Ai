'use client';
import { useState } from 'react';
import { Edit3, Check, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { title?: string; content?: string; }

export default function NotesWidget({ title = 'Notes', content: initial = '' }: Props) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(initial);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-emerald-400/70" />
          <p className="text-sm font-semibold text-white/80 font-display">{title}</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all"
          style={editing ? {
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
            color: '#34D399',
          } : {
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.span key="check" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                <Check className="size-3.5" />Done
              </motion.span>
            ) : (
              <motion.span key="edit" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                <Edit3 className="size-3.5" />Edit
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {editing ? (
          <motion.textarea
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            value={content}
            onChange={e => setContent(e.target.value)}
            autoFocus
            className="resize-none text-sm text-white/80 p-3.5 rounded-xl focus:outline-none leading-relaxed min-h-[160px] w-full custom-scrollbar"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(16,185,129,0.25)',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.45)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)'; }}
          />
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-white/55 leading-relaxed whitespace-pre-wrap min-h-[120px] p-3.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            {content || (
              <span className="text-white/20 italic">Empty note. Click Edit to start writing...</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
