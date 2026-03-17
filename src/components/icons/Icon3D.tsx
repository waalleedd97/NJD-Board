import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

const palettes: Record<string, { from: string; to: string; shadow: string }> = {
  purple: { from: '#A78BFA', to: '#7C3AED', shadow: 'rgba(124,58,237,0.35)' },
  blue:   { from: '#60A5FA', to: '#3B82F6', shadow: 'rgba(59,130,246,0.35)' },
  green:  { from: '#34D399', to: '#10B981', shadow: 'rgba(16,185,129,0.35)' },
  red:    { from: '#F87171', to: '#EF4444', shadow: 'rgba(239,68,68,0.35)' },
  amber:  { from: '#FCD34D', to: '#F59E0B', shadow: 'rgba(245,158,11,0.35)' },
  pink:   { from: '#F9A8D4', to: '#EC4899', shadow: 'rgba(236,72,153,0.35)' },
  cyan:   { from: '#67E8F9', to: '#06B6D4', shadow: 'rgba(6,182,212,0.35)' },
  gray:   { from: '#9CA3AF', to: '#6B7280', shadow: 'rgba(107,114,128,0.35)' },
};

const sizes = {
  sm: { box: 36, icon: 18, radius: 10 },
  md: { box: 48, icon: 24, radius: 14 },
  lg: { box: 64, icon: 32, radius: 18 },
};

interface Icon3DProps {
  icon: LucideIcon;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Icon3D({ icon: Icon, color = 'purple', size = 'md', className = '' }: Icon3DProps) {
  const p = palettes[color] ?? palettes.purple;
  const s = sizes[size];

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: s.box,
        height: s.box,
        borderRadius: s.radius,
        background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
        boxShadow: `0 4px 14px ${p.shadow}`,
      }}
      whileHover={{ scale: 1.08, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Icon size={s.icon} color="white" strokeWidth={2.2} />
    </motion.div>
  );
}
