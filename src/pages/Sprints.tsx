import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Target, TrendingUp, CheckCircle, Clock, Play, Calendar, Plus, X, Pencil, Trash2 } from 'lucide-react';

import { GlassCard } from '../components/ui/GlassCard';
import { Icon3D } from '../components/icons/Icon3D';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { useDataStore } from '../store/useDataStore';
import { useIsAdmin } from '../store/useAuthStore';
import { PageSkeleton } from '../components/ui/PageSkeleton';
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
  const { sprints, projects, addSprint, updateSprint, deleteSprint, isLoading } = useDataStore();
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const isAdmin = useIsAdmin();
  const [activeTab, setActiveTab] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim() || !newProjectId) return;
    setCreating(true);
    const today = new Date().toISOString().split('T')[0];
    const end = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    await addSprint({ name: newName.trim(), nameAr: newName.trim(), projectId: newProjectId, status: 'planning', startDate: today, endDate: end });
    setNewName('');
    setNewProjectId('');
    setShowCreate(false);
    setCreating(false);
  };

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

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="min-h-screen">


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

        {/* Tabs + Add button */}
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
          <div className="flex-1" />
          {isAdmin && (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shrink-0">
              <Plus size={16} />
              {isAr ? 'سبرينت جديد' : 'New Sprint'}
            </button>
          )}
        </div>

        {/* Create sprint modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)}>
              <motion.div className="bg-white dark:bg-surface rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-ink dark:text-white">{isAr ? 'سبرينت جديد' : 'New Sprint'}</h3>
                  <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><X size={18} className="text-muted" /></button>
                </div>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={isAr ? 'اسم السبرينت' : 'Sprint name'} className="w-full h-11 px-4 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-ink dark:text-white placeholder:text-muted outline-none focus:border-primary mb-3" autoFocus />
                <select value={newProjectId} onChange={(e) => setNewProjectId(e.target.value)} className="w-full h-11 px-4 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-ink dark:text-white outline-none focus:border-primary mb-4 appearance-none">
                  <option value="">{isAr ? 'اختر المشروع' : 'Select project'}</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{isAr ? p.nameAr : p.name}</option>)}
                </select>
                <button onClick={handleCreate} disabled={creating || !newName.trim() || !newProjectId} className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 transition-colors">
                  {creating ? (isAr ? 'جاري الإنشاء...' : 'Creating...') : (isAr ? 'إنشاء' : 'Create')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit sprint modal */}
        <AnimatePresence>
          {editingSprint && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingSprint(null)}>
              <motion.div className="bg-white dark:bg-surface rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                <EditSprintForm sprint={editingSprint} isAr={isAr} onClose={() => setEditingSprint(null)} onSave={async (data) => { await updateSprint(editingSprint.id, data); setEditingSprint(null); }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sprint Cards */}
        {filtered.length === 0 ? (
          <EmptyState icon={Timer} title={t('sprints.noSprints')} color="amber" />
        ) : (
          <div className="space-y-6">
            {filtered.map((sprint, i) => (
              <SprintCard key={sprint.id} sprint={sprint} isAr={isAr} delay={0.05 + i * 0.1}
                onEdit={isAdmin ? () => setEditingSprint(sprint) : undefined}
                onDelete={isAdmin ? async () => { if (confirm(isAr ? 'حذف هذا السبرينت؟' : 'Delete this sprint?')) await deleteSprint(sprint.id); } : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SprintCard({ sprint, isAr, delay, onEdit, onDelete }: { sprint: Sprint; isAr: boolean; delay: number; onEdit?: () => void; onDelete?: () => void }) {
  const { t } = useTranslation();
  const { getTasksBySprint } = useDataStore();
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
            {onEdit && <button onClick={onEdit} className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"><Pencil size={14} /></button>}
            {onDelete && <button onClick={onDelete} className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"><Trash2 size={14} /></button>}
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

const inputCls = 'w-full h-11 px-4 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-ink dark:text-white placeholder:text-muted outline-none focus:border-primary';

function EditSprintForm({ sprint, isAr, onClose, onSave }: { sprint: Sprint; isAr: boolean; onClose: () => void; onSave: (data: Partial<Sprint>) => Promise<void> }) {
  const [name, setName] = useState(sprint.name);
  const [nameAr, setNameAr] = useState(sprint.nameAr);
  const [status, setStatus] = useState(sprint.status);
  const [startDate, setStartDate] = useState(sprint.startDate);
  const [endDate, setEndDate] = useState(sprint.endDate);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => { setSaving(true); await onSave({ name, nameAr, status, startDate, endDate }); setSaving(false); };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-ink dark:text-white">{isAr ? 'تعديل السبرينت' : 'Edit Sprint'}</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><X size={18} className="text-muted" /></button>
      </div>
      <div className="space-y-3">
        <div><label className="block text-xs font-medium text-muted mb-1">{isAr ? 'الاسم (English)' : 'Name (English)'}</label><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-xs font-medium text-muted mb-1">{isAr ? 'الاسم (عربي)' : 'Name (Arabic)'}</label><input value={nameAr} onChange={(e) => setNameAr(e.target.value)} className={inputCls} dir="rtl" /></div>
        <div><label className="block text-xs font-medium text-muted mb-1">{isAr ? 'الحالة' : 'Status'}</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Sprint['status'])} className={inputCls + ' appearance-none'}>
            <option value="planning">{isAr ? 'تخطيط' : 'Planning'}</option>
            <option value="active">{isAr ? 'نشط' : 'Active'}</option>
            <option value="completed">{isAr ? 'مكتمل' : 'Completed'}</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-muted mb-1">{isAr ? 'تاريخ البدء' : 'Start Date'}</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} /></div>
          <div><label className="block text-xs font-medium text-muted mb-1">{isAr ? 'تاريخ الانتهاء' : 'End Date'}</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} /></div>
        </div>
      </div>
      <button onClick={handleSave} disabled={saving || !name.trim()} className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 transition-colors mt-4">
        {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
      </button>
    </>
  );
}
