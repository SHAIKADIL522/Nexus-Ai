import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Widget, WorkspaceSession, ChatMessage } from '@/types';

interface WorkspaceStore {
  widgets: Widget[];
  sessions: WorkspaceSession[];
  sidebarOpen: boolean;
  activeWidgetId: string | null;
  addWidget: (w: Omit<Widget, 'id' | 'createdAt'>) => string;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, patch: Partial<Widget>) => void;
  clearWidgets: () => void;
  saveSession: (name: string, messages: ChatMessage[]) => void;
  setActiveWidget: (id: string | null) => void;
  setSidebarOpen: (v: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      widgets: [],
      sessions: [],
      sidebarOpen: true,
      activeWidgetId: null,
      addWidget: (w) => {
        const id = crypto.randomUUID();
        set((s) => ({ widgets: [{ ...w, id, createdAt: Date.now() }, ...s.widgets] }));
        return id;
      },
      removeWidget: (id) => set((s) => ({ widgets: s.widgets.filter((w) => w.id !== id) })),
      updateWidget: (id, patch) =>
        set((s) => ({ widgets: s.widgets.map((w) => (w.id === id ? { ...w, ...patch } : w)) })),
      clearWidgets: () => set({ widgets: [] }),
      saveSession: (name, messages) => {
        const session: WorkspaceSession = {
          id: crypto.randomUUID(), name, createdAt: Date.now(),
          messages, widgetCount: get().widgets.length,
        };
        set((s) => ({ sessions: [session, ...s.sessions].slice(0, 10) }));
      },
      setActiveWidget: (id) => set({ activeWidgetId: id }),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
    }),
    { name: 'nexus-workspace-v4', skipHydration: true }
  )
);
