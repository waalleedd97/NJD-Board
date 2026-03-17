import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Icon3D } from '../icons/Icon3D';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  color?: string;
}

export function EmptyState({ icon, title, description, color = 'gray' }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Icon3D icon={icon} color={color} size="lg" className="mb-4" />
      <h3 className="text-lg font-semibold text-ink dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted dark:text-gray-400 max-w-sm">{description}</p>
      )}
    </motion.div>
  );
}
