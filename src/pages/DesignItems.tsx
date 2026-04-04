import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, MessageSquare, Clock, Plus, X, Pencil, Trash2 } from 'lucide-react';

import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FilterBar } from '../components/ui/FilterBar';
import { EmptyState } from '../components/ui/EmptyState';
import { useDataStore } from '../store/useDataStore';
import { PageSkeleton } from '../components/ui/PageSkeleton';
import type { DesignItemType } from '../data/mockData';

const typeConfig: Record<DesignItemType, { labelEn: string; labelAr: string; color: string }> = {
  'ui': { labelEn: 'UI Design', labelAr: 'واجهة المستخدم', color: '#7C3AED' },
  '3d-model': { labelEn: '3D Model', labelAr: 'نموذج ثلاثي الأبعاد', color: '#3B82F6' },
  'animation': { labelEn: 'Animation', labelAr: 'رسوم متحركة', color: '#EC4899' },
  'concept-art': { labelEn: 'Concept Art', labelAr: 'فن مفاهيمي', color: '#F59E0B' },
  'icon': { labelEn: 'Icon', labelAr: 'أيقونة', color: '#10B981' },
  'texture': { labelEn: 'Texture', labelAr: 'خامة', color: '#06B6D4' },
};

export function DesignItems() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { designItems, projects, addDesignItem, updateDesignItem, deleteDesignItem, isLoading } = useDataStore();
  const [editingItem, setEditingItem] = useState<typeof designItems[0] | null>(null);
  const [projectFilter, setProjectFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<DesignItemType>('concept-art');
  const [newProjectId, setNewProjectId] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newProjectId) return;
    setCreating(true);
    await addDesignItem({ title: newTitle.trim(), titleAr: newTitle.trim(), type: newType, projectId: newProjectId, status: 'draft' });
    setNewTitle('');
    setNewProjectId('');
    setShowCreate(false);
    setCreating(false);
  };

  const typeOptions = [
    { value: 'all', labelEn: 'All Types', labelAr: 'جميع الأنواع' },
    ...Object.entries(typeConfig).map(([key, val]) => ({
      value: key,
      labelEn: val.labelEn,
      labelAr: val.labelAr,
    })),
  ];

  const statusOptions = [
    { value: 'all', labelEn: 'All Statuses', labelAr: 'جميع الحالات' },
    { value: 'draft', labelEn: 'Draft', labelAr: 'مسودة' },
    { value: 'in-review', labelEn: 'In Review', labelAr: 'قيد المراجعة' },
    { value: 'approved', labelEn: 'Approved', labelAr: 'معتمد' },
    { value: 'revision', labelEn: 'Revision', labelAr: 'مراجعة' },
  ];

  const projectOptions = [
    { value: 'all', labelEn: 'All Projects', labelAr: 'جميع المشاريع' },
    ...projects.map((p) => ({ value: p.id, labelEn: p.name, labelAr: p.nameAr })),
  ];

  const filtered = useMemo(() => {
    return designItems.filter((item) => {
      const title = isAr ? item.titleAr : item.title;
      const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesProject = projectFilter === 'all' || item.projectId === projectFilter;
      return matchesSearch && matchesType && matchesStatus && matchesProject;
    });
  }, [search, typeFilter, statusFilter, projectFilter, isAr]);

  // Stats
  const stats = useMemo(() => ({
    total: designItems.length,
    approved: designItems.filter((d) => d.status === 'approved').length,
    inReview: designItems.filter((d) => d.status === 'in-review').length,
    draft: designItems.filter((d) => d.status === 'draft').length,
  }), []);

  if (isLoading) return <PageSkeleton variant="grid" />;

  return (
    <div className="min-h-screen">


      <div className="p-6 space-y-6 max-w-[1400px]">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GlassCard delay={0}>
            <p className="text-2xl font-bold text-ink dark:text-white">{stats.total}</p>
            <p className="text-xs text-muted dark:text-gray-400">{isAr ? 'إجمالي العناصر' : 'Total Items'}</p>
          </GlassCard>
          <GlassCard delay={0.05}>
            <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
            <p className="text-xs text-muted dark:text-gray-400">{t('designItems.approved')}</p>
          </GlassCard>
          <GlassCard delay={0.1}>
            <p className="text-2xl font-bold text-amber-600">{stats.inReview}</p>
            <p className="text-xs text-muted dark:text-gray-400">{t('designItems.inReview')}</p>
          </GlassCard>
          <GlassCard delay={0.15}>
            <p className="text-2xl font-bold text-gray-500">{stats.draft}</p>
            <p className="text-xs text-muted dark:text-gray-400">{t('designItems.draft')}</p>
          </GlassCard>
        </div>

        {/* Filters + Add */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <FilterBar
              searchValue={search}
              onSearchChange={setSearch}
              filters={[
                { value: typeFilter, options: typeOptions, onChange: setTypeFilter, placeholder: t('designItems.filterByType') },
                { value: statusFilter, options: statusOptions, onChange: setStatusFilter, placeholder: t('designItems.filterByStatus') },
                { value: projectFilter, options: projectOptions, onChange: setProjectFilter, placeholder: t('designItems.filterByProject') },
              ]}
            />
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shrink-0">
            <Plus size={18} />
            {isAr ? 'عنصر جديد' : 'New Item'}
          </button>
        </div>

        {/* Create design item modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)}>
              <motion.div className="bg-white dark:bg-surface rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-ink dark:text-white">{isAr ? 'عنصر تصميم جديد' : 'New Design Item'}</h3>
                  <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><X size={18} className="text-muted" /></button>
                </div>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder={isAr ? 'العنوان' : 'Title'} className="w-full h-11 px-4 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-ink dark:text-white placeholder:text-muted outline-none focus:border-primary mb-3" autoFocus />
                <select value={newType} onChange={(e) => setNewType(e.target.value as DesignItemType)} className="w-full h-11 px-4 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-ink dark:text-white outline-none focus:border-primary mb-3 appearance-none">
                  {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{isAr ? v.labelAr : v.labelEn}</option>)}
                </select>
                <select value={newProjectId} onChange={(e) => setNewProjectId(e.target.value)} className="w-full h-11 px-4 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-ink dark:text-white outline-none focus:border-primary mb-4 appearance-none">
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

        {/* Edit modal */}
        <AnimatePresence>
          {editingItem && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingItem(null)}>
              <motion.div className="bg-white dark:bg-surface rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                <EditDesignItemForm item={editingItem} isAr={isAr} projects={projects} onClose={() => setEditingItem(null)} onSave={async (data) => { await updateDesignItem(editingItem.id, data); setEditingItem(null); }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState icon={Palette} title={t('designItems.noItems')} color="pink" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item, i) => (
              <DesignItemCard key={item.id} item={item} isAr={isAr} delay={0.05 + i * 0.05}
                onEdit={() => setEditingItem(item)}
                onDelete={async () => { if (confirm(isAr ? 'حذف هذا العنصر؟' : 'Delete this item?')) await deleteDesignItem(item.id); }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DesignItemCard({
  item,
  isAr,
  delay,
  onEdit,
  onDelete,
}: {
  item: { id: string; title: string; titleAr: string; type: DesignItemType; status: string; assigneeId: string; projectId: string; thumbnail: string; createdAt: string; updatedAt: string; version: number; comments: number };
  isAr: boolean;
  delay: number;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { t } = useTranslation();
  const { getTeamMember, getProject } = useDataStore();
  const assignee = getTeamMember(item.assigneeId);
  const project = getProject(item.projectId);
  const tc = typeConfig[item.type];

  return (
    <motion.div
      className="
        group rounded-[20px] overflow-hidden
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
      {/* Thumbnail area */}
      <div
        className="h-40 flex items-center justify-center relative"
        style={{
          background: `linear-gradient(135deg, ${tc.color}15, ${tc.color}08)`,
        }}
      >
        <span className="text-6xl select-none group-hover:scale-110 transition-transform duration-300">
          {item.thumbnail}
        </span>

        {/* Version badge */}
        <span className="absolute top-3 end-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-surface/80 text-ink dark:text-white backdrop-blur-sm">
          {t('designItems.version', { v: item.version })}
        </span>

        {/* Type badge */}
        <span
          className="absolute top-3 start-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: tc.color }}
        >
          {isAr ? tc.labelAr : tc.labelEn}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-semibold text-ink dark:text-white line-clamp-1">
            {isAr ? item.titleAr : item.title}
          </h4>
          <div className="flex items-center gap-1 shrink-0">
            <StatusBadge status={item.status} />
            {onEdit && <button onClick={onEdit} className="p-1 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"><Pencil size={12} /></button>}
            {onDelete && <button onClick={onDelete} className="p-1 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>}
          </div>
        </div>

        {/* Project */}
        {project && (
          <div className="flex items-center gap-1.5 mb-3">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <span className="text-xs text-muted dark:text-gray-400 truncate">
              {isAr ? project.nameAr : project.name}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted dark:text-gray-400">
          <div className="flex items-center gap-3">
            {assignee && (
              <div className="flex items-center gap-1">
                <span className="text-sm">{assignee.avatar}</span>
                <span className="hidden sm:inline truncate max-w-[80px]">
                  {isAr ? assignee.nameAr : assignee.name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MessageSquare size={12} />
              <span>{item.comments}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{item.updatedAt.slice(5)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import type { DesignItem, Project } from '../data/mockData';

const inputCls = 'w-full h-11 px-4 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-ink dark:text-white placeholder:text-muted outline-none focus:border-primary';

function EditDesignItemForm({ item, isAr, projects, onClose, onSave }: { item: DesignItem; isAr: boolean; projects: Project[]; onClose: () => void; onSave: (data: Partial<DesignItem>) => Promise<void> }) {
  const [title, setTitle] = useState(item.title);
  const [titleAr, setTitleAr] = useState(item.titleAr);
  const [type, setType] = useState(item.type);
  const [status, setStatus] = useState(item.status);
  const [projectId, setProjectId] = useState(item.projectId);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => { setSaving(true); await onSave({ title, titleAr, type, status, projectId }); setSaving(false); };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-ink dark:text-white">{isAr ? 'تعديل عنصر التصميم' : 'Edit Design Item'}</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><X size={18} className="text-muted" /></button>
      </div>
      <div className="space-y-3">
        <div><label className="block text-xs font-medium text-muted mb-1">{isAr ? 'العنوان (English)' : 'Title (English)'}</label><input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-xs font-medium text-muted mb-1">{isAr ? 'العنوان (عربي)' : 'Title (Arabic)'}</label><input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} className={inputCls} dir="rtl" /></div>
        <div><label className="block text-xs font-medium text-muted mb-1">{isAr ? 'النوع' : 'Type'}</label>
          <select value={type} onChange={(e) => setType(e.target.value as DesignItemType)} className={inputCls + ' appearance-none'}>
            {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{isAr ? v.labelAr : v.labelEn}</option>)}
          </select>
        </div>
        <div><label className="block text-xs font-medium text-muted mb-1">{isAr ? 'الحالة' : 'Status'}</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as DesignItem['status'])} className={inputCls + ' appearance-none'}>
            <option value="draft">{isAr ? 'مسودة' : 'Draft'}</option>
            <option value="in-review">{isAr ? 'قيد المراجعة' : 'In Review'}</option>
            <option value="approved">{isAr ? 'معتمد' : 'Approved'}</option>
            <option value="revision">{isAr ? 'تعديل' : 'Revision'}</option>
          </select>
        </div>
        <div><label className="block text-xs font-medium text-muted mb-1">{isAr ? 'المشروع' : 'Project'}</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputCls + ' appearance-none'}>
            {projects.map((p) => <option key={p.id} value={p.id}>{isAr ? p.nameAr : p.name}</option>)}
          </select>
        </div>
      </div>
      <button onClick={handleSave} disabled={saving || !title.trim()} className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 transition-colors mt-4">
        {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
      </button>
    </>
  );
}
