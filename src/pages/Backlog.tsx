import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Timer, Search, Inbox, Plus, ChevronDown, ArrowUpDown, X, Pencil } from 'lucide-react';
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
  const { tasks, projects, sprints, teamMembers, addTask, isLoading } = useDataStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('created');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');

  const [showCreate, setShowCreate] = useState(false);

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
            <BacklogCreateModal isAr={isAr} projects={projects} sprints={sprints} onClose={() => setShowCreate(false)} onAdd={addTask} />
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

// ── HacknPlan-style Create Modal ──

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

type OptField = 'board' | 'description' | 'hours' | 'priority' | 'dueDate' | 'tags' | 'assignee';
const OPT_FIELDS: { key: OptField; en: string; ar: string; icon: string }[] = [
  { key: 'board', en: 'Board', ar: 'البورد', icon: '📋' },
  { key: 'description', en: 'Description', ar: 'الوصف', icon: '📝' },
  { key: 'hours', en: 'Work Hours', ar: 'ساعات العمل', icon: '⏱' },
  { key: 'priority', en: 'Priority', ar: 'الأولوية', icon: '⚡' },
  { key: 'dueDate', en: 'Due Date', ar: 'تاريخ الاستحقاق', icon: '📅' },
  { key: 'tags', en: 'Tags', ar: 'الوسوم', icon: '🏷️' },
  { key: 'assignee', en: 'Assignee', ar: 'المسؤول', icon: '👤' },
];

const BL_FIELDS_KEY = 'njd_backlog_fields';
function loadFields(): OptField[] {
  try { const s = localStorage.getItem(BL_FIELDS_KEY); return s ? JSON.parse(s) : ['board']; } catch { return ['board']; }
}

