import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderKanban, Calendar, Users, ChevronDown, ChevronUp, ExternalLink, BarChart3 } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { GlassCard } from '../components/ui/GlassCard';
import { Icon3D } from '../components/icons/Icon3D';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ProgressRing } from '../components/ui/ProgressRing';
import { FilterBar } from '../components/ui/FilterBar';
import { EmptyState } from '../components/ui/EmptyState';
import { projects, getProjectTeam, getTasksByProject, teamMembers } from '../data/mockData';
import type { Project } from '../data/mockData';
import { Link } from 'react-router-dom';

export function Projects() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusOptions = [
    { value: 'all', labelEn: 'All Projects', labelAr: 'جميع المشاريع' },
    { value: 'active', labelEn: 'Active', labelAr: 'نشط' },
    { value: 'on-hold', labelEn: 'On Hold', labelAr: 'معلق' },
    { value: 'completed', labelEn: 'Completed', labelAr: 'مكتمل' },
  ];

  const filtered = projects.filter((p) => {
    const name = isAr ? p.nameAr : p.name;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen">
      <TopBar title={t('nav.projects')} />

      <div className="p-6 space-y-6 max-w-[1400px]">
        {/* Header with stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label={isAr ? 'مشاريع نشطة' : 'Active Projects'}
            value={projects.filter((p) => p.status === 'active').length}
            color="green"
            delay={0}
          />
          <StatCard
            label={isAr ? 'إجمالي المهام' : 'Total Tasks'}
            value={projects.reduce((sum, p) => sum + p.tasksTotal, 0)}
            color="purple"
            delay={0.05}
          />
          <StatCard
            label={isAr ? 'أعضاء الفريق' : 'Team Members'}
            value={teamMembers.length}
            color="blue"
            delay={0.1}
          />
        </div>

        {/* Filters */}
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              value: statusFilter,
              options: statusOptions,
              onChange: setStatusFilter,
              placeholder: t('projects.allProjects'),
            },
          ]}
        />

        {/* Project Cards */}
        {filtered.length === 0 ? (
          <EmptyState icon={FolderKanban} title={t('projects.noProjects')} color="blue" />
        ) : (
          <div className="space-y-4">
            {filtered.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                isAr={isAr}
                isExpanded={expandedId === project.id}
                onToggle={() => setExpandedId(expandedId === project.id ? null : project.id)}
                delay={0.05 + i * 0.08}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  return (
    <GlassCard delay={delay}>
      <div className="flex items-center gap-3">
        <Icon3D icon={BarChart3} color={color} size="sm" />
        <div>
          <p className="text-2xl font-bold text-ink dark:text-white">{value}</p>
          <p className="text-xs text-muted dark:text-gray-400">{label}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function ProjectCard({
  project,
  isAr,
  isExpanded,
  onToggle,
  delay,
}: {
  project: Project;
  isAr: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const { t } = useTranslation();
  const team = getProjectTeam(project);
  const projectTasks = getTasksByProject(project.id);
  const todoCount = projectTasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = projectTasks.filter((t) => t.status === 'in-progress').length;
  const reviewCount = projectTasks.filter((t) => t.status === 'review').length;
  const doneCount = projectTasks.filter((t) => t.status === 'done').length;

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
      {/* Color accent bar */}
      <div className="h-1" style={{ backgroundColor: project.color }} />

      <div className="p-6">
        {/* Main row */}
        <div className="flex items-start gap-4">
          <ProgressRing
            progress={project.progress}
            color={project.color}
            size={72}
            strokeWidth={6}
            label=""
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-ink dark:text-white">
                  {isAr ? project.nameAr : project.name}
                </h3>
                <p className="text-sm text-muted dark:text-gray-400 mt-0.5">
                  {isAr ? project.descriptionAr : project.description}
                </p>
              </div>
              <StatusBadge status={project.status} />
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted dark:text-gray-400">
                <Calendar size={14} />
                <span>{project.startDate} → {project.endDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted dark:text-gray-400">
                <FolderKanban size={14} />
                <span>
                  {t('projects.tasksCompleted', {
                    completed: project.tasksCompleted,
                    total: project.tasksTotal,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-muted" />
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {team.slice(0, 4).map((m) => (
                    <span
                      key={m.id}
                      className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs border-2 border-white dark:border-surface"
                      title={isAr ? m.nameAr : m.name}
                    >
                      {m.avatar}
                    </span>
                  ))}
                  {team.length > 4 && (
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-surface">
                      +{team.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted dark:text-gray-400">{t('projects.progress')}</span>
                <span className="font-semibold text-ink dark:text-white">{project.progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: project.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 0.8, delay: delay + 0.2 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Toggle expand */}
        <button
          onClick={onToggle}
          className="flex items-center gap-1 mx-auto mt-4 text-xs text-muted hover:text-primary dark:hover:text-night-accent transition-colors"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{isExpanded ? (isAr ? 'إخفاء التفاصيل' : 'Hide Details') : t('projects.viewDetails')}</span>
        </button>

        {/* Expanded details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-gray-200/50 dark:border-white/5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <MiniStat
                    label={isAr ? 'قيد الانتظار' : 'To Do'}
                    value={todoCount}
                    color="bg-gray-400"
                  />
                  <MiniStat
                    label={isAr ? 'قيد التنفيذ' : 'In Progress'}
                    value={inProgressCount}
                    color="bg-blue-500"
                  />
                  <MiniStat
                    label={isAr ? 'مراجعة' : 'Review'}
                    value={reviewCount}
                    color="bg-amber-500"
                  />
                  <MiniStat
                    label={isAr ? 'مكتمل' : 'Done'}
                    value={doneCount}
                    color="bg-emerald-500"
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(isAr ? project.tagsAr : project.tags).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-night-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Team members */}
                <div className="mb-2">
                  <p className="text-xs font-medium text-muted dark:text-gray-400 mb-2">
                    {t('projects.teamMembers')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {team.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 dark:bg-white/5 text-xs"
                      >
                        <span>{m.avatar}</span>
                        <span className="text-ink dark:text-white font-medium">
                          {isAr ? m.nameAr : m.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* View board link */}
                <Link
                  to="/board"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary dark:text-night-accent hover:underline"
                >
                  <ExternalLink size={14} />
                  {t('projects.viewBoard')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <div>
        <p className="text-lg font-bold text-ink dark:text-white">{value}</p>
        <p className="text-[11px] text-muted dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}
