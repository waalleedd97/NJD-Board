import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, User } from 'lucide-react';

// Category icons + colors (same as Board.tsx)
const CATEGORIES: { name: string; icon: string; color: string }[] = [
  { name: 'Programming', icon: '💻', color: '#7C3AED' },
  { name: '3D (General)', icon: '💎', color: '#3B82F6' },
  { name: '3D Environment & Prop Art', icon: '🖼️', color: '#22C55E' },
  { name: '3D Vehicle Art', icon: '🚗', color: '#15803D' },
  { name: 'Optimization', icon: '⚡', color: '#EAB308' },
  { name: 'Game Design', icon: '🎮', color: '#06B6D4' },
  { name: 'UX/UI Design', icon: '🖥️', color: '#14B8A6' },
  { name: 'Graphic Design', icon: '🎨', color: '#EC4899' },
  { name: 'Writing', icon: '✍️', color: '#F97316' },
  { name: 'Marketing', icon: '📣', color: '#EF4444' },
  { name: 'Live-Ops', icon: '🔴', color: '#6366F1' },
  { name: 'Testing', icon: '🧪', color: '#F59E0B' },
  { name: 'Meetings', icon: '📅', color: '#6B7280' },
  { name: 'Project Management', icon: '📌', color: '#475569' },
  { name: 'Bug', icon: '🐛', color: '#DC2626' },
];

interface Props {
  tasks: { tags: string[]; assigneeId: string }[];
  members: { id: string; name: string; nameAr: string; avatar: string }[];
  selectedCategory: string;
  selectedMember: string;
  onCategoryChange: (cat: string) => void;
  onMemberChange: (id: string) => void;
}

export function BoardFilterPanel({ tasks, members, selectedCategory, selectedMember, onCategoryChange, onMemberChange }: Props) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [mode, setMode] = useState<'category' | 'user'>('category');

  // Build category counts from tasks
  const categoryCounts = new Map<string, number>();
  tasks.forEach((t) => {
    const cat = t.tags?.[0];
    if (cat) categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
  });

  // Build user counts
  const userCounts = new Map<string, number>();
  tasks.forEach((t) => {
    if (t.assigneeId) userCounts.set(t.assigneeId, (userCounts.get(t.assigneeId) || 0) + 1);
  });

  // Sort categories by count desc
  const sortedCategories = CATEGORIES
    .filter((c) => categoryCounts.has(c.name))
    .sort((a, b) => (categoryCounts.get(b.name) || 0) - (categoryCounts.get(a.name) || 0));

  return (
    <div
      className="shrink-0 flex flex-col bg-white/80 dark:bg-surface/80 backdrop-blur-xl overflow-hidden"
      style={{
        width: 200,
        height: 'calc(100dvh - var(--njd-navbar-height, 64px))',
        position: 'sticky',
        top: 'var(--njd-navbar-height, 64px)',
      }}
    >
      {/* Mode toggle */}
      <div className="p-2 shrink-0">
        <div className="flex rounded-xl bg-gray-100 dark:bg-white/5 p-1">
          <button
            onClick={() => { setMode('category'); onMemberChange('all'); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${mode === 'category' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-ink dark:hover:text-white'}`}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => { setMode('user'); onCategoryChange('all'); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${mode === 'user' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-ink dark:hover:text-white'}`}
          >
            <User size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {mode === 'category' ? (
          <div className="space-y-0.5">
            {/* All Items */}
            <button
              onClick={() => onCategoryChange('all')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${selectedCategory === 'all' ? 'bg-primary text-white' : 'text-ink/70 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
            >
              <LayoutGrid size={14} />
              <span className="flex-1 text-start truncate">{isAr ? 'جميع العناصر' : 'All Items'}</span>
            </button>

            {sortedCategories.map((cat) => {
              const count = categoryCounts.get(cat.name) || 0;
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => onCategoryChange(cat.name)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${isActive ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-night-accent font-semibold' : 'text-ink/70 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                  <span className="text-base shrink-0">{cat.icon}</span>
                  <span className="flex-1 text-start truncate">{cat.name}</span>
                  <span className="text-[10px] opacity-50">{count}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-0.5">
            {/* All Members */}
            <button
              onClick={() => onMemberChange('all')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${selectedMember === 'all' ? 'bg-primary text-white' : 'text-ink/70 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
            >
              <User size={14} />
              <span className="flex-1 text-start truncate">{isAr ? 'جميع الأعضاء' : 'All Members'}</span>
            </button>

            {members.map((m) => {
              const count = userCounts.get(m.id) || 0;
              const isActive = selectedMember === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onMemberChange(m.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${isActive ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-night-accent font-semibold' : 'text-ink/70 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                  <span className="text-base shrink-0">{m.avatar}</span>
                  <span className="flex-1 text-start truncate">{isAr ? m.nameAr : m.name}</span>
                  {count > 0 && <span className="text-[10px] opacity-50">{count}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
