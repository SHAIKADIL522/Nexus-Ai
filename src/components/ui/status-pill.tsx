import { cn } from '@/lib/utils';

interface StatusPillProps { label: string; status?: 'active' | 'idle' | 'error'; className?: string; }

export default function StatusPill({ label, status = 'active', className }: StatusPillProps) {
  const styles = {
    active: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
    idle:   'bg-amber-500/10 border-amber-500/25 text-amber-400',
    error:  'bg-red-500/10 border-red-500/25 text-red-400',
  };
  const dotStyles = { active: 'bg-emerald-400', idle: 'bg-amber-400', error: 'bg-red-400' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium', styles[status], className)}>
      <span className={cn('size-1.5 rounded-full animate-pulse', dotStyles[status])} />
      {label}
    </span>
  );
}
