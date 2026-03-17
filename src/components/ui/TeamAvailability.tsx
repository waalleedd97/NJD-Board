import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { TeamMember } from '../../data/mockData';

const statusDot: Record<string, string> = {
  available: 'bg-emerald-400',
  busy: 'bg-amber-400',
  away: 'bg-gray-400',
};

interface TeamAvailabilityProps {
  members: TeamMember[];
}

export function TeamAvailability({ members }: TeamAvailabilityProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {members.map((m, i) => (
        <motion.div
          key={m.id}
          className="group relative flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
        >
          {/* Avatar + status */}
          <div className="relative shrink-0">
            <span className="text-2xl">{m.avatar}</span>
            <span
              className={`absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-surface ${statusDot[m.status]}`}
            />
          </div>

          {/* Name + status label */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink dark:text-white truncate">
              {isAr ? m.nameAr : m.name}
            </p>
            <p className="text-xs text-muted dark:text-gray-400">
              {t(`common.${m.status}`)}
            </p>
          </div>

          {/* Workload bar */}
          <div className="w-14 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
            <motion.div
              className={`h-full rounded-full ${
                m.workload > 80
                  ? 'bg-red-400'
                  : m.workload > 60
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${m.workload}%` }}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
            />
          </div>

          {/* Hover tooltip */}
          <div className="pointer-events-none absolute bottom-full inset-x-0 mb-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <div className="bg-ink text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
              {isAr ? m.currentTaskAr : m.currentTask}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
