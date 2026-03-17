import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Palette, MessageSquare, Clock } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FilterBar } from '../components/ui/FilterBar';
import { EmptyState } from '../components/ui/EmptyState';
import { designItems, projects, getTeamMember, getProject } from '../data/mockData';
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
  const [projectFilter, setProjectFilter] = useState('all');

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

  return (
    <div className="min-h-screen">
      <TopBar title={t('designItems.title')} />

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

        {/* Filters */}
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              value: typeFilter,
              options: typeOptions,
              onChange: setTypeFilter,
              placeholder: t('designItems.filterByType'),
            },
            {
              value: statusFilter,
              options: statusOptions,
              onChange: setStatusFilter,
              placeholder: t('designItems.filterByStatus'),
            },
            {
              value: projectFilter,
              options: projectOptions,
              onChange: setProjectFilter,
              placeholder: t('designItems.filterByProject'),
            },
          ]}
        />

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState icon={Palette} title={t('designItems.noItems')} color="pink" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item, i) => (
              <DesignItemCard key={item.id} item={item} isAr={isAr} delay={0.05 + i * 0.05} />
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
}: {
  item: typeof designItems[number];
  isAr: boolean;
  delay: number;
}) {
  const { t } = useTranslation();
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
          <StatusBadge status={item.status} className="shrink-0" />
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
