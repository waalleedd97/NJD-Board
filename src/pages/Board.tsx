import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  X,
} from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { FilterBar } from '../components/ui/FilterBar';
import {
  tasks,
  boardColumns,
  projects,
  teamMembers,
  getTeamMember,
  getProject,
} from '../data/mockData';
import type { Task, TaskStatus } from '../data/mockData';

export function Board() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const projectOptions = [
    { value: 'all', labelEn: 'All Projects', labelAr: 'جميع المشاريع' },
    ...projects.map((p) => ({ value: p.id, labelEn: p.name, labelAr: p.nameAr })),
  ];

  const assigneeOptions = [
    { value: 'all', labelEn: 'All Members', labelAr: 'جميع الأعضاء' },
    ...teamMembers.map((m) => ({ value: m.id, labelEn: m.name, labelAr: m.nameAr })),
  ];

  const priorityOptions = [
    { value: 'all', labelEn: 'All Priorities', labelAr: 'جميع الأولويات' },
    { value: 'critical', labelEn: 'Critical', labelAr: 'حرج' },
    { value: 'high', labelEn: 'High', labelAr: 'عالي' },
    { value: 'medium', labelEn: 'Medium', labelAr: 'متوسط' },
    { value: 'low', labelEn: 'Low', labelAr: 'منخفض' },
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const title = isAr ? task.titleAr : task.title;
      const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
      const matchesProject = projectFilter === 'all' || task.projectId === projectFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assigneeId === assigneeFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesProject && matchesAssignee && matchesPriority;
    });
  }, [search, projectFilter, assigneeFilter, priorityFilter, isAr]);

  const getColumnTasks = (status: TaskStatus) =>
    filteredTasks.filter((task) => task.status === status);

  return (
    <div className="min-h-screen">
      <TopBar title={t('board.title')} />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              value: projectFilter,
              options: projectOptions,
              onChange: setProjectFilter,
              placeholder: t('board.filterByProject'),
            },
            {
              value: assigneeFilter,
              options: assigneeOptions,
              onChange: setAssigneeFilter,
              placeholder: t('board.filterByAssignee'),
            },
            {
              value: priorityFilter,
              options: priorityOptions,
              onChange: setPriorityFilter,
              placeholder: t('board.filterByPriority'),
            },
          ]}
        />

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {boardColumns.map((column, colIdx) => {
            const columnTasks = getColumnTasks(column.id);
            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: colIdx * 0.08 }}
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="text-sm font-bold text-ink dark:text-white">
                      {isAr ? column.titleAr : column.titleEn}
                    </h3>
                    <span className="text-xs text-muted dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full font-medium">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Column body */}
                <div className="space-y-3 min-h-[200px] p-2 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200/30 dark:border-white/5">
                  {columnTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-[200px] text-xs text-muted dark:text-gray-500">
                      {t('board.noTasks')}
                    </div>
                  ) : (
                    columnTasks.map((task, taskIdx) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isAr={isAr}
                        delay={colIdx * 0.08 + taskIdx * 0.05}
                        onClick={() => setSelectedTask(task)}
                      />
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            isAr={isAr}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskCard({
  task,
  isAr,
  delay,
  onClick,
}: {
  task: Task;
  isAr: boolean;
  delay: number;
  onClick: () => void;
}) {
  const assignee = getTeamMember(task.assigneeId);
  const project = getProject(task.projectId);

  const isDueSoon = () => {
    const due = new Date(task.dueDate);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 2 && diff >= 0;
  };

  const isOverdue = () => {
    return new Date(task.dueDate) < new Date();
  };

  return (
    <motion.div
      className="
        group cursor-pointer
        rounded-xl p-3.5
        bg-white dark:bg-surface
        border border-gray-200/50 dark:border-white/5
        shadow-sm hover:shadow-md
        hover:border-primary/30 dark:hover:border-night-accent/30
        transition-all duration-200
      "
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      onClick={onClick}
      whileHover={{ y: -2 }}
    >
      {/* Top: Priority + Project tag */}
      <div className="flex items-center justify-between mb-2">
        <PriorityBadge priority={task.priority} showLabel={false} />
        {project && (
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: project.color + '18',
              color: project.color,
            }}
          >
            {isAr ? project.nameAr : project.name}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-ink dark:text-white mb-2 line-clamp-2">
        {isAr ? task.titleAr : task.title}
      </h4>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {(isAr ? task.tagsAr : task.tags).slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-muted dark:text-gray-400"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Bottom: Assignee + Due date + Points */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {assignee && (
            <span className="text-sm" title={isAr ? assignee.nameAr : assignee.name}>
              {assignee.avatar}
            </span>
          )}
          {task.storyPoints > 0 && (
            <span className="text-[10px] font-bold text-muted dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
              {task.storyPoints}pt
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={11} className={`${isOverdue() ? 'text-red-500' : isDueSoon() ? 'text-amber-500' : 'text-muted dark:text-gray-500'}`} />
          <span className={`text-[10px] ${isOverdue() ? 'text-red-500 font-medium' : isDueSoon() ? 'text-amber-500' : 'text-muted dark:text-gray-500'}`}>
            {task.dueDate.slice(5)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function TaskDetailModal({
  task,
  isAr,
  onClose,
}: {
  task: Task;
  isAr: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const assignee = getTeamMember(task.assigneeId);
  const project = getProject(task.projectId);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? task.titleAr : task.title}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        className="
          relative w-full max-w-lg
          rounded-2xl p-6
          bg-white dark:bg-surface
          border border-gray-200/50 dark:border-white/5
          shadow-2xl
        "
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <X size={18} className="text-muted" />
        </button>

        {/* Project badge */}
        {project && (
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <span className="text-xs font-medium text-muted dark:text-gray-400">
              {isAr ? project.nameAr : project.name}
            </span>
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl font-bold text-ink dark:text-white mb-2 pe-8">
          {isAr ? task.titleAr : task.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-muted dark:text-gray-400 mb-4">
          {isAr ? task.descriptionAr : task.description}
        </p>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MetaItem label={t('team.status')}>
            <span className={`text-sm font-medium ${
              task.status === 'done' ? 'text-emerald-600' :
              task.status === 'in-progress' ? 'text-blue-600' :
              task.status === 'review' ? 'text-amber-600' : 'text-gray-600'
            }`}>
              {t(`status.${task.status}`)}
            </span>
          </MetaItem>
          <MetaItem label={t('board.dueDate')}>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-muted" />
              <span className="text-sm text-ink dark:text-white">{task.dueDate}</span>
            </div>
          </MetaItem>
          <MetaItem label={isAr ? 'الأولوية' : 'Priority'}>
            <PriorityBadge priority={task.priority} />
          </MetaItem>
          <MetaItem label={t('board.storyPoints')}>
            <span className="text-sm font-bold text-ink dark:text-white">{task.storyPoints} pts</span>
          </MetaItem>
        </div>

        {/* Assignee */}
        {assignee && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 mb-4">
            <span className="text-2xl">{assignee.avatar}</span>
            <div>
              <p className="text-sm font-medium text-ink dark:text-white">
                {isAr ? assignee.nameAr : assignee.name}
              </p>
              <p className="text-xs text-muted dark:text-gray-400">
                {isAr ? assignee.roleAr : assignee.role}
              </p>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {(isAr ? task.tagsAr : task.tags).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-night-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-muted dark:text-gray-500 mb-1">{label}</p>
      {children}
    </div>
  );
}
