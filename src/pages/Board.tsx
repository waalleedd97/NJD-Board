import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  X,
  Plus,
  Trash2,
  Pencil,
  Clock,
  Tag,
  FolderKanban,
  Timer,
  User,
  Zap,
  MessageSquare,
  Check,
} from 'lucide-react';

import { FilterBar } from '../components/ui/FilterBar';
import { boardColumns } from '../data/mockData';
import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabaseData } from '../lib/supabase';
import type { Task, TaskStatus } from '../data/mockData';

// ── Category color + emoji maps ──

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

function getCategoryColor(tag: string): string { return CATEGORY_COLORS[tag] ?? '#6B7280'; }
function getCategoryIcon(tag: string): string { return CATEGORY_ICONS[tag] ?? '🏷️'; }

// ── Priority colors ──

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#EF4444', high: '#F97316', medium: '#EAB308', low: '#22C55E',
};

const COLUMN_STYLES: Record<string, { border: string; headerBg: string; text: string; countBg: string }> = {
  'todo':        { border: 'border-gray-400',  headerBg: 'bg-gray-500/10 dark:bg-gray-400/10',  text: 'text-gray-500 dark:text-gray-400',  countBg: 'bg-gray-500/15 dark:bg-gray-400/15' },
  'in-progress': { border: 'border-blue-500',  headerBg: 'bg-blue-500/10 dark:bg-blue-400/10',  text: 'text-blue-600 dark:text-blue-400',  countBg: 'bg-blue-500/15 dark:bg-blue-400/15' },
  'review':      { border: 'border-amber-500', headerBg: 'bg-amber-500/10 dark:bg-amber-400/10', text: 'text-amber-600 dark:text-amber-400', countBg: 'bg-amber-500/15 dark:bg-amber-400/15' },
  'done':        { border: 'border-emerald-500', headerBg: 'bg-emerald-500/10 dark:bg-emerald-400/10', text: 'text-emerald-600 dark:text-emerald-400', countBg: 'bg-emerald-500/15 dark:bg-emerald-400/15' },
};

// ── Priority config (for side panel) ──

const PRIORITY_CONFIG: Record<string, { label: string; labelAr: string }> = {
  critical: { label: 'Critical', labelAr: 'حرج' },
  high:     { label: 'High', labelAr: 'عالي' },
  medium:   { label: 'Medium', labelAr: 'متوسط' },
  low:      { label: 'Low', labelAr: 'منخفض' },
};