function BacklogCreateModal({ isAr, projects, sprints, onClose, onAdd }: {
  isAr: boolean;
  projects: { id: string; name: string; nameAr: string }[];
  sprints: { id: string; name: string; nameAr: string }[];
  onClose: () => void;
  onAdd: (data: Partial<Task>) => Promise<Task | null>;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [sprintId, setSprintId] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [fields, setFields] = useState<OptField[]>(loadFields);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [continueMode, setContinueMode] = useState(false);
  const [creating, setCreating] = useState(false);

  const has = (k: OptField) => fields.includes(k);
  const toggleField = (k: OptField) => {
    const next = has(k) ? fields.filter((f) => f !== k) : [...fields, k];
    setFields(next);
    localStorage.setItem(BL_FIELDS_KEY, JSON.stringify(next));
  };

  const handleAddTag = () => {
    const n = tagInput.split(',').map((t) => t.trim()).filter((t) => t && !tags.includes(t));
    if (n.length) { setTags([...tags, ...n]); setTagInput(''); }
  };

  const handleCreate = async () => {
    if (!title.trim() || !projectId) return;
    setCreating(true);
    const allTags = category ? [category, ...tags] : tags;
    await onAdd({
      title: title.trim(), titleAr: title.trim(),
      description: has('description') ? description : '', descriptionAr: has('description') ? description : '',
      projectId, sprintId: has('board') ? sprintId : '', status: 'todo',
      priority: has('priority') ? priority : 'medium',
      tags: allTags, tagsAr: allTags,
      dueDate: has('dueDate') ? dueDate : '',
      storyPoints: has('hours') ? hours : 0,
    });
    if (continueMode) { setTitle(''); setDescription(''); } else { onClose(); }
    setCreating(false);
  };

  const sel = 'w-full h-10 px-3 rounded-lg text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-ink dark:text-white outline-none focus:border-primary appearance-none';

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-white dark:bg-surface rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[85vh]" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
          <h3 className="text-base font-bold text-ink dark:text-white">{isAr ? 'مهمة جديدة' : 'New task'}</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowFieldPicker(!showFieldPicker)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-muted hover:text-primary hover:bg-primary/10 transition-colors">
                <Pencil size={11} />{isAr ? 'تعديل الحقول' : 'Edit fields'}
              </button>
              {showFieldPicker && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFieldPicker(false)} />
                  <div className="absolute top-full mt-1 end-0 z-20 w-52 rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-white/10 shadow-xl py-1">
                    {OPT_FIELDS.map((f) => (
                      <label key={f.key} className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <input type="checkbox" checked={has(f.key)} onChange={() => toggleField(f.key)} className="w-3.5 h-3.5 rounded text-primary" />
                        <span className="text-xs">{f.icon}</span>
                        <span className="text-xs text-ink dark:text-white">{isAr ? f.ar : f.en}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><X size={16} className="text-muted" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-3">
          {/* Title */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-muted w-16 shrink-0 text-end">{isAr ? 'العنوان' : 'Title'}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={isAr ? 'أدخل العنوان' : 'Enter title'} className={sel + ' flex-1 border-primary/50'} autoFocus />
          </div>

          {/* Category */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-muted w-16 shrink-0 text-end">{isAr ? 'التصنيف' : 'Category'}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={sel + ' flex-1'}>
              <option value="">{isAr ? 'بدون' : 'None'}</option>
              {CATEGORIES.map((c) => <option key={c.en} value={c.en}>{CATEGORY_ICONS[c.en] ?? ''} {isAr ? c.ar : c.en}</option>)}
            </select>
          </div>

          {/* Planning section */}
          <div className="border-t border-gray-200/30 dark:border-white/5 pt-3 mt-1">
            <p className="text-xs font-semibold text-ink dark:text-white mb-3 flex items-center gap-1.5">📋 {isAr ? 'التخطيط' : 'Planning'}</p>

            {/* Project */}
            <div className="flex items-center gap-3 mb-2">
              <label className="text-xs font-medium text-muted w-16 shrink-0 text-end">{isAr ? 'المشروع' : 'Project'}</label>
              <select value={projectId} onChange={(e) => { setProjectId(e.target.value); setSprintId(''); }} className={sel + ' flex-1'}>
                {projects.map((p) => <option key={p.id} value={p.id}>{isAr ? p.nameAr : p.name}</option>)}
              </select>
            </div>

            {/* Board/Sprint */}
            {has('board') && (
              <div className="flex items-center gap-3 mb-2">
                <label className="text-xs font-medium text-muted w-16 shrink-0 text-end">{isAr ? 'البورد' : 'Board'}</label>
                <select value={sprintId} onChange={(e) => setSprintId(e.target.value)} className={sel + ' flex-1'}>
                  <option value="">{isAr ? 'بدون بورد (متراكمة)' : 'No board (backlog)'}</option>
                  {sprints.map((s) => <option key={s.id} value={s.id}>{isAr ? s.nameAr : s.name}</option>)}
                </select>
              </div>
            )}

            {/* Priority */}
            {has('priority') && (
              <div className="flex items-center gap-3 mb-2">
                <label className="text-xs font-medium text-muted w-16 shrink-0 text-end">{isAr ? 'الأولوية' : 'Priority'}</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className={sel + ' flex-1'}>
                  <option value="low">🟢 {isAr ? 'منخفض' : 'Low'}</option>
                  <option value="medium">🟡 {isAr ? 'متوسط' : 'Medium'}</option>
                  <option value="high">🟠 {isAr ? 'عالي' : 'High'}</option>
                  <option value="critical">🔴 {isAr ? 'حرج' : 'Critical'}</option>
                </select>
              </div>
            )}

            {/* Work hours */}
            {has('hours') && (
              <div className="flex items-center gap-3 mb-2">
                <label className="text-xs font-medium text-muted w-16 shrink-0 text-end">{isAr ? 'الساعات' : 'Hours'}</label>
                <input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} className={sel + ' flex-1'} min={0} />
              </div>
            )}

            {/* Due date */}
            {has('dueDate') && (
              <div className="flex items-center gap-3 mb-2">
                <label className="text-xs font-medium text-muted w-16 shrink-0 text-end">{isAr ? 'التاريخ' : 'Due'}</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={sel + ' flex-1'} />
              </div>
            )}
          </div>

          {/* Description */}
          {has('description') && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1">{isAr ? 'الوصف' : 'Description'}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={isAr ? 'وصف اختياري...' : 'Optional...'} className={sel + ' h-20 py-2 resize-none'} />
            </div>
          )}

          {/* Tags */}
          {has('tags') && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1">{isAr ? 'الوسوم' : 'Tags'}</label>
              <div className="flex gap-2">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag(); } }} placeholder={isAr ? 'أضف...' : 'Add...'} className={sel + ' flex-1'} />
                <button type="button" onClick={handleAddTag} className="px-3 h-10 rounded-lg text-sm bg-gray-100 dark:bg-white/5 text-muted border border-gray-200 dark:border-white/10">+</button>
              </div>
              {tags.length > 0 && <div className="flex flex-wrap gap-1 mt-1.5">{tags.map((t) => <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary">{t}<button onClick={() => setTags(tags.filter((x) => x !== t))}><X size={9} /></button></span>)}</div>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200/30 dark:border-white/5 flex items-center gap-4 shrink-0">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={continueMode} onChange={(e) => setContinueMode(e.target.checked)} className="w-3.5 h-3.5 rounded text-primary" />
            <span className="text-[11px] text-muted">{isAr ? 'إنشاء ومتابعة' : 'Create & continue'}</span>
          </label>
          <div className="flex-1" />
          <button onClick={handleCreate} disabled={creating || !title.trim() || !projectId} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 transition-colors">
            ✓ {creating ? (isAr ? 'جاري...' : 'Creating...') : (isAr ? 'إنشاء' : 'Create')}
          </button>
          <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted hover:text-ink dark:hover:text-white transition-colors">
            ✕ {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
