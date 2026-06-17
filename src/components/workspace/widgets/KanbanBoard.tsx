'use client';
import { useState, useCallback } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, X } from 'lucide-react';
import type { KanbanColumn, KanbanTask } from '@/types';

function TaskCard({ task, isDragging = false }: { task: KanbanTask; isDragging?: boolean }) {
  const pc = { high: 'text-red-400 bg-red-400/10 border-red-400/20', medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20', low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' }[task.priority];
  return (
    <div className={`group p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${isDragging ? 'bg-[#2a2a35] border-violet-500/50 shadow-xl shadow-violet-500/20 rotate-2 scale-105' : 'bg-[#1a1a22] border-white/[0.06] hover:border-white/[0.12] hover:bg-[#1e1e28]'}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-[#d0d0d8] leading-relaxed flex-1">{task.title}</p>
        <GripVertical className="size-3.5 text-[#3a3a42] group-hover:text-[#6a6a72] mt-0.5 flex-shrink-0" />
      </div>
      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        {task.tag && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.06] text-[#8a8a92]">{task.tag}</span>}
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${pc}`}>{task.priority}</span>
        {task.assignee && <span className="ml-auto text-[10px] text-[#5a5a62]">{task.assignee}</span>}
      </div>
    </div>
  );
}

function SortableTask({ task }: { task: KanbanTask }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}

function Column({ col, onAdd }: { col: KanbanColumn; onAdd: (colId: string, title: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const submit = () => { if (draft.trim()) { onAdd(col.id, draft.trim()); setDraft(''); } setAdding(false); };
  return (
    <div className="flex flex-col w-60 flex-shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full flex-shrink-0" style={{ background: col.color }} />
          <span className="text-sm font-semibold text-[#d0d0d8]">{col.title}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-[#6a6a72]">{col.tasks.length}</span>
        </div>
        <button onClick={() => setAdding(true)} className="size-5 flex items-center justify-center rounded-md text-[#5a5a62] hover:text-white hover:bg-white/5 transition-all">
          <Plus className="size-3.5" />
        </button>
      </div>
      <SortableContext items={col.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-[60px]">
          {col.tasks.map(t => <SortableTask key={t.id} task={t} />)}
        </div>
      </SortableContext>
      {adding && (
        <div className="mt-2">
          <textarea autoFocus value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } if (e.key === 'Escape') setAdding(false); }}
            placeholder="Task title..." rows={2}
            className="w-full resize-none bg-[#1a1a22] border border-violet-500/40 rounded-xl text-sm text-white placeholder-[#4a4a52] px-3 py-2 focus:outline-none" />
          <div className="flex gap-2 mt-1.5">
            <button onClick={submit} className="text-xs px-3 py-1.5 rounded-lg bg-violet-600/80 hover:bg-violet-600 text-white">Add</button>
            <button onClick={() => setAdding(false)} className="text-xs px-2 py-1.5 rounded-lg text-[#6a6a72] hover:text-white"><X className="size-3.5" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props { columns?: KanbanColumn[]; boardTitle?: string; }

export default function KanbanBoard({ columns: initial = [], boardTitle = 'Sprint Board' }: Props) {
  const [columns, setColumns] = useState<KanbanColumn[]>(initial);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const findCol = useCallback((taskId: string) => columns.find(c => c.tasks.some(t => t.id === taskId)), [columns]);

  const onDragStart = (e: DragStartEvent) => setActiveTask(findCol(e.active.id as string)?.tasks.find(t => t.id === e.active.id) ?? null);
  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e; if (!over) return;
    const fromIdx = columns.findIndex(c => c.tasks.some(t => t.id === active.id));
    const toIdx = columns.findIndex(c => c.id === over.id || c.tasks.some(t => t.id === over.id));
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
    setColumns(cols => {
      const updated = cols.map(c => ({ ...c, tasks: [...c.tasks] }));
      const task = updated[fromIdx].tasks.find(t => t.id === active.id)!;
      updated[fromIdx].tasks = updated[fromIdx].tasks.filter(t => t.id !== active.id);
      updated[toIdx].tasks.push(task);
      return updated;
    });
  };
  const onDragEnd = (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e; if (!over || active.id === over.id) return;
    const colIdx = columns.findIndex(c => c.tasks.some(t => t.id === active.id));
    if (colIdx === -1) return;
    setColumns(cols => {
      const updated = cols.map(c => ({ ...c, tasks: [...c.tasks] }));
      const from = updated[colIdx].tasks.findIndex(t => t.id === active.id);
      const to = updated[colIdx].tasks.findIndex(t => t.id === over.id);
      if (to !== -1) updated[colIdx].tasks = arrayMove(updated[colIdx].tasks, from, to);
      return updated;
    });
  };
  const onAdd = (colId: string, title: string) =>
    setColumns(cols => cols.map(c => c.id === colId ? { ...c, tasks: [...c.tasks, { id: crypto.randomUUID(), title, priority: 'medium' as const }] } : c));

  return (
    <div>
      <p className="text-xs font-semibold text-[#6a6a72] mb-4 uppercase tracking-widest">{boardTitle}</p>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="flex gap-5 overflow-x-auto pb-2 custom-scrollbar">
          {columns.map(col => <Column key={col.id} col={col} onAdd={onAdd} />)}
        </div>
        <DragOverlay>{activeTask && <TaskCard task={activeTask} isDragging />}</DragOverlay>
      </DndContext>
    </div>
  );
}
