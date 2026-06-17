'use client';
import { motion } from 'framer-motion';

interface AIOrbProps { size?: number; active?: boolean; }

export default function AIOrb({ size = 32, active = false }: AIOrbProps) {
  return (
    <motion.div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {active && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: size, height: size,
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #6B21A8 100%)',
          boxShadow: active ? '0 0 20px rgba(139,92,246,0.5)' : '0 0 12px rgba(139,92,246,0.25)',
        }}
      >
        <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 16 16" fill="none">
          <path d="M8 2L10 6L14 8L10 10L8 14L6 10L2 8L6 6L8 2Z" fill="white" opacity="0.9" />
        </svg>
      </div>
    </motion.div>
  );
}
