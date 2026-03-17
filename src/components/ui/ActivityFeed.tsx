import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Activity } from '../../data/mockData';

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="space-y-0.5">
      {activities.map((a, i) => (
        <motion.div
          key={a.id}
          className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          initial={{ opacity: 0, x: isAr ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07, duration: 0.3 }}
        >
          <span className="text-2xl shrink-0 mt-0.5">{a.user.avatar}</span>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink dark:text-white leading-relaxed">
              <span className="font-semibold">
                {isAr ? a.user.nameAr : a.user.name}
              </span>{' '}
              <span className="text-muted dark:text-gray-400">
                {isAr ? a.actionAr : a.action}
              </span>{' '}
              <span className="font-medium text-primary dark:text-night-accent">
                {isAr ? a.targetAr : a.target}
              </span>
            </p>
            <p className="text-xs text-muted dark:text-gray-500 mt-1">
              {isAr ? a.timeAr : a.time}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
