import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderKanban, Calendar, Users, ChevronDown, ChevronUp, ExternalLink, BarChart3, Plus, X, Trash2, Pencil } from 'lucide-react';

import { GlassCard } from '../components/ui/GlassCard';
import { Icon3D } from '../components/icons/Icon3D';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ProgressRing } from '../components/ui/ProgressRing';
import { FilterBar } from '../components/ui/FilterBar';
import { EmptyState } from '../components/ui/EmptyState';
import { useDataStore } from '../store/useDataStore';
import { useIsAdmin } from '../store/useAuthStore';
import { PageSkeleton } from '../components/ui/PageSkeleton';
import type { Project } from '../data/mockData';
import { Link } from 'react-router-dom';

// ── Shared modal input class ──
const inputCls = 'w-full h-11 px-4 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-ink dark:text-white placeholder:text-muted outline-none focus:border-primary';

const PROJECT_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#8B5CF6'];

export function Projects() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { projects, teamMembers, addProject, updateProject, deleteProject, isLoading } = useDataStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isAdmin = useIsAdmin();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const today = new Date().toISOString().split('T')[0];
    const end = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
    await addProject({ name: newName.trim(), nameAr: newName.trim(), startDate: today, endDate: end, status: 'active', color: '#7C3AED' });
    setNewName('');
    setShowCreate(false);
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Delete this project?')) return;
    await deleteProject(id);
  };

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

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="min-h-screen">
      <div className="p-6 space-y-6 max-w-[1400px]">
        {/* Header with stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label={isAr ? 'مشاريع نشطة' : 'Active Projects'} value={projects.filter((p) => p.status === 'active').length} color="green" delay={0} />
          <StatCard label={isAr ? 'إجمالي المهام' : 'Total Tasks'} value={projects.reduce((sum, p) => sum + p.tasksTotal, 0)} color="purple" delay={0.05} />
          <StatCard label={isAr ? 'أعضاء الفريق' : 'Team Members'} value={teamMembers.length} color="blue" delay={0.1} />
        </div>

        {/* Filters + Add button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <FilterBar searchValue={search} onSearchChange={setSearch} filters={[{ value: statusFilter, options: statusOptions, onChange: setStatusFilter, placeholder: t('projects.allProjects') }]} />
          </div>
          {isAdmin && (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shrink-0">
              <Plus size={18} />
              {isAr ? 'مشروع جديد' : 'New Project'}
            </button>
          )}
        </div>

        {/* Create modal */}
        <AnimatePresence>
          {showCreate && (
            <ModalBackdrop onClose={() => setShowCreate(false)}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-ink dark:text-white">{isAr ? 'مشروع جديد' : 'New Project'}</h3>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><X size={18} className="text-muted" /></button>
              </div>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={isAr ? 'اسم المشروع' : 'Project name'} className={inputCls + ' mb-4'} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
              <button onClick={handleCreate} disabled={creating || !newName.trim()} className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 transition-colors">
                {creating ? (isAr ? 'جاري الإنشاء...' : 'Creating...') : (isAr ? 'إنشاء' : 'Create')}
              </button>
            </ModalBackdrop>
          )}
        </AnimatePresence>

        {/* Edit modal */}
        <AnimatePresence>
          {editProject && (
            <EditProjectModal project={editProject} isAr={isAr} onClose={() => setEditProject(null)} onSave={async (data) => { await updateProject(editProject.id, data); setEditProject(null); }} />
          )}
        </AnimatePresence>

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
                onEdit={isAdmin ? () => setEditProject(project) : undefined}
                onDelete={isAdmin ? () => handleDelete(project.id) : undefined}
                delay={0.05 + i * 0.08}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Edit Project Modal ──

function EditProjectModal({ project, isAr, onClose, onSave }: {
  project: Project;
  isAr: boolean;
  onClose: () => void;
  onSave: (data: Partial<Project>) => Promise<void>;
}) {
  const [name, setName] = useState(project.name);
  const [nameAr, setNameAr] = useState(project.nameAr);
  const [description, setDescription] = useState(project.description);
  const [descriptionAr, setDescriptionAr] = useState(project.descriptionAr);
  const [color, setColor] = useState(project.color);
  const [status, setStatus] = useState(project.status);
  const [startDate, setStartDate] = useState(project.startDate);
  const [endDate, setEndDate] = useState(project.endDate);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ name, nameAr, description, descriptionAr, color, status, startDate, endDate });
    setSaving(false);
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-ink dark:text-white">{isAr ? 'تعديل المشروع' : 'Edit Project'}</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><X size={18} className="text-muted" /></button>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        <Field label={isAr ? 'الاسم (English)' : 'Name (English)'}><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
        <Field label={isAr ? 'الاسم (عربي)' : 'Name (Arabic)'}><input value={nameAr} onChange={(e) => setNameAr(e.target.value)} className={inputCls} dir="rtl" /></Field>
        <Field label={isAr ? 'الوصف (English)' : 'Description (English)'}><textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls + ' h-20 py-2 resize-none'} /></Field>
        <Field label={isAr ? 'الوصف (عربي)' : 'Description (Arabic)'}><textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} className={inputCls + ' h-20 py-2 resize-none'} dir="rtl" /></Field>

        <Field label={isAr ? 'اللون' : 'Color'}>
          <div className="flex items-center gap-2">
            {PROJECT_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-ink dark:border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
            ))}
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded-full border-0 cursor-pointer" />
          </div>
        </Field>

        <Field label={isAr ? 'الحالة' : 'Status'}>
          <select value={status} onChange={(e) => setStatus(e.target.value as Project['status'])} className={inputCls + ' appearance-none'}>
            <option value="active">{isAr ? 'نشط' : 'Active'}</option>
            <option value="on-hold">{isAr ? 'معلق' : 'On Hold'}</option>
            <option value="completed">{isAr ? 'مكتمل' : 'Completed'}</option>
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={isAr ? 'تاريخ البدء' : 'Start Date'}><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} /></Field>
          <Field label={isAr ? 'تاريخ الانتهاء' : 'End Date'}><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} /></Field>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving || !name.trim()} className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 transition-colors mt-4">
        {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
      </button>
    </ModalBackdrop>
  );
}

