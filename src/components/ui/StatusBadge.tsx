import { useTranslation } from 'react-i18next';

const statusStyles: Record<string, string> = {
  // Task statuses
  'todo': 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  'review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  'done': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  // Project statuses
  'active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  'on-hold': 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  'completed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  // Sprint statuses
  'planning': 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  // Design statuses
  'draft': 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300',
  'in-review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  'approved': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  'revision': 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { t } = useTranslation();
  const style = statusStyles[status] ?? statusStyles['todo'];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}
    >
      {t(`status.${status}`)}
    </span>
  );
}
