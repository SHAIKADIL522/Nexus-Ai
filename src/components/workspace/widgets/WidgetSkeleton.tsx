import type { WidgetType } from '@/types';

interface Props { type?: WidgetType; }

function Bone({ className }: { className: string }) {
  return (
    <div
      className={`rounded-lg animate-pulse ${className}`}
      style={{ background: 'rgba(255,255,255,0.04)' }}
    />
  );
}

export default function WidgetSkeleton({ type }: Props) {
  if (type === 'kanban') return (
    <div className="flex gap-3 overflow-hidden">
      {[1,2,3].map(i => (
        <div key={i} className="flex flex-col gap-2 w-48 flex-shrink-0">
          <Bone className="h-5 w-24" />
          {[1,2,3].map(j => <Bone key={j} className="h-16 w-full" />)}
        </div>
      ))}
    </div>
  );

  if (type === 'analytics') return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4].map(i => <Bone key={i} className="h-20" />)}
      </div>
      <Bone className="h-32 w-full" />
    </div>
  );

  if (type === 'stock') return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2"><Bone className="h-7 w-16" /><Bone className="h-7 w-16" /></div>
      <Bone className="h-8 w-32" />
      <Bone className="h-40 w-full" />
    </div>
  );

  if (type === 'weather') return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2"><Bone className="h-12 w-20" /><Bone className="h-4 w-16" /></div>
        <Bone className="h-16 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2">{[1,2,3].map(i => <Bone key={i} className="h-16" />)}</div>
      <div className="grid grid-cols-5 gap-1.5">{[1,2,3,4,5].map(i => <Bone key={i} className="h-20" />)}</div>
    </div>
  );

  if (type === 'focusTimer') return (
    <div className="flex flex-col items-center gap-5">
      <Bone className="h-8 w-36 rounded-xl" />
      <Bone className="h-36 w-36 rounded-full" />
      <div className="flex gap-3"><Bone className="h-9 w-9 rounded-xl" /><Bone className="h-9 w-24 rounded-xl" /><Bone className="h-9 w-9 rounded-xl" /></div>
    </div>
  );

  if (type === 'aiInsights') return (
    <div className="flex flex-col gap-3">
      <Bone className="h-20 w-full rounded-xl" />
      {[1,2,3].map(i => <Bone key={i} className="h-16 w-full rounded-xl" />)}
    </div>
  );

  // default / notes / activityTimeline
  return (
    <div className="flex flex-col gap-3">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="flex items-center gap-3">
          <Bone className={`h-7 w-7 rounded-lg flex-shrink-0`} />
          <Bone className={`h-4 flex-1`} style={{ width: `${60 + i * 8}%` } as React.CSSProperties} />
        </div>
      ))}
    </div>
  );
}