// ── Shared helpers ──

function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-white dark:bg-surface rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted dark:text-gray-400 mb-1">{label}</label>
      {children}
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

// ── Project Card ──

function ProjectCard({
  project, isAr, isExpanded, onToggle, onEdit, onDelete, delay,
}: {
  project: Project; isAr: boolean; isExpanded: boolean; onToggle: () => void; onEdit?: () => void; onDelete?: () => void; delay: number;
}) {
  const { t } = useTranslation();
  const { getProjectTeam, getTasksByProject } = useDataStore();
  const team = getProjectTeam(project);
  const projectTasks = getTasksByProject(project.id);
  const todoCount = projectTasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = projectTasks.filter((t) => t.status === 'in-progress').length;
  const reviewCount = projectTasks.filter((t) => t.status === 'review').length;
  const doneCount = projectTasks.filter((t) => t.status === 'done').length;

  return (
    <motion.div
      className="rounded-[20px] overflow-hidden bg-white/80 dark:bg-surface/80 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(124,58,237,0.1)] transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
    >
      <div className="h-1" style={{ backgroundColor: project.color }} />
      <div className="p-6">
        <div className="flex items-start gap-4">
          <ProgressRing progress={project.progress} color={project.color} size={72} strokeWidth={6} label="" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-ink dark:text-white">{isAr ? project.nameAr : project.name}</h3>
                <p className="text-sm text-muted dark:text-gray-400 mt-0.5">{isAr ? project.descriptionAr : project.description}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge status={project.status} />
                {onEdit && (
                  <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors">
                    <Pencil size={14} />
                  </button>
                )}
                {onDelete && (
                  <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted dark:text-gray-400"><Calendar size={14} /><span>{project.startDate} → {project.endDate}</span></div>
              <div className="flex items-center gap-1.5 text-xs text-muted dark:text-gray-400"><FolderKanban size={14} /><span>{t('projects.tasksCompleted', { completed: project.tasksCompleted, total: project.tasksTotal })}</span></div>
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-muted" />
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {team.slice(0, 4).map((m) => (
                    <span key={m.id} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs border-2 border-white dark:border-surface" title={isAr ? m.nameAr : m.name}>{m.avatar}</span>
                  ))}
                  {team.length > 4 && <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-surface">+{team.length - 4}</span>}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted dark:text-gray-400">{t('projects.progress')}</span>
                <span className="font-semibold text-ink dark:text-white">{project.progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: project.color }} initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 0.8, delay: delay + 0.2 }} />
              </div>
            </div>
          </div>
        </div>

        <button onClick={onToggle} className="flex items-center gap-1 mx-auto mt-4 text-xs text-muted hover:text-primary dark:hover:text-night-accent transition-colors">
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{isExpanded ? (isAr ? 'إخفاء التفاصيل' : 'Hide Details') : t('projects.viewDetails')}</span>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="pt-4 mt-4 border-t border-gray-200/50 dark:border-white/5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <MiniStat label={isAr ? 'قيد الانتظار' : 'To Do'} value={todoCount} color="bg-gray-400" />
                  <MiniStat label={isAr ? 'قيد التنفيذ' : 'In Progress'} value={inProgressCount} color="bg-blue-500" />
                  <MiniStat label={isAr ? 'مراجعة' : 'Review'} value={reviewCount} color="bg-amber-500" />
                  <MiniStat label={isAr ? 'مكتمل' : 'Done'} value={doneCount} color="bg-emerald-500" />
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(isAr ? project.tagsAr : project.tags).map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-night-accent">{tag}</span>
                  ))}
                </div>
                <div className="mb-2">
                  <p className="text-xs font-medium text-muted dark:text-gray-400 mb-2">{t('projects.teamMembers')}</p>
                  <div className="flex flex-wrap gap-2">
                    {team.map((m) => (
                      <div key={m.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 dark:bg-white/5 text-xs">
                        <span>{m.avatar}</span>
                        <span className="text-ink dark:text-white font-medium">{isAr ? m.nameAr : m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link to="/board" className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary dark:text-night-accent hover:underline">
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
