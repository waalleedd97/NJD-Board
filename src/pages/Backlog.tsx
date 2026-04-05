import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Timer, Search, Inbox } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { PageSkeleton } from '../components/ui/PageSkeleton';
import type { Task } from '../data/mockData';

// Category maps (shared with Board)
const CATEGORY_COLORS: Record<string, string> = {
  'Programming': '#7C3AED', '3D (General)': '#3B82F6', '3D Environment & Prop Art': '#22C55E',
  '3D Vehicle Art': '#15803D', 'Optimization': '#EAB308', 'Game Design': '#06B6D4',
  'UX/UI Design': '#14B8A6', 'Graphic Design': '#EC4899', 'Writing': '#F97316',
  'Marketing': '#EF4444', 'Live-Ops': '#6366F1', 'Testing': '#F59E0B',
  'Meetings': '#6B7280', 'Project Management': '#475569', 'Bug': '#DC2626',
};
const CATEGORY_ICONS: Record<string, string> = {
  'Programming': '💻', '3D (General)': '💎', '3D Environment & Prop Art': '🖼️',
  '3D Vehicle Art': '🚗', 'Optimization': '⚡', 'Game Design': '🎮',
  'UX/UI Design': '🖥️', 'Graphic Design': '🎨', 'Writing': '✍️',
  'Marketing': '📣', 'Live-Ops': '🔴', 'Testing': '🧪',
  'Meetings': '📅', 'Project Management': '📌', 'Bug': '🐛',
};
const PRIORITY_COLORS: Record<string, string> = {
  critical: '#EF4444', high: '#F97316', medium: '#EAB308', low: '#22C55E',
};

export function Backlog() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { tasks, projects, isLoading } = useDataStore();
  const [search, setSearch] = useState('');

  // Backlog = tasks without a sprint
  const backlogTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.sprintId)
      .filter((t) => {
        if (!search) return true;
        const title = isAr ? t.titleAr : t.title;
        return title.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [tasks, search, isAr]);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="min-h-screen">
      <div className="p-6 space-y-4 max-w-[1200px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Inbox size={22} className="text-muted" />
            <h1 className="text-lg font-bold text-ink dark:text-white">{isAr ? 'الأعمال المتراكمة' : 'Backlog'}</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-200 dark:bg-white/10 text-muted">{backlogTasks.length}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 text-muted pointer-events-none" style={{ [isAr ? 'right' : 'left']: 12 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث في المتراكمة...' : 'Search backlog...'}
            className="w-full h-10 rounded-xl text-sm bg-gray-100 dark:bg-white/5 border border-transparent focus:border-primary text-ink dark:text-white placeholder:text-muted outline-none"
            style={isAr ? { paddingRight: 40, paddingLeft: 16 } : { paddingLeft: 40, paddingRight: 16 }}
          />
        </div>

        {/* Task list */}
        <div className="rounded-2xl border border-gray-200/50 dark:border-white/5 overflow-hidden">
          {/* Header row */}
          <div className="flex items-center px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200/50 dark:border-white/5">
            <span className="flex-1 text-[11px] font-semibold text-muted uppercase tracking-wide">{isAr ? 'الأعمال المتراكمة' : 'Backlog'} {backlogTasks.length}</span>
          </div>

          {backlogTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox size={40} className="text-muted dark:text-gray-600 mb-3" />
              <p className="text-sm text-muted">{isAr ? 'لا توجد مهام في المتراكمة' : 'No tasks in backlog'}</p>
              <p className="text-xs text-muted/60 mt-1">{isAr ? 'المهام بدون سبرنت تظهر هنا' : 'Tasks without a sprint appear here'}</p>
            </div>
          ) : (
            backlogTasks.map((task) => (
              <BacklogRow key={task.id} task={task} isAr={isAr} projects={projects} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BacklogRow({ task, isAr, projects }: { task: Task; isAr: boolean; projects: { id: string; name: string; nameAr: string; color: string }[] }) {
  const project = projects.find((p) => p.id === task.projectId);
  const cat = task.tags?.[0];
  const catIcon = cat ? (CATEGORY_ICONS[cat] ?? '🏷️') : '';
  const catColor = cat ? (CATEGORY_COLORS[cat] ?? '#6B7280') : '';
  const priColor = PRIORITY_COLORS[task.priority] ?? '#EAB308';
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.03] last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group">
      {/* Priority dot */}
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: priColor }} />

      {/* Category icon */}
      {catIcon && <span className="text-sm shrink-0">{catIcon}</span>}

      {/* Title */}
      <span className="flex-1 text-sm text-ink dark:text-white truncate font-medium">
        {isAr ? task.titleAr : task.title}
      </span>

      {/* Metadata badges */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Work hours */}
        {task.storyPoints > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-muted dark:text-gray-400">
            <Timer size={10} />
            {task.storyPoints}h
          </span>
        )}

        {/* Due date */}
        {task.dueDate && (
          <span className={`flex items-center gap-1 text-[10px] font-semibold ${isOverdue ? 'text-red-500' : 'text-muted dark:text-gray-400'}`}>
            <Calendar size={10} />
            {new Date(task.dueDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}

        {/* Category badge */}
        {cat && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: catColor + '18', color: catColor }}>
            {cat}
          </span>
        )}

        {/* Project badge */}
        {project && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: project.color + '18', color: project.color }}>
            {isAr ? project.nameAr : project.name}
          </span>
        )}
      </div>
    </div>
  );
}
