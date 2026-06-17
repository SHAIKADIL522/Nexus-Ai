'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function GlowButton({ children, variant = 'primary', size = 'md', className, ...props }: GlowButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_24px_rgba(139,92,246,0.4)] hover:shadow-[0_0_36px_rgba(139,92,246,0.55)]',
    secondary: 'bg-white/[0.07] border border-white/[0.10] hover:bg-white/[0.12] text-white/90',
    ghost: 'text-white/60 hover:text-white hover:bg-white/[0.06]',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={cn('rounded-xl font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2', variants[variant], sizes[size], className)}
      {...(props as Parameters<typeof motion.button>[0])}
    >
      {children}
    </motion.button>
  );
}
