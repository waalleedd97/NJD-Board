import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Timer, Target, TrendingUp, CheckCircle, Clock, Play, Calendar } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { GlassCard } from '../components/ui/GlassCard';
import { Icon3D } from '../components/icons/Icon3D';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { sprints, getTasksBySprint } from '../data/mockData';
import type { Sprint, TaskStatus } from '../data/mockData';

const statusTabs: { value: string; labelEn: string; labelAr: string }[] = [
  { value: 'all', labelEn: 'All Sprints', labelAr: 'جميع السبرينتات' },
  { value: 'active', labelEn: 'Active', labelAr: 'نشط' },
  { value: 'planning', labelEn: 'Planning', labelAr: 'تخطيط' },
  { value: 'completed', labelEn: 'Completed', labelAr: 'مكتمل' },
];

export function Sprints() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('all');

  const filtered = sprints.filter(
    (s) => activeTab === 'all' || s.status === activeTab
  );

  // Overall stats
  const activeSprint = sprints.find((s) => s.status === 'active');
  const totalVelocity = sprints
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + s.velocity, 0);
  const completedSprints = sprints.filter((s) => s.status === 'completed').length;
  const avgVelocity = completedSprints > 0 ? Math.round(totalVelocity / completedSprints) : 0;

  return (
    <div className="min-h-screen">
      <TopBar title={t('sprints.title')} />

      <div className="p-6 space-y-6 max-w-[1400px]">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard delay={0}>
            <div className="flex items-center gap-3">
              <Icon3D icon={Play} color="green" size="sm" />
              <div>
                <p className="text-2xl font-bold text-ink dark:text-white">
                  {activeSprint ? (isAr ? activeSprint.nameAr : activeSprint.name) : '-'}
                </p>
                <p className="text-xs text-muted dark:text-gray-400">
                  {isAr ? 'السبرينت النشط' : 'Active Sprint'}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard delay={0.05}>
            <div className="flex items-center gap-3">
              <Icon3D icon={TrendingUp} color="purple" size="sm" />
              <div>
                <p className="text-2xl font-bold text-ink dark:text-white">{avgVelocity}</p>
                <p className="text-xs text-muted dark:text-gray-400">
                  {isAr ? 'متوسط السرعة' : 'Avg Velocity'}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard delay={0.1}>
            <div className="flex items-center gap-3">
              <Icon3D icon={CheckCircle} color="blue" size="sm" />
              <div>
                <p className="text-2xl font-bold text-ink dark:text-white">{completedSprints}</p>
                <p className="text-xs text-muted dark:text-gray-400">
                  {isAr ? 'سبرينتات مكتملة' : 'Completed Sprints'}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                ${activeTab === tab.value
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white'
                }
              `}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Sprint Cards */}
        {filtered.length === 0 ? (
          <EmptyState icon={Timer} title={t('sprints.noSprints')} color="amber" />
        ) : (
          <div className="space-y-6">
            {filtered.map((sprint, i) => (
              <SprintCard key={sprint.id} sprint={sprint} isAr={isAr} delay={0.05 + i * 0.1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SprintCard({ sprint, isAr, delay }: { sprint: Sprint; isAr: boolean; delay: number }) {
  const { t } = useTranslation();
  const sprintTasks = getTasksBySprint(sprint.id);

  const tasksByStatus: Record<TaskStatus, number> = {
    'todo': sprintTasks.filter((t) => t.status === 'todo').length,
    'in-progress': sprintTasks.filter((t) => t.status === 'in-progress').length,
    'review': sprintTasks.filter((t) => t.status === 'review').length,
    'done': sprintTasks.filter((t) => t.status === 'done').length,
  };

  const totalTasks = sprintTasks.length;
  const progressPercent = sprint.totalPoints > 0
    ? Math.round((sprint.completedPoints / sprint.totalPoints) * 100)
    : 0;

  const getDaysInfo = () => {
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const today = new Date();
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const elapsedPercent = Math.min(100, Math.max(0, ((totalDays - remainingDays) / totalDays) * 100));
    return { totalDays, remainingDays, elapsedPercent };
  };

  const days = getDaysInfo();

  const statusIcon = sprint.status === 'active' ? Play : sprint.status === 'completed' ? CheckCircle : Clock;
  const statusColor = sprint.status === 'active' ? 'green' : sprint.status === 'completed' ? 'blue' : 'amber';

  return (
    <motion.div
      className="
        rounded-[20px] overflow-hidden
        bg-white/80 dark:bg-surface/80
        backdrop-blur-xl
        border border-white/40 dark:border-white/5
        shadow-[0_4px_24px_rgba(0,0,0,0.06)]
        hover:shadow-[0_8px_40px_rgba(124,58,237,0.1)]
        transition-shadow duration-300
      "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon3D icon={statusIcon} color={statusColor} size="md" />
            <div>
              <h3 className="text-lg font-bold text-ink dark:text-white">
                {isAr ? sprint.nameAr : sprint.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Calendar size={13} className="text-muted" />
                <span className="text-xs text-muted dark:text-gray-400">
                  {sprint.startDate} → {sprint.endDate}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={sprint.status} />
            {sprint.status === 'active' && (
              <span className="text-xs text-muted dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
                {t('sprints.daysRemaining', { count: days.remainingDays })}
              </span>
            )}
          </div>
        </div>

        {/* Progress section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Points progress + Timeline */}
          <div className="space-y-4">
            {/* Points progress */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted dark:text-gray-400">
                  {t('sprints.pointsCompleted', {
                    completed: sprint.completedPoints,
                    total: sprint.totalPoints,
                  })}
                </span>
                <span className="font-bold text-ink dark:text-white">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary-light to-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: delay + 0.2 }}
                />
              </div>
            </div>

            {/* Timeline bar */}
            {sprint.status === 'active' && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted dark:text-gray-400">
                    {isAr ? 'الجدول الزمني' : 'Timeline'}
                  </span>
                  <span className="text-muted dark:text-gray-400">
                    {t('sprints.daysTotal', { count: days.totalDays })}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${days.elapsedPercent}%` }}
                    transition={{ duration: 1, delay: delay + 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Velocity */}
            {sprint.velocity > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp size={16} className="text-primary" />
                <span className="text-muted dark:text-gray-400">{t('sprints.velocity')}:</span>
                <span className="font-bold text-ink dark:text-white">
                  {sprint.velocity} {t('sprints.points')}
                </span>
              </div>
            )}
          </div>

          {/* Right: Task breakdown */}
          <div>
            <p className="text-xs font-medium text-muted dark:text-gray-400 mb-3">
              {t('sprints.taskBreakdown')} ({totalTasks} {isAr ? 'مهمة' : 'tasks'})
            </p>
            <div className="space-y-2">
              <TaskStatusBar
                label={t('sprints.todo')}
                count={tasksByStatus['todo']}
                total={totalTasks}
                color="bg-gray-400"
                delay={delay + 0.2}
              />
              <TaskStatusBar
                label={t('sprints.inProgress')}
                count={tasksByStatus['in-progress']}
                total={totalTasks}
                color="bg-blue-500"
                delay={delay + 0.25}
              />
              <TaskStatusBar
                label={t('sprints.review')}
                count={tasksByStatus['review']}
                total={totalTasks}
                color="bg-amber-500"
                delay={delay + 0.3}
              />
              <TaskStatusBar
                label={t('sprints.done')}
                count={tasksByStatus['done']}
                total={totalTasks}
                color="bg-emerald-500"
                delay={delay + 0.35}
              />
            </div>
          </div>
        </div>

        {/* Goals */}
        {sprint.goals.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-200/50 dark:border-white/5">
            <p className="text-xs font-medium text-muted dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <Target size={13} />
              {t('sprints.sprintGoals')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(isAr ? sprint.goalsAr : sprint.goals).map((goal, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-ink dark:text-gray-300"
                >
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {goal}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TaskStatusBar({
  label,
  count,
  total,
  color,
  delay,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  delay: number;
}) {
  const percent = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted dark:text-gray-400 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, delay }}
        />
      </div>
      <span className="text-xs font-medium text-ink dark:text-white w-6 text-end">{count}</span>
    </div>
  );
}
