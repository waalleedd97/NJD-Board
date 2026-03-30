import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Mail,
  Phone,
  Calendar,
  X,
  Activity,
  UserPlus,
  Send,
  CheckCircle,
} from 'lucide-react';

import { GlassCard } from '../components/ui/GlassCard';
import { Icon3D } from '../components/icons/Icon3D';
import { FilterBar } from '../components/ui/FilterBar';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuthStore, useIsAdmin } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';
import type { TeamMember } from '../data/mockData';

const statusDot: Record<string, string> = {
  available: 'bg-emerald-400',
  busy: 'bg-amber-400',
  away: 'bg-gray-400',
};

const statusBg: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  busy: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  away: 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400',
};

export function Team() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  useAuthStore();
  const { teamMembers } = useDataStore();
  const isAdmin = useIsAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const statusOptions = [
    { value: 'all', labelEn: 'All Statuses', labelAr: 'جميع الحالات' },
    { value: 'available', labelEn: 'Available', labelAr: 'متاح' },
    { value: 'busy', labelEn: 'Busy', labelAr: 'مشغول' },
    { value: 'away', labelEn: 'Away', labelAr: 'غير متصل' },
  ];

  const filtered = teamMembers.filter((m) => {
    const name = isAr ? m.nameAr : m.name;
    const role = isAr ? m.roleAr : m.role;
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      role.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableCount = teamMembers.filter((m) => m.status === 'available').length;
  const busyCount = teamMembers.filter((m) => m.status === 'busy').length;
  const avgWorkload = teamMembers.length > 0
    ? Math.round(teamMembers.reduce((sum, m) => sum + m.workload, 0) / teamMembers.length)
    : 0;

  return (
    <div className="min-h-screen">


      <div className="p-6 space-y-6 max-w-[1400px]">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard delay={0}>
            <div className="flex items-center gap-3">
              <Icon3D icon={Users} color="green" size="sm" />
              <div>
                <p className="text-2xl font-bold text-ink dark:text-white">{teamMembers.length}</p>
                <p className="text-xs text-muted dark:text-gray-400">{t('team.members')}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard delay={0.05}>
            <div className="flex items-center gap-3">
              <Icon3D icon={Activity} color="purple" size="sm" />
              <div>
                <p className="text-2xl font-bold text-ink dark:text-white">{avgWorkload}%</p>
                <p className="text-xs text-muted dark:text-gray-400">
                  {isAr ? 'متوسط حمل العمل' : 'Avg Workload'}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard delay={0.1}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-sm font-bold text-ink dark:text-white">{availableCount}</span>
              </div>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-sm font-bold text-ink dark:text-white">{busyCount}</span>
              </div>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm font-bold text-ink dark:text-white">
                  {teamMembers.length - availableCount - busyCount}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Filter + Invite button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[300px]">
            <FilterBar
              searchValue={search}
              onSearchChange={setSearch}
              filters={[
                {
                  value: statusFilter,
                  options: statusOptions,
                  onChange: setStatusFilter,
                  placeholder: t('team.availability'),
                },
              ]}
            />
          </div>
          {isAdmin && (
            <motion.button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowInvite(true)}
            >
              <UserPlus size={16} />
              {isAr ? 'دعوة عضو' : 'Invite Member'}
            </motion.button>
          )}
        </div>

        {/* Team Grid */}
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title={t('team.noMembers')} color="green" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((member, i) => (
              <TeamCard
                key={member.id}
                member={member}
                isAr={isAr}
                delay={0.05 + i * 0.08}
                onClick={() => setSelectedMember(member)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <MemberDetailModal
            member={selectedMember}
            isAr={isAr}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <InviteModal isAr={isAr} onClose={() => setShowInvite(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function TeamCard({
  member,
  isAr,
  delay,
  onClick,
}: {
  member: TeamMember;
  isAr: boolean;
  delay: number;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const { tasks } = useDataStore();
  const memberTasks = tasks.filter((task) => task.assigneeId === member.id);
  const activeTasks = memberTasks.filter((task) => task.status !== 'done').length;

  return (
    <motion.div
      className="
        cursor-pointer rounded-[20px] p-5
        bg-white/80 dark:bg-surface/80
        backdrop-blur-xl
        border border-white/40 dark:border-white/5
        shadow-[0_4px_24px_rgba(0,0,0,0.06)]
        hover:shadow-[0_8px_40px_rgba(124,58,237,0.1)]
        transition-all duration-300
      "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      whileHover={{ y: -4 }}
      role="button"
      tabIndex={0}
      aria-label={isAr ? member.nameAr : member.name}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 flex items-center justify-center text-3xl">
            {member.avatar}
          </div>
          <span className={`absolute -bottom-0.5 -end-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-surface ${statusDot[member.status]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-ink dark:text-white truncate">
            {isAr ? member.nameAr : member.name}
          </h4>
          <p className="text-sm text-muted dark:text-gray-400">
            {isAr ? member.roleAr : member.role}
          </p>
          <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusBg[member.status]}`}>
            {t(`common.${member.status}`)}
          </span>
        </div>
      </div>

      <div className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
        <p className="text-[11px] text-muted dark:text-gray-500 mb-0.5">{t('team.currentTask')}</p>
        <p className="text-sm font-medium text-ink dark:text-white truncate">
          {isAr ? member.currentTaskAr : member.currentTask}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted dark:text-gray-400">{t('team.workload')}</span>
            <span className="font-medium text-ink dark:text-white">{member.workload}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                member.workload > 80 ? 'bg-red-400' : member.workload > 60 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${member.workload}%` }}
              transition={{ duration: 0.8, delay: delay + 0.2 }}
            />
          </div>
        </div>
        <div className="ms-4 text-center">
          <p className="text-lg font-bold text-ink dark:text-white">{activeTasks}</p>
          <p className="text-[10px] text-muted dark:text-gray-400">{isAr ? 'مهام نشطة' : 'active'}</p>
        </div>
      </div>
    </motion.div>
  );
}

function MemberDetailModal({
  member,
  isAr,
  onClose,
}: {
  member: TeamMember;
  isAr: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { tasks } = useDataStore();
  const memberTasks = tasks.filter((task) => task.assigneeId === member.id);
  const completedTasks = memberTasks.filter((task) => task.status === 'done').length;
  const activeTasks = memberTasks.filter((task) => task.status !== 'done').length;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? member.nameAr : member.name}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md rounded-2xl p-6 bg-white dark:bg-surface border border-gray-200/50 dark:border-white/5 shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 end-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" aria-label={t('common.close')}>
          <X size={18} className="text-muted" />
        </button>

        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 flex items-center justify-center text-4xl">
              {member.avatar}
            </div>
            <span className={`absolute -bottom-0.5 -end-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-surface ${statusDot[member.status]}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink dark:text-white">{isAr ? member.nameAr : member.name}</h2>
            <p className="text-sm text-muted dark:text-gray-400">{isAr ? member.roleAr : member.role}</p>
            <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBg[member.status]}`}>
              {t(`common.${member.status}`)}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-3 text-sm">
            <Mail size={16} className="text-muted shrink-0" />
            <span className="text-ink dark:text-white">{member.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone size={16} className="text-muted shrink-0" />
            <span className="text-ink dark:text-white" dir="ltr">{member.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar size={16} className="text-muted shrink-0" />
            <span className="text-ink dark:text-white">{t('team.joinDate')}: {member.joinDate}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-white/5">
            <p className="text-lg font-bold text-ink dark:text-white">{memberTasks.length}</p>
            <p className="text-[10px] text-muted dark:text-gray-400">{isAr ? 'إجمالي' : 'Total'}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-white/5">
            <p className="text-lg font-bold text-emerald-600">{completedTasks}</p>
            <p className="text-[10px] text-muted dark:text-gray-400">{isAr ? 'مكتملة' : 'Done'}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-white/5">
            <p className="text-lg font-bold text-blue-600">{activeTasks}</p>
            <p className="text-[10px] text-muted dark:text-gray-400">{isAr ? 'نشطة' : 'Active'}</p>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted dark:text-gray-400">{t('team.workload')}</span>
            <span className="font-bold text-ink dark:text-white">{member.workload}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                member.workload > 80 ? 'bg-red-400' : member.workload > 60 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${member.workload}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted dark:text-gray-400 mb-2">{t('team.skills')}</p>
          <div className="flex flex-wrap gap-2">
            {(isAr ? member.skillsAr : member.skills).map((skill) => (
              <span key={skill} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-night-accent">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InviteModal({ isAr, onClose }: { isAr: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'employee' | 'admin'>('employee');
  const [sent, setSent] = useState(false);
  const [invites, setInvites] = useState<{ email: string; role: string; status: string }[]>([]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setInvites((prev) => [
      ...prev,
      { email: email.trim(), role, status: 'pending' },
    ]);
    setEmail('');
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? 'دعوة عضو جديد' : 'Invite New Member'}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md rounded-2xl p-6 bg-white dark:bg-surface border border-gray-200/50 dark:border-white/5 shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 end-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" aria-label={t('common.close')}>
          <X size={18} className="text-muted" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <Icon3D icon={UserPlus} color="purple" size="md" />
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white">
              {isAr ? 'دعوة عضو جديد' : 'Invite Team Member'}
            </h2>
            <p className="text-xs text-muted dark:text-gray-400">
              {isAr ? 'أرسل دعوة عبر البريد الإلكتروني' : 'Send an invitation via email'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-ink dark:text-white mb-1.5">
              {isAr ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isAr ? 'name@example.com' : 'name@example.com'}
              className="w-full h-11 px-4 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary dark:focus:border-night-accent focus:ring-2 focus:ring-primary/20 text-ink dark:text-white placeholder:text-muted outline-none transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="invite-role" className="block text-sm font-medium text-ink dark:text-white mb-1.5">
              {isAr ? 'الدور' : 'Role'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('employee')}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  role === 'employee'
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary dark:text-night-accent'
                    : 'border-gray-200 dark:border-gray-700 text-muted hover:border-gray-300'
                }`}
              >
                {isAr ? 'موظف' : 'Employee'}
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  role === 'admin'
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary dark:text-night-accent'
                    : 'border-gray-200 dark:border-gray-700 text-muted hover:border-gray-300'
                }`}
              >
                {isAr ? 'مدير' : 'Admin'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!email.trim() || !email.includes('@')}
            className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {sent ? (
              <>
                <CheckCircle size={16} />
                {isAr ? 'تم الإرسال!' : 'Sent!'}
              </>
            ) : (
              <>
                <Send size={16} />
                {isAr ? 'إرسال الدعوة' : 'Send Invitation'}
              </>
            )}
          </button>
        </form>

        {/* Sent invites list */}
        {invites.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-200/50 dark:border-white/5">
            <p className="text-xs font-medium text-muted dark:text-gray-400 mb-3">
              {isAr ? 'الدعوات المرسلة' : 'Sent Invitations'} ({invites.length})
            </p>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {invites.map((inv, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-white/5">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail size={14} className="text-muted shrink-0" />
                    <span className="text-sm text-ink dark:text-white truncate">{inv.email}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:text-night-accent capitalize">
                      {inv.role === 'admin' ? (isAr ? 'مدير' : 'Admin') : (isAr ? 'موظف' : 'Employee')}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {isAr ? 'معلقة' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
