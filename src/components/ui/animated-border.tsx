import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface AnimatedBorderProps { children: ReactNode; className?: string; active?: boolean; }

export default function AnimatedBorder({ children, className, active = false }: AnimatedBorderProps) {
  if (!active) return <>{children}</>;
  return (
    <div className={cn('animated-border rounded-2xl', className)}>
      {children}
    </div>
  );
}
