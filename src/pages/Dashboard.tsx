import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, X, ClipboardList, Palette, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { GlassCard } from '../components/ui/GlassCard';
import { KPICard } from '../components/ui/KPICard';
import { ProgressRing } from '../components/ui/ProgressRing';
import { ActivityFeed } from '../components/ui/ActivityFeed';
import { TeamAvailability } from '../components/ui/TeamAvailability';
import { useAuthStore, useIsAdmin } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';

export function Dashboard() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user } = useAuthStore();
  const isAdmin = useIsAdmin();
  const { projects, tasks, activities, teamMembers, sprints } = useDataStore();
  const navigate = useNavigate();
  const [fabOpen, setFabOpen] = useState(false);

  const activeSprint = sprints.find((s) => s.status === 'active');
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;

  const kpis = useMemo(() => [
    { labelEn: 'Total Tasks', labelAr: 'إجمالي المهام', value: tasks.length, change: 0, color: '#7C3AED', icon: 'clipboard' },
    { labelEn: 'Completed', labelAr: 'مكتملة', value: tasks.filter((t) => t.status === 'done').length, change: 0, color: '#10B981', icon: 'check-circle' },
    { labelEn: 'In Progress', labelAr: 'قيد التنفيذ', value: inProgressCount, change: 0, color: '#3B82F6', icon: 'timer' },
    { labelEn: 'Overdue', labelAr: 'متأخرة', value: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length, change: 0, color: '#EF4444', icon: 'alert-triangle' },
  ], [tasks, inProgressCount]);

  const fabActions = [
    {
      icon: ClipboardList,
      labelEn: 'New Task',
      labelAr: 'مهمة جديدة',
      color: 'from-blue-400 to-blue-600',
      path: '/board',
    },
    {
      icon: Palette,
      labelEn: 'Design Item',
      labelAr: 'عنصر تصميم',
      color: 'from-pink-400 to-pink-600',
      path: '/design-items',
    },
    {
      icon: FolderKanban,
      labelEn: 'New Project',
      labelAr: 'مشروع جديد',
      color: 'from-emerald-400 to-emerald-600',
      path: '/projects',
    },
  ];

  const displayName = user
    ? (isAr ? user.nameAr : user.name)
    : 'NJD Games';

  return (
    <div className="min-h-screen">
      <div className="p-6 space-y-6 max-w-[1400px]">
        {/* Welcome Banner */}
        <motion.div
          className="relative overflow-hidden rounded-[24px] p-8 bg-gradient-to-br from-primary via-primary-dark to-[#4C1D95]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute -top-16 -end-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -start-10 w-40 h-40 rounded-full bg-purple-400/20 blur-2xl" />
          <div className="absolute top-6 end-1/3 w-24 h-24 rounded-full bg-purple-300/10 blur-xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-purple-200" />
              <span className="text-purple-200 text-sm font-medium">
                {t('dashboard.currentSprint')}: {activeSprint ? (isAr ? activeSprint.nameAr : activeSprint.name) : ''}
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2">
              {t('dashboard.welcome')} {displayName} 👋
            </h2>
            <p className="text-purple-200 text-base">
              {t('dashboard.sprintSubtitle', { count: inProgressCount })}
            </p>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <KPICard key={kpi.icon} {...kpi} delay={0.05 + i * 0.08} />
          ))}
        </div>

        {/* Progress + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <GlassCard className="lg:col-span-2" delay={0.15}>
            <h3 className="text-lg font-bold text-ink dark:text-white mb-6">
              {t('dashboard.projectProgress')}
            </h3>
            <div className="flex items-start justify-around flex-wrap gap-4">
              {projects.map((p) => (
                <ProgressRing
                  key={p.id}
                  progress={p.progress}
                  color={p.color}
                  label={isAr ? p.nameAr : p.name}
                />
              ))}
            </div>
          </GlassCard>

          <GlassCard className="lg:col-span-3" delay={0.2}>
            <h3 className="text-lg font-bold text-ink dark:text-white mb-4">
              {t('dashboard.recentActivity')}
            </h3>
            <ActivityFeed activities={activities} />
          </GlassCard>
        </div>

        {/* Team Availability */}
        <GlassCard delay={0.25}>
          <h3 className="text-lg font-bold text-ink dark:text-white mb-4">
            {t('dashboard.teamAvailability')}
          </h3>
          <TeamAvailability members={teamMembers} />
        </GlassCard>
      </div>

      {/* FAB with menu — admin only */}
      {isAdmin && <div className="fixed bottom-6 end-6 z-50">
        <AnimatePresence>
          {fabOpen && (
            <motion.div
              className="absolute bottom-16 end-0 space-y-2 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {fabActions.map((action, i) => (
                <motion.button
                  key={action.labelEn}
                  className="flex items-center gap-3 w-max ms-auto"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setFabOpen(false);
                    navigate(action.path);
                  }}
                >
                  <span className="text-xs font-medium text-ink dark:text-white bg-white dark:bg-surface px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                    {isAr ? action.labelAr : action.labelEn}
                  </span>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} shadow-lg flex items-center justify-center text-white`}>
                    <action.icon size={18} />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="
            w-14 h-14 rounded-2xl
            bg-gradient-to-br from-primary-light to-primary
            shadow-lg shadow-primary/30
            flex items-center justify-center text-white
            hover:shadow-xl hover:shadow-primary/40
            transition-shadow
          "
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setFabOpen(!fabOpen)}
          aria-label={t('dashboard.quickAdd')}
          aria-expanded={fabOpen}
        >
          <motion.div
            animate={{ rotate: fabOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {fabOpen ? <X size={24} /> : <Plus size={24} />}
          </motion.div>
        </motion.button>
      </div>}

      {/* Backdrop for FAB menu */}
      {isAdmin && <AnimatePresence>
        {fabOpen && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFabOpen(false)}
          />
        )}
      </AnimatePresence>}
    </div>
  );
}
