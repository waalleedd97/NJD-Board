import { useTranslation } from 'react-i18next';
import { AlertTriangle, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import type { TaskPriority } from '../../data/mockData';

const config: Record<TaskPriority, { icon: typeof ArrowUp; class: string; dot: string }> = {
  critical: {
    icon: AlertTriangle,
    class: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    dot: 'bg-red-500',
  },
  high: {
    icon: ArrowUp,
    class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    dot: 'bg-orange-500',
  },
  medium: {
    icon: ArrowRight,
    class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  low: {
    icon: ArrowDown,
    class: 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400',
    dot: 'bg-gray-400',
  },
};

interface PriorityBadgeProps {
  priority: TaskPriority;
  showLabel?: boolean;
  className?: string;
}

export function PriorityBadge({ priority, showLabel = true, className = '' }: PriorityBadgeProps) {
  const { t } = useTranslation();
  const c = config[priority];
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.class} ${className}`}
    >
      <Icon size={12} />
      {showLabel && t(`priority.${priority}`)}
    </span>
  );
}

export function PriorityDot({ priority }: { priority: TaskPriority }) {
  const c = config[priority];
  return <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`} />;
}
