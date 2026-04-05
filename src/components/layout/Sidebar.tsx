import { useState } from 'react';
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
  const { projects, sprints } = useDataStore();

  const [boardTreeOpen, setBoardTreeOpen] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const handleSprintClick = (projectId: string, sprintId: string) => {
    navigate(`/board?project=${projectId}&sprint=${sprintId}`);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/board?project=${projectId}`);
  };

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
      {/* ── Nav ──────────────────────────── */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const active = location.pathname === item.path;
            const isBoard = item.hasTree;

            return (
              <li key={item.path}>
                {/* Nav link */}
                <div className="flex items-center">
                  <Link
                    to={item.path}
                    className={`
                      group flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl
                      transition-all duration-200
                      ${active
                        ? 'bg-lavender dark:bg-primary/20 text-primary dark:text-night-accent font-semibold'
                        : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white'
                      }
                    `}
                  >
                    {active ? (
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

                    {/* Expand arrow for Board */}
                    {isBoard && !isCollapsed && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBoardTreeOpen(!boardTreeOpen); }}
                        className="p-0.5 rounded hover:bg-white/10 transition-colors"
                      >
                        <motion.div animate={{ rotate: boardTreeOpen ? (isRTL ? 90 : 0) : (isRTL ? 0 : -90) }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={14} />
                        </motion.div>
                      </button>
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
                </div>

                {/* ── Board tree: Project → Sprints ── */}
                {isBoard && !isCollapsed && (
                  <AnimatePresence>
                    {boardTreeOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1 space-y-0.5">
                          {projects.map((project) => {
                            const linkedSprints = sprints.filter((s) =>
                              useDataStore.getState().tasks.some((t) => t.sprintId === s.id && t.projectId === project.id)
                            );
                            const isExpanded = expandedProject === project.id;

                            return (
                              <div key={project.id}>
                                {/* Project level */}
                                <button
                                  onClick={() => {
                                    setExpandedProject(isExpanded ? null : project.id);
                                    handleProjectClick(project.id);
                                  }}
                                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors
                                    ${isExpanded ? 'text-primary dark:text-night-accent bg-primary/5 dark:bg-primary/10' : 'text-muted hover:text-ink dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}
                                  `}
                                  style={{ paddingInlineStart: 36 }}
                                >
                                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                                  <span className="flex-1 text-start truncate font-medium">{isRTL ? project.nameAr : project.name}</span>
                                  <motion.div animate={{ rotate: isExpanded ? 0 : (isRTL ? 0 : -90) }} transition={{ duration: 0.15 }}>
                                    <ChevronDown size={12} />
                                  </motion.div>
                                </button>

                                {/* Sprint level */}
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="space-y-0.5 mt-0.5">
                                        {linkedSprints.length > 0 ? linkedSprints.map((sprint) => {
                                          const sprintActive = new URLSearchParams(location.search).get('sprint') === sprint.id;
                                          return (
                                            <button
                                              key={sprint.id}
                                              onClick={() => handleSprintClick(project.id, sprint.id)}
                                              className={`w-full text-start px-3 py-1.5 rounded-lg text-[11px] transition-colors truncate
                                                ${sprintActive ? 'text-primary dark:text-night-accent font-semibold bg-primary/10 dark:bg-primary/15' : 'text-muted hover:text-ink dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}
                                              `}
                                              style={{ paddingInlineStart: 52 }}
                                            >
                                              <span className="flex items-center gap-1.5">
                                                <Timer size={10} className="shrink-0 opacity-60" />
                                                {isRTL ? sprint.nameAr : sprint.name}
                                              </span>
                                            </button>
                                          );
                                        }) : (
                                          <p className="text-[10px] text-muted px-3 py-1" style={{ paddingInlineStart: 52 }}>
                                            {isRTL ? 'لا يوجد سبرنتات' : 'No sprints'}
                                          </p>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
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

/* ── Helper ────────────────────────────── */
function SidebarButton({
  icon,
  label,
  collapsed,
  onClick,
}: {
  icon: React.ReactNode;
  label?: string;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white transition-colors"
    >
      {icon}
      <AnimatePresence>
        {!collapsed && label && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
