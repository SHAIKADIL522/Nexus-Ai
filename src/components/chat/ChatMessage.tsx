'use client';
import { motion } from 'framer-motion';
import type { ChatMessage as ChatMessageType } from '@/types';
import ExecutionTimeline from '@/components/ai/ExecutionTimeline';
import { User } from 'lucide-react';
import AIOrb from '@/components/ui/ai-orb';

function parseBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-semibold text-white">{p.slice(2,-2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i} className="italic text-violet-300">{p.slice(1,-1)}</em>;
    return <span key={i}>{p}</span>;
  });
}

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="size-7 rounded-xl flex items-center justify-center mt-0.5 flex-shrink-0 bg-white/[0.06] border border-white/[0.09]">
          <User className="size-3.5 text-white/50" />
        </div>
      ) : (
        <div className="mt-0.5 flex-shrink-0">
          <AIOrb size={28} active={false} />
        </div>
      )}

      <div className={`flex flex-col gap-1.5 max-w-[88%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Tool execution */}
        {!isUser && message.toolExecution && (
          <div className="w-full">
            <ExecutionTimeline execution={message.toolExecution} />
          </div>
        )}

        {/* Message bubble */}
        {message.content && (
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-all ${
              isUser
                ? 'text-white rounded-tr-sm'
                : 'text-white/80 rounded-tl-sm'
            }`}
            style={isUser ? {
              background: 'linear-gradient(135deg, #4338CA, #6D28D9)',
              boxShadow: '0 0 20px rgba(99,60,220,0.2)',
            } : {
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {parseBold(message.content)}
          </div>
        )}

        <span className="text-[10px] text-white/20">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
