import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GradientTextProps { children: ReactNode; className?: string; variant?: 'cool' | 'warm' | 'neon'; }

export default function GradientText({ children, className, variant = 'cool' }: GradientTextProps) {
  const variants = {
    cool: 'from-violet-300 via-indigo-300 to-cyan-300',
    warm: 'from-fuchsia-300 via-violet-300 to-indigo-300',
    neon: 'from-cyan-300 via-blue-300 to-violet-300',
  };
  return (
    <span className={cn(`bg-gradient-to-r ${variants[variant]} bg-clip-text text-transparent`, className)}>
      {children}
    </span>
  );
}
