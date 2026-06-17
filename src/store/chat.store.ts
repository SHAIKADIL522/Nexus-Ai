import { create } from 'zustand';
import type { ChatMessage, ToolExecution } from '@/types';

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateLastAssistant: (content: string) => void;
  updateMessageTool: (id: string, exec: ToolExecution) => void;
  setStreaming: (v: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  addMessage: (msg) => {
    const id = crypto.randomUUID();
    set((s) => ({ messages: [...s.messages, { ...msg, id, timestamp: Date.now() }] }));
    return id;
  },
  updateLastAssistant: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant') { msgs[i] = { ...msgs[i], content }; break; }
      }
      return { messages: msgs };
    }),
  updateMessageTool: (id, exec) =>
    set((s) => ({ messages: s.messages.map((m) => m.id === id ? { ...m, toolExecution: exec } : m) })),
  setStreaming: (v) => set({ isStreaming: v }),
  clearMessages: () => set({ messages: [] }),
}));