export function Board() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sprintFilter, setSprintFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const { tasks, projects, sprints, teamMembers, addTask, updateTask, deleteTask } = useDataStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm(isAr ? 'حذف هذه المهمة؟' : 'Delete this task?')) return;
    await deleteTask(taskId);
    setSelectedTask(null);
  };

  const projectOptions = [
    { value: 'all', labelEn: 'All Projects', labelAr: 'جميع المشاريع' },
    ...projects.map((p) => ({ value: p.id, labelEn: p.name, labelAr: p.nameAr })),
  ];

  const assigneeOptions = [
    { value: 'all', labelEn: 'All Members', labelAr: 'جميع الأعضاء' },
    ...teamMembers.map((m) => ({ value: m.id, labelEn: m.name, labelAr: m.nameAr })),
  ];

  const sprintOptions = useMemo(() => {
    const filtered = projectFilter === 'all' ? sprints : sprints.filter((s) => {
      return tasks.some((t) => t.sprintId === s.id && t.projectId === projectFilter);
    });
    return [
      { value: 'all', labelEn: 'All Sprints', labelAr: 'جميع السبرينتات' },
      ...filtered.map((s) => ({ value: s.id, labelEn: s.name, labelAr: s.nameAr })),
    ];
  }, [sprints, tasks, projectFilter]);

  const categoryOptions = useMemo(() => {
    const cats = new Map<string, number>();
    tasks.forEach((t) => {
      const cat = t.tags?.[0];
      if (cat) cats.set(cat, (cats.get(cat) || 0) + 1);
    });
    return [
      { value: 'all', labelEn: 'All Categories', labelAr: 'جميع التصنيفات' },
      ...Array.from(cats.entries()).sort((a, b) => b[1] - a[1]).map(([cat, count]) => ({
        value: cat,
        labelEn: `${getCategoryIcon(cat)} ${cat} (${count})`,
        labelAr: `${getCategoryIcon(cat)} ${cat} (${count})`,
      })),
    ];
  }, [tasks]);

  const priorityOptions = [
    { value: 'all', labelEn: 'All Priorities', labelAr: 'جميع الأولويات' },
    { value: 'critical', labelEn: '🔴 Critical', labelAr: '🔴 حرج' },
    { value: 'high', labelEn: '🟠 High', labelAr: '🟠 عالي' },
    { value: 'medium', labelEn: '🟡 Medium', labelAr: '🟡 متوسط' },
    { value: 'low', labelEn: '🟢 Low', labelAr: '🟢 منخفض' },
  ];

  const handleProjectChange = (val: string) => {
    setProjectFilter(val);
    setSprintFilter('all');
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const title = isAr ? task.titleAr : task.title;
        const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
        const matchesProject = projectFilter === 'all' || task.projectId === projectFilter;
        const matchesSprint = sprintFilter === 'all' || task.sprintId === sprintFilter;
        const matchesAssignee = assigneeFilter === 'all' || task.assigneeId === assigneeFilter;
        const matchesCategory = categoryFilter === 'all' || task.tags?.[0] === categoryFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        return matchesSearch && matchesProject && matchesSprint && matchesAssignee && matchesCategory && matchesPriority;
      })
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [search, projectFilter, sprintFilter, assigneeFilter, categoryFilter, priorityFilter, tasks, isAr]);

  const getColumnTasks = (status: TaskStatus) =>
    filteredTasks.filter((task) => task.status === status);

  // Close panel on Escape
  useEffect(() => {
    if (!selectedTask) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedTask(null); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [selectedTask]);

  const panelOpen = !!selectedTask;

  return (
    <div className="min-h-screen bg-[var(--color-board-bg)] dark:bg-[var(--color-board-bg-dark)]">
      {/* Board area — adds padding when panel open */}
      <div className={`overflow-hidden ${panelOpen ? (isAr ? 'pr-0 pl-[44%]' : 'pl-0 pr-[44%]') : ''}`} onClick={() => { if (panelOpen) setSelectedTask(null); }}>
      <div className="p-6 space-y-6">
        {/* Context summary */}
        <p className="text-xs text-muted dark:text-gray-400">
          {(() => {
            const parts: string[] = [];
            const proj = projectFilter !== 'all' ? projects.find((p) => p.id === projectFilter) : null;
            parts.push(proj ? (isAr ? proj.nameAr : proj.name) : (isAr ? 'جميع المشاريع' : 'All Projects'));
            const sp = sprintFilter !== 'all' ? sprints.find((s) => s.id === sprintFilter) : null;
            parts.push(sp ? (isAr ? sp.nameAr : sp.name) : (isAr ? 'جميع السبرنتات' : 'All Sprints'));
            if (categoryFilter !== 'all') parts.push(categoryFilter);
            if (priorityFilter !== 'all') {
              const pl: Record<string, [string, string]> = { critical: ['حرج', 'Critical'], high: ['عالي', 'High'], medium: ['متوسط', 'Medium'], low: ['منخفض', 'Low'] };
              const p = pl[priorityFilter];
              parts.push(isAr ? `أولوية ${p?.[0] ?? priorityFilter}` : `${p?.[1] ?? priorityFilter} priority`);
            }
            parts.push(isAr ? `${filteredTasks.length} مهمة` : `${filteredTasks.length} tasks`);
            return parts.join(' · ');
          })()}
        </p>

        {/* Filters + Add button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <FilterBar
              searchValue={search}
              onSearchChange={setSearch}
              filters={[
                { value: projectFilter, options: projectOptions, onChange: handleProjectChange, placeholder: t('board.filterByProject') },
                { value: sprintFilter, options: sprintOptions, onChange: setSprintFilter, placeholder: isAr ? 'السبرينت' : 'Sprint' },
                { value: categoryFilter, options: categoryOptions, onChange: setCategoryFilter, placeholder: isAr ? 'التصنيف' : 'Category' },
                { value: assigneeFilter, options: assigneeOptions, onChange: setAssigneeFilter, placeholder: t('board.filterByAssignee') },
                { value: priorityFilter, options: priorityOptions, onChange: setPriorityFilter, placeholder: t('board.filterByPriority') },
              ]}
            />
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shrink-0">
            <Plus size={18} />
            {isAr ? 'مهمة جديدة' : 'New Task'}
          </button>
        </div>

        {/* Create task modal */}
        <AnimatePresence>
          {showCreate && (
            <CreateTaskModal
              isAr={isAr}
              projects={projects}
              sprints={sprints}
              defaultProjectId={projectFilter !== 'all' ? projectFilter : ''}
              defaultSprintId={sprintFilter !== 'all' ? sprintFilter : ''}
              onClose={() => setShowCreate(false)}
              onAdd={addTask}
            />
          )}
        </AnimatePresence>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {boardColumns.map((column, colIdx) => {
            const columnTasks = getColumnTasks(column.id);
            const cs = COLUMN_STYLES[column.id] ?? COLUMN_STYLES['todo'];
            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: colIdx * 0.08 }}
              >
                <div className="mb-3">
                  <div className={`flex items-center justify-between px-3 py-2 rounded-xl border-t-[3px] ${cs.border} ${cs.headerBg}`}>
                    <span className={`text-sm font-bold ${cs.text}`}>
                      {isAr ? column.titleAr : column.titleEn}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cs.countBg} ${cs.text}`}>
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 min-h-[200px] p-2 rounded-2xl bg-white/50 dark:bg-white/[0.04] border border-gray-200/30 dark:border-white/[0.06]">
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
      </div>{/* end board wrapper */}

      {/* Task Side Panel */}
      <AnimatePresence>
        {selectedTask && (
          <TaskPanel
            task={selectedTask}
            isAr={isAr}
            onClose={() => setSelectedTask(null)}
            onUpdate={async (data) => { await updateTask(selectedTask.id, data); }}
            onDelete={() => handleDeleteTask(selectedTask.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Task Card ──

function TaskCard({ task, isAr, delay, onClick }: { task: Task; isAr: boolean; delay: number; onClick: () => void }) {
  const { getTeamMember, getProject } = useDataStore();
  const assignee = getTeamMember(task.assigneeId);
  const project = getProject(task.projectId);

  const isDueSoon = () => { const d = new Date(task.dueDate); const diff = Math.ceil((d.getTime() - Date.now()) / 864e5); return diff <= 2 && diff >= 0; };
  const isOverdue = () => new Date(task.dueDate) < new Date();

  return (
    <motion.div
      className="group cursor-pointer rounded-xl p-3.5 bg-white dark:bg-[#151D2E] border border-gray-200/50 dark:border-white/[0.08] shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-night-accent/30 transition-all duration-200"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}
      onClick={onClick} whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="w-[10px] h-[10px] rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[task.priority] ?? '#EAB308' }} title={task.priority} />
        {project && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: project.color + '18', color: project.color }}>
            {isAr ? project.nameAr : project.name}
          </span>
        )}
      </div>

      <h4 className="text-sm font-semibold text-ink dark:text-white mb-2 line-clamp-2">{isAr ? task.titleAr : task.title}</h4>

      <div className="flex flex-wrap gap-1 mb-3">
        {(isAr ? task.tagsAr : task.tags).slice(0, 2).map((tag, i) => {
          const color = i === 0 ? getCategoryColor(tag) : undefined;
          const icon = i === 0 ? getCategoryIcon(tag) : '';
          return (
            <span key={tag} className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={color ? { backgroundColor: color + '18', color } : undefined}>
              {icon ? `${icon} ` : ''}{tag}
            </span>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {assignee && <span className="text-sm" title={isAr ? assignee.nameAr : assignee.name}>{assignee.avatar}</span>}
          {task.storyPoints > 0 && <span className="text-[10px] font-bold text-muted dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">{task.storyPoints}pt</span>}
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar size={11} className={`${isOverdue() ? 'text-red-500' : isDueSoon() ? 'text-amber-500' : 'text-muted dark:text-gray-500'}`} />
            <span className={`text-[10px] ${isOverdue() ? 'text-red-500 font-medium' : isDueSoon() ? 'text-amber-500' : 'text-muted dark:text-gray-500'}`}>{task.dueDate.slice(5)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Task Side Panel ──

function TaskPanel({ task, isAr, onClose, onUpdate, onDelete }: {
  task: Task; isAr: boolean; onClose: () => void; onUpdate: (data: Partial<Task>) => Promise<void>; onDelete: () => void;
}) {
  const { getTeamMember, getProject, sprints } = useDataStore();
  const assignee = getTeamMember(task.assigneeId);
  const project = getProject(task.projectId);
  const sprint = sprints.find((s) => s.id === task.sprintId);
  const cs = COLUMN_STYLES[task.status] ?? COLUMN_STYLES['todo'];

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(task.description);

  // Comments
  const [comments, setComments] = useState<{ id: string; user_name: string; content: string; created_at: string }[]>([]);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    supabaseData.from('comments').select('*').eq('task_id', task.id).order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setComments(data as typeof comments); });
  }, [task.id]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    const userName = currentUser ? (isAr ? currentUser.nameAr : currentUser.name) : 'Unknown';
    const { data } = await supabaseData.from('comments').insert({ task_id: task.id, user_name: userName, content: commentText.trim() }).select('*');
    if (data?.[0]) setComments((prev) => [...prev, data[0] as typeof comments[0]]);
    setCommentText('');
    setSendingComment(false);
  };

  const saveTitle = async () => {
    if (titleDraft.trim() && titleDraft !== task.title) await onUpdate({ title: titleDraft.trim(), titleAr: titleDraft.trim() });
    setEditingTitle(false);
  };

  const saveDesc = async () => {
    if (descDraft !== task.description) await onUpdate({ description: descDraft, descriptionAr: descDraft });
    setEditingDesc(false);
  };

  const statusLabel = (s: TaskStatus) => {
    const labels: Record<TaskStatus, [string, string]> = { 'todo': ['قيد الانتظار', 'To Do'], 'in-progress': ['قيد التنفيذ', 'In Progress'], 'review': ['مراجعة', 'Review'], 'done': ['مكتمل', 'Done'] };
    return isAr ? labels[s][0] : labels[s][1];
  };

  const fieldLabel = 'text-[11px] font-medium text-muted dark:text-gray-500 uppercase tracking-wide';
  const created = task.createdAt ? new Date(task.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

  useEffect(() => {
    setEditingTitle(false); setTitleDraft(task.title); setEditingDesc(false); setDescDraft(task.description);
  }, [task.id]);

  return (
      <motion.div
        className={`fixed top-[var(--njd-navbar-height,64px)] ${isAr ? 'left-0' : 'right-0'} w-[42%] min-w-[380px] max-w-xl flex flex-col bg-[var(--color-board-panel)] dark:bg-[var(--color-board-panel-dark)] ${isAr ? 'border-r-2 border-r-gray-300 dark:border-r-white/10' : 'border-l-2 border-l-gray-300 dark:border-l-white/10'} overflow-hidden z-30`}
        style={{ height: 'calc(100vh - var(--njd-navbar-height, 64px))', boxShadow: isAr ? '6px 0 20px rgba(0,0,0,0.15)' : '-6px 0 20px rgba(0,0,0,0.15)' }}
        initial={{ x: isAr ? '-100%' : '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: isAr ? '-100%' : '100%', opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-200/50 dark:border-white/5 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {project && <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: project.color + '20', color: project.color }}>{isAr ? project.nameAr : project.name}</span>}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cs.countBg} ${cs.text}`}>{statusLabel(task.status)}</span>
              </div>
              {editingTitle ? (
                <input value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} onBlur={saveTitle} onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleDraft(task.title); setEditingTitle(false); } }} className="text-xl font-bold text-ink dark:text-white bg-transparent outline-none border-b-2 border-primary w-full" autoFocus />
              ) : (
                <h2 onClick={() => { setTitleDraft(task.title); setEditingTitle(true); }} className="text-xl font-bold text-ink dark:text-white cursor-text hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg px-1 -mx-1 transition-colors">{isAr ? task.titleAr : task.title}</h2>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 shrink-0 mt-1"><X size={18} className="text-muted" /></button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Fields grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div><p className={fieldLabel}><Timer size={10} className="inline mb-0.5" /> {isAr ? 'السبرنت' : 'Sprint'}</p><p className="text-sm text-ink dark:text-white">{sprint ? (isAr ? sprint.nameAr : sprint.name) : '—'}</p></div>
            <div><p className={fieldLabel}><FolderKanban size={10} className="inline mb-0.5" /> {isAr ? 'التصنيف' : 'Category'}</p>{task.tags?.[0] ? <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: getCategoryColor(task.tags[0]) + '18', color: getCategoryColor(task.tags[0]) }}>{getCategoryIcon(task.tags[0])} {task.tags[0]}</span> : <p className="text-sm text-muted">—</p>}</div>
            <div><p className={fieldLabel}><User size={10} className="inline mb-0.5" /> {isAr ? 'المسؤول' : 'Assignee'}</p>{assignee ? <div className="flex items-center gap-1.5"><span className="text-base">{assignee.avatar}</span><span className="text-sm text-ink dark:text-white">{isAr ? assignee.nameAr : assignee.name}</span></div> : <p className="text-sm text-muted">—</p>}</div>
            <div>
              <p className={fieldLabel}><Zap size={10} className="inline mb-0.5" /> {isAr ? 'الحالة' : 'Status'}</p>
              <select value={task.status} onChange={(e) => onUpdate({ status: e.target.value as TaskStatus })} className="text-sm font-medium bg-transparent border-none outline-none cursor-pointer text-ink dark:text-white p-0">
                {boardColumns.map((c) => <option key={c.id} value={c.id}>{isAr ? c.titleAr : c.titleEn}</option>)}
              </select>
            </div>
            <div>
              <p className={fieldLabel}>{isAr ? 'الأولوية' : 'Priority'}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-[10px] h-[10px] rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[task.priority] ?? '#EAB308' }} />
                <select value={task.priority} onChange={(e) => onUpdate({ priority: e.target.value as Task['priority'] })} className="text-sm font-medium bg-transparent border-none outline-none cursor-pointer text-ink dark:text-white p-0">
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{isAr ? v.labelAr : v.label}</option>)}
                </select>
              </div>
            </div>
            <div><p className={fieldLabel}><Calendar size={10} className="inline mb-0.5" /> {isAr ? 'تاريخ الاستحقاق' : 'Due Date'}</p><input type="date" value={task.dueDate || ''} onChange={(e) => onUpdate({ dueDate: e.target.value })} className="text-sm bg-transparent border-none outline-none cursor-pointer text-ink dark:text-white p-0" /></div>
            <div><p className={fieldLabel}>{isAr ? 'النقاط' : 'Story Points'}</p><p className="text-sm text-ink dark:text-white font-bold">{task.storyPoints} <span className="text-muted font-normal">pts</span></p></div>
            <div><p className={fieldLabel}><Tag size={10} className="inline mb-0.5" /> {isAr ? 'الوسوم' : 'Tags'}</p><div className="flex flex-wrap gap-1">{(isAr ? task.tagsAr : task.tags).map((tag) => <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-muted dark:text-gray-400">{tag}</span>)}{task.tags.length === 0 && <p className="text-sm text-muted">—</p>}</div></div>
          </div>

          {/* Description */}
          <div>
            <p className={fieldLabel + ' mb-2'}>{isAr ? 'الوصف' : 'Description'}</p>
            {editingDesc ? (
              <div>
                <textarea value={descDraft} onChange={(e) => setDescDraft(e.target.value)} className="w-full min-h-[100px] p-3 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-ink dark:text-white outline-none focus:border-primary resize-y" autoFocus />
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={saveDesc} className="px-3 py-1 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-1"><Check size={12} /> {isAr ? 'حفظ' : 'Save'}</button>
                  <button onClick={() => { setDescDraft(task.description); setEditingDesc(false); }} className="px-3 py-1 rounded-lg text-xs text-muted hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">{isAr ? 'إلغاء' : 'Cancel'}</button>
                </div>
              </div>
            ) : (
              <div onClick={() => { setDescDraft(task.description); setEditingDesc(true); }} className="min-h-[60px] p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 cursor-text transition-colors">
                {(isAr ? task.descriptionAr : task.description) ? <p className="text-sm text-ink dark:text-white whitespace-pre-wrap">{isAr ? task.descriptionAr : task.description}</p> : <p className="text-sm text-muted italic">{isAr ? 'أضف وصفاً...' : 'Add a description...'}</p>}
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <p className={fieldLabel + ' mb-2'}><MessageSquare size={10} className="inline mb-0.5" /> {isAr ? 'التعليقات' : 'Comments'} {comments.length > 0 && <span className="text-muted">({comments.length})</span>}</p>
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-ink dark:text-white">{c.user_name}</span>
                    <span className="text-[10px] text-muted dark:text-gray-500">{new Date(c.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-ink dark:text-gray-300 whitespace-pre-wrap">{c.content}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }} placeholder={isAr ? 'أضف تعليقاً...' : 'Add a comment...'} className="flex-1 h-9 px-3 rounded-lg text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-ink dark:text-white placeholder:text-muted outline-none focus:border-primary" />
                <button onClick={handleAddComment} disabled={sendingComment || !commentText.trim()} className="px-3 h-9 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-colors">{isAr ? 'إرسال' : 'Send'}</button>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div>
            <p className={fieldLabel + ' mb-2'}><Clock size={10} className="inline mb-0.5" /> {isAr ? 'النشاط' : 'Activity'}</p>
            <div className="space-y-2">
              {created && <div className="flex items-center gap-2 text-xs text-muted dark:text-gray-500"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />{isAr ? `تم الإنشاء في ${created}` : `Created on ${created}`}</div>}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-200/50 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {boardColumns.filter((c) => c.id !== task.status).map((col) => {
              const colStyle = COLUMN_STYLES[col.id] ?? COLUMN_STYLES['todo'];
              return <button key={col.id} onClick={() => onUpdate({ status: col.id as TaskStatus })} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${colStyle.headerBg} ${colStyle.text} border-transparent hover:border-current`}>→ {isAr ? col.titleAr : col.titleEn}</button>;
            })}
            <div className="flex-1" />
            <button onClick={onDelete} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-1"><Trash2 size={12} />{isAr ? 'حذف' : 'Delete'}</button>
          </div>
        </div>
      </motion.div>
  );
}

// ── HacknPlan categories ──

const CATEGORIES = [
  { en: 'Programming', ar: 'برمجة' }, { en: '3D (General)', ar: '3D (عام)' },
  { en: '3D Environment & Prop Art', ar: 'فن البيئة والعناصر ثلاثية الأبعاد' },
  { en: '3D Vehicle Art', ar: 'فن المركبات ثلاثية الأبعاد' }, { en: 'Optimization', ar: 'تحسين الأداء' },
  { en: 'Game Design', ar: 'تصميم اللعبة' }, { en: 'UX/UI Design', ar: 'تصميم واجهة المستخدم' },
  { en: 'Graphic Design', ar: 'تصميم جرافيك' }, { en: 'Writing', ar: 'كتابة' },
  { en: 'Marketing', ar: 'تسويق' }, { en: 'Live-Ops', ar: 'عمليات مباشرة' },
  { en: 'Testing', ar: 'اختبار' }, { en: 'Meetings', ar: 'اجتماعات' },
  { en: 'Project Management', ar: 'إدارة المشاريع' }, { en: 'Bug', ar: 'خطأ برمجي' },
];

// ── Optional field keys ──

type OptionalField = 'description' | 'priority' | 'tags' | 'dueDate' | 'storyPoints';

const OPTIONAL_FIELDS: { key: OptionalField; en: string; ar: string }[] = [
  { key: 'description', en: 'Description', ar: 'الوصف' },
  { key: 'priority', en: 'Priority', ar: 'الأولوية' },
  { key: 'tags', en: 'Tags', ar: 'الوسوم' },
  { key: 'dueDate', en: 'Due Date', ar: 'تاريخ الاستحقاق' },
  { key: 'storyPoints', en: 'Story Points', ar: 'النقاط' },
];

const FIELDS_STORAGE_KEY = 'njd_create_task_fields';

function loadSavedFields(): OptionalField[] {
  try { const s = localStorage.getItem(FIELDS_STORAGE_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}

// ── Create Task Modal ──

function CreateTaskModal({ isAr, projects, sprints, defaultProjectId, defaultSprintId, onClose, onAdd }: {
  isAr: boolean; projects: { id: string; name: string; nameAr: string }[]; sprints: { id: string; name: string; nameAr: string }[];
  defaultProjectId: string; defaultSprintId: string; onClose: () => void; onAdd: (data: Partial<Task>) => Promise<Task | null>;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [sprintId, setSprintId] = useState(defaultSprintId);
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [storyPoints, setStoryPoints] = useState(0);
  const [visibleFields, setVisibleFields] = useState<OptionalField[]>(loadSavedFields);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [continueMode, setContinueMode] = useState(false);
  const [creating, setCreating] = useState(false);

  const toggleField = (key: OptionalField) => { const next = visibleFields.includes(key) ? visibleFields.filter((f) => f !== key) : [...visibleFields, key]; setVisibleFields(next); localStorage.setItem(FIELDS_STORAGE_KEY, JSON.stringify(next)); };
  const has = (key: OptionalField) => visibleFields.includes(key);
  const handleAddTag = () => { const n = tagInput.split(',').map((t) => t.trim()).filter((t) => t && !tags.includes(t)); if (n.length) { setTags([...tags, ...n]); setTagInput(''); } };

  const handleCreate = async () => {
    if (!title.trim() || !projectId) return;
    setCreating(true);
    const allTags = category ? [category, ...tags] : tags;
    await onAdd({ title: title.trim(), titleAr: title.trim(), description: has('description') ? description : '', descriptionAr: has('description') ? description : '', projectId, sprintId: sprintId || '', priority: has('priority') ? priority : 'medium', status: 'todo', tags: allTags, tagsAr: allTags, dueDate: has('dueDate') ? dueDate : '', storyPoints: has('storyPoints') ? storyPoints : 0 });
    if (continueMode) { setTitle(''); setDescription(''); } else { onClose(); }
    setCreating(false);
  };

  const sel = 'w-full h-11 px-4 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-ink dark:text-white outline-none focus:border-primary appearance-none';

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-white dark:bg-surface rounded-2xl w-full max-w-xl shadow-2xl" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-lg font-bold text-ink dark:text-white">{isAr ? 'مهمة جديدة' : 'New Task'}</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowFieldPicker(!showFieldPicker)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-primary hover:bg-primary/10 transition-colors"><Pencil size={12} />{isAr ? 'تعديل الحقول' : 'Edit fields'}</button>
              {showFieldPicker && (<><div className="fixed inset-0 z-10" onClick={() => setShowFieldPicker(false)} /><div className="absolute top-full mt-1 end-0 z-20 w-48 rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-white/10 shadow-xl p-2">{OPTIONAL_FIELDS.map((f) => <label key={f.key} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"><input type="checkbox" checked={has(f.key)} onChange={() => toggleField(f.key)} className="w-3.5 h-3.5 rounded border-gray-300 dark:border-white/20 text-primary focus:ring-primary" /><span className="text-xs text-ink dark:text-white">{isAr ? f.ar : f.en}</span></label>)}</div></>)}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><X size={18} className="text-muted" /></button>
          </div>
        </div>
        <div className="px-6 space-y-3 max-h-[65vh] overflow-y-auto">
          <div><label className="block text-xs font-medium text-muted dark:text-gray-400 mb-1">{isAr ? 'العنوان' : 'Title'} *</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={isAr ? 'عنوان المهمة...' : 'Task title...'} className={sel} autoFocus onKeyDown={(e) => { if (e.key === 'Enter' && title.trim() && projectId) handleCreate(); }} /></div>
          <div><label className="block text-xs font-medium text-muted dark:text-gray-400 mb-1">{isAr ? 'التصنيف' : 'Category'}</label><select value={category} onChange={(e) => setCategory(e.target.value)} className={sel}><option value="">{isAr ? 'بدون تصنيف' : 'No category'}</option>{CATEGORIES.map((c) => <option key={c.en} value={c.en}>{getCategoryIcon(c.en)} {isAr ? c.ar : c.en}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-muted dark:text-gray-400 mb-1">{isAr ? 'المشروع' : 'Project'} *</label><select value={projectId} onChange={(e) => { setProjectId(e.target.value); setSprintId(''); }} className={sel}><option value="">{isAr ? 'اختر...' : 'Select...'}</option>{projects.map((p) => <option key={p.id} value={p.id}>{isAr ? p.nameAr : p.name}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-muted dark:text-gray-400 mb-1">{isAr ? 'السبرنت' : 'Sprint'}</label><select value={sprintId} onChange={(e) => setSprintId(e.target.value)} className={sel}><option value="">{isAr ? 'بدون' : 'None'}</option>{sprints.map((s) => <option key={s.id} value={s.id}>{isAr ? s.nameAr : s.name}</option>)}</select></div>
          </div>
          {has('priority') && <div><label className="block text-xs font-medium text-muted dark:text-gray-400 mb-1">{isAr ? 'الأولوية' : 'Priority'}</label><select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className={sel}><option value="low">🟢 {isAr ? 'منخفض' : 'Low'}</option><option value="medium">🟡 {isAr ? 'متوسط' : 'Medium'}</option><option value="high">🟠 {isAr ? 'عالي' : 'High'}</option><option value="critical">🔴 {isAr ? 'حرج' : 'Critical'}</option></select></div>}
          {has('description') && <div><label className="block text-xs font-medium text-muted dark:text-gray-400 mb-1">{isAr ? 'الوصف' : 'Description'}</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={isAr ? 'وصف اختياري...' : 'Optional description...'} className={sel + ' h-20 py-2 resize-none'} /></div>}
          {has('dueDate') && <div><label className="block text-xs font-medium text-muted dark:text-gray-400 mb-1">{isAr ? 'تاريخ الاستحقاق' : 'Due Date'}</label><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={sel} /></div>}
          {has('storyPoints') && <div><label className="block text-xs font-medium text-muted dark:text-gray-400 mb-1">{isAr ? 'النقاط' : 'Story Points'}</label><input type="number" value={storyPoints} onChange={(e) => setStoryPoints(Number(e.target.value))} className={sel} min={0} /></div>}
          {has('tags') && <div><label className="block text-xs font-medium text-muted dark:text-gray-400 mb-1">{isAr ? 'الوسوم' : 'Tags'}</label><div className="flex gap-2"><input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag(); } }} placeholder={isAr ? 'أضف وسم...' : 'Add tag...'} className={sel + ' flex-1'} /><button type="button" onClick={handleAddTag} className="px-3 h-11 rounded-xl text-sm font-medium bg-gray-100 dark:bg-white/5 text-muted hover:text-ink dark:hover:text-white border border-gray-200 dark:border-white/10 transition-colors">+</button></div>{tags.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-night-accent">{tag}<button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-red-500 transition-colors"><X size={10} /></button></span>)}</div>}</div>}
        </div>
        <div className="px-6 pb-6 pt-4 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={continueMode} onChange={(e) => setContinueMode(e.target.checked)} className="w-4 h-4 rounded border-gray-300 dark:border-white/20 text-primary focus:ring-primary" /><span className="text-xs text-muted dark:text-gray-400">{isAr ? 'إنشاء ومتابعة' : 'Create & Continue'}</span></label>
          <button onClick={handleCreate} disabled={creating || !title.trim() || !projectId} className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 transition-colors">{creating ? (isAr ? 'جاري الإنشاء...' : 'Creating...') : (isAr ? 'إنشاء' : 'Create')}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
