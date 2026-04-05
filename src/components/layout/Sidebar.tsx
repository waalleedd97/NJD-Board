import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Columns3,
  Palette,
  Timer,
  Users,
  Settings,
  Upload,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useSidebarStore } from '../../store/useSidebarStore';
import { useIsAdmin } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { Icon3D } from '../icons/Icon3D';

const navItems = [
  { path: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard', color: 'purple' },
  { path: '/projects', icon: FolderKanban, labelKey: 'nav.projects', color: 'blue' },
  { path: '/board', icon: Columns3, labelKey: 'nav.board', color: 'cyan', hasTree: true },
  { path: '/design-items', icon: Palette, labelKey: 'nav.designItems', color: 'pink' },
  { path: '/sprints', icon: Timer, labelKey: 'nav.sprints', color: 'amber' },
  { path: '/team', icon: Users, labelKey: 'nav.team', color: 'green', adminOnly: true },
  { path: '/import', icon: Upload, labelKey: 'nav.import', color: 'cyan', adminOnly: true },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings', color: 'gray' },
];

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed, toggleCollapse } = useSidebarStore();
  const isRTL = i18n.language === 'ar';
  const isAdmin = useIsAdmin();
  const { projects, sprints, tasks } = useDataStore();

  const boardOpen = location.pathname === '/board';

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  // Build flat board list: each sprint with its task count
  const boardList = sprints.map((sprint) => {
    const count = tasks.filter((t) => t.sprintId === sprint.id).length;
    return { ...sprint, count };
  });

  const activeSprint = new URLSearchParams(location.search).get('sprint');

  return (
    <motion.aside
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`
        fixed z-40
        bg-white/90 dark:bg-surface/90
        backdrop-blur-xl
        flex flex-col
        ${isRTL ? 'border-l' : 'border-r'} border-gray-200/50 dark:border-white/5
      `}
      style={{
        top: 'var(--njd-navbar-height, 64px)',
        height: 'calc(100dvh - var(--njd-navbar-height, 64px))',
        [isRTL ? 'right' : 'left']: 0,
      }}
      animate={{ width: isCollapsed ? 80 : 272 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const active = location.pathname === item.path && !item.hasTree;
            const isBoardActive = item.hasTree && location.pathname === '/board';
            const isBoard = item.hasTree;

            return (
              <li key={item.path}>
                {/* Nav link */}
                <Link
                  to={item.path}
                  onClick={(e) => {
                    if (isBoard) {
                      e.preventDefault();
                      navigate('/board');
                    }
                  }}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200
                    ${(active || isBoardActive)
                      ? 'bg-lavender dark:bg-primary/20 text-primary dark:text-night-accent font-semibold'
                      : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white'
                    }
                  `}
                >
                  {(active || isBoardActive) ? (
                    <Icon3D icon={item.icon} color={item.color} size="sm" />
                  ) : (
                    <item.icon size={20} className="shrink-0" />
                  )}

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm whitespace-nowrap flex-1"
                      >
                        {t(item.labelKey)}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Expand indicator for Board */}
                  {isBoard && !isCollapsed && (
                    <motion.div animate={{ rotate: boardOpen ? 0 : (isRTL ? 90 : -90) }} transition={{ duration: 0.15 }}>
                      <ChevronDown size={14} />
                    </motion.div>
                  )}

                  {/* Tooltip when collapsed */}
                  {isCollapsed && (
                    <div
                      className="pointer-events-none absolute opacity-0 group-hover:opacity-100 transition-opacity z-50"
                      style={{ [isRTL ? 'right' : 'left']: '100%', [isRTL ? 'marginRight' : 'marginLeft']: 8 }}
                    >
                      <div className="bg-ink text-white text-xs font-medium rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
                        {t(item.labelKey)}
                      </div>
                    </div>
                  )}
                </Link>

                {/* ── Board list (flat, like HacknPlan) ── */}
                {isBoard && !isCollapsed && (
                  <AnimatePresence>
                    {boardOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1 py-1 border-t border-gray-200/30 dark:border-white/5">
                          {boardList.map((board) => {
                            const isActive = activeSprint === board.id;
                            return (
                              <button
                                key={board.id}
                                onClick={() => {
                                  const proj = projects.find((p) => tasks.some((t) => t.sprintId === board.id && t.projectId === p.id));
                                  navigate(`/board?project=${proj?.id || 'all'}&sprint=${board.id}`);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors
                                  ${isActive
                                    ? 'text-primary dark:text-night-accent font-semibold bg-primary/5 dark:bg-primary/10'
                                    : 'text-ink/70 dark:text-gray-300 hover:text-ink dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                  }
                                `}
                                style={{ paddingInlineStart: 20 }}
                              >
                                <Layers size={14} className="shrink-0 opacity-60" />
                                <span className="flex-1 text-start truncate">
                                  {isRTL ? board.nameAr : board.name}
                                  {board.count > 0 && <span className="opacity-50"> ({board.count})</span>}
                                </span>
                                <ChevronRight size={12} className="shrink-0 opacity-30" />
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Bottom controls ──────────────── */}
      <div className="px-3 pb-4 pt-3 border-t border-gray-200/50 dark:border-white/5 shrink-0">
        <SidebarButton
          icon={
            isCollapsed
              ? isRTL ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />
              : isRTL ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />
          }
          collapsed={isCollapsed}
          onClick={toggleCollapse}
        />
      </div>
    </motion.aside>
  );
}

function SidebarButton({ icon, label, collapsed, onClick }: { icon: React.ReactNode; label?: string; collapsed: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white transition-colors">
      {icon}
      <AnimatePresence>
        {!collapsed && label && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm whitespace-nowrap">{label}</motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
