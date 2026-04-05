import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Timer, Search, Inbox, Plus, ChevronDown, ArrowUpDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataStore } from '../store/useDataStore';
import { PageSkeleton } from '../components/ui/PageSkeleton';
import { BoardFilterPanel } from '../components/ui/BoardFilterPanel';
import type { Task } from '../data/mockData';

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
const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

type SortKey = 'created' | 'title' | 'priority' | 'dueDate' | 'hours';
const SORT_OPTIONS: { key: SortKey; en: string; ar: string }[] = [
  { key: 'created', en: 'Creation Date', ar: 'تاريخ الإنشاء' },
  { key: 'title', en: 'Title', ar: 'العنوان' },
  { key: 'priority', en: 'Priority', ar: 'الأولوية' },
  { key: 'dueDate', en: 'Due Date', ar: 'تاريخ الاستحقاق' },
  { key: 'hours', en: 'Work Hours', ar: 'ساعات العمل' },
];

export function Backlog() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { tasks, projects, teamMembers, addTask, isLoading } = useDataStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('created');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');

  // Create task modal
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newProjectId) return;
    setCreating(true);
    await addTask({ title: newTitle.trim(), titleAr: newTitle.trim(), projectId: newProjectId, sprintId: '', status: 'todo', priority: 'medium' });
    setNewTitle('');
    setShowCreate(false);
    setCreating(false);
  };

  const backlogTasks = useMemo(() => {
    let list = tasks.filter((t) => !t.sprintId);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) => (isAr ? t.titleAr : t.title).toLowerCase().includes(q));
    }
    if (categoryFilter !== 'all') list = list.filter((t) => t.tags?.[0] === categoryFilter);
    if (memberFilter !== 'all') list = list.filter((t) => t.assigneeId === memberFilter);

    // Sort
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'title': return (isAr ? a.titleAr : a.title).localeCompare(isAr ? b.titleAr : b.title);
        case 'priority': return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
        case 'dueDate': return (a.dueDate || 'z').localeCompare(b.dueDate || 'z');
        case 'hours': return (b.storyPoints || 0) - (a.storyPoints || 0);
        default: return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
    });

    return list;
  }, [tasks, search, sortBy, categoryFilter, memberFilter, isAr]);

  const sortLabel = SORT_OPTIONS.find((s) => s.key === sortBy);

  if (isLoading) return <PageSkeleton />;

  const sel = 'w-full h-11 px-4 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-ink dark:text-white outline-none focus:border-primary appearance-none';

  return (
    <div className="min-h-screen flex">
      {/* Category/User filter panel */}
      <BoardFilterPanel
        tasks={tasks.filter((t) => !t.sprintId)}
        members={teamMembers}
        selectedCategory={categoryFilter}
        selectedMember={memberFilter}
        onCategoryChange={setCategoryFilter}
        onMemberChange={setMemberFilter}
      />

      <div className="flex-1 min-w-0 p-6 space-y-4 max-w-[1200px]">
        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* New task button */}
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shrink-0">
            <Plus size={16} />
            {isAr ? 'جديد' : 'New'}
          </button>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 text-muted pointer-events-none" style={{ [isAr ? 'right' : 'left']: 12 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'بحث...' : 'Search...'}
              className="w-full h-9 rounded-lg text-sm bg-gray-100 dark:bg-white/5 border border-transparent focus:border-primary text-ink dark:text-white placeholder:text-muted outline-none"
              style={isAr ? { paddingRight: 36, paddingLeft: 12 } : { paddingLeft: 36, paddingRight: 12 }}
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted hover:text-ink dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              <ArrowUpDown size={13} />
              {isAr ? sortLabel?.ar : sortLabel?.en}
              <ChevronDown size={12} />
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute top-full mt-1 end-0 z-20 w-44 rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-white/10 shadow-xl py-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { setSortBy(opt.key); setShowSortMenu(false); }}
                      className={`w-full text-start px-3 py-2 text-xs transition-colors ${sortBy === opt.key ? 'text-primary font-semibold bg-primary/5' : 'text-ink dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                      {isAr ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Task list */}
        <div className="rounded-2xl border border-gray-200/50 dark:border-white/5 overflow-hidden">
          <div className="flex items-center px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200/50 dark:border-white/5">
            <Inbox size={14} className="text-muted shrink-0" />
            <span className="flex-1 text-[11px] font-semibold text-muted uppercase tracking-wide ms-2">{isAr ? 'الأعمال المتراكمة' : 'Backlog'} {backlogTasks.length}</span>
          </div>

          {backlogTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox size={40} className="text-muted dark:text-gray-600 mb-3" />
              <p className="text-sm text-muted">{isAr ? 'لا توجد مهام' : 'No tasks'}</p>
            </div>
          ) : (
            backlogTasks.map((task) => (
              <BacklogRow key={task.id} task={task} isAr={isAr} projects={projects} />
            ))
          )}
        </div>

        {/* Create task modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)}>
              <motion.div className="bg-white dark:bg-surface rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-ink dark:text-white">{isAr ? 'مهمة جديدة في المتراكمة' : 'New Backlog Task'}</h3>
                  <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><X size={18} className="text-muted" /></button>
                </div>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder={isAr ? 'عنوان المهمة' : 'Task title'} className={sel + ' mb-3'} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
                <select value={newProjectId} onChange={(e) => setNewProjectId(e.target.value)} className={sel + ' mb-4'}>
                  <option value="">{isAr ? 'اختر المشروع' : 'Select project'}</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{isAr ? p.nameAr : p.name}</option>)}
                </select>
                <button onClick={handleCreate} disabled={creating || !newTitle.trim() || !newProjectId} className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 transition-colors">
                  {creating ? (isAr ? 'جاري الإنشاء...' : 'Creating...') : (isAr ? 'إنشاء' : 'Create')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.03] last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer">
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: priColor }} />
      {catIcon && <span className="text-sm shrink-0">{catIcon}</span>}
      <span className="flex-1 text-sm text-ink dark:text-white truncate font-medium">{isAr ? task.titleAr : task.title}</span>
      <div className="flex items-center gap-3 shrink-0">
        {task.storyPoints > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-muted dark:text-gray-400">
            <Timer size={10} />{task.storyPoints}h
          </span>
        )}
        {task.dueDate && (
          <span className={`flex items-center gap-1 text-[10px] font-semibold ${isOverdue ? 'text-red-500' : 'text-muted dark:text-gray-400'}`}>
            <Calendar size={10} />{new Date(task.dueDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {cat && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: catColor + '18', color: catColor }}>{cat}</span>}
        {project && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: project.color + '18', color: project.color }}>{isAr ? project.nameAr : project.name}</span>}
      </div>
    </div>
  );
}
