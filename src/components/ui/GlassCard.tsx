import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GlassCard({ children, className = '', delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      className={`
        rounded-[20px] p-6
        bg-white/80 dark:bg-surface/80
        backdrop-blur-xl
        border border-white/40 dark:border-white/5
        shadow-[0_4px_24px_rgba(0,0,0,0.06)]
        hover:shadow-[0_8px_40px_rgba(124,58,237,0.1)]
        transition-shadow duration-300
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );
}
