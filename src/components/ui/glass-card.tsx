import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'purple' | 'blue' | 'cyan' | 'none';
  hover?: boolean;
  active?: boolean;
}

export default function GlassCard({ children, className, glow = 'none', hover = false, active = false }: GlassCardProps) {
  const glowClass = {
    purple: 'shadow-[0_0_40px_rgba(139,92,246,0.12)] border-purple-500/20',
    blue:   'shadow-[0_0_40px_rgba(59,130,246,0.12)] border-blue-500/20',
    cyan:   'shadow-[0_0_40px_rgba(6,182,212,0.12)] border-cyan-500/20',
    none:   'border-white/[0.07]',
  }[glow];

  return (
    <div className={cn(
      'rounded-2xl border',
      'bg-white/[0.042] backdrop-blur-2xl',
      'transition-all duration-300',
      glowClass,
      hover && 'hover:bg-white/[0.065] hover:border-white/[0.13] hover:-translate-y-0.5 hover:shadow-lg',
      active && 'bg-white/[0.065] border-purple-500/30 shadow-[0_0_30px_rgba(139,92,246,0.15)]',
      className
    )}>
      {children}
    </div>
  );
}
