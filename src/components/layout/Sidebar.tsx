import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { useSidebarStore } from '../../store/useSidebarStore';
import { useIsAdmin } from '../../store/useAuthStore';
import { Icon3D } from '../icons/Icon3D';
import { NotificationBell } from '../ui/NotificationBell';

const navItems = [
  { path: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard', color: 'purple' },
  { path: '/projects', icon: FolderKanban, labelKey: 'nav.projects', color: 'blue' },
  { path: '/board', icon: Columns3, labelKey: 'nav.board', color: 'cyan' },
  { path: '/design-items', icon: Palette, labelKey: 'nav.designItems', color: 'pink' },
  { path: '/sprints', icon: Timer, labelKey: 'nav.sprints', color: 'amber' },
  { path: '/team', icon: Users, labelKey: 'nav.team', color: 'green', adminOnly: true },
  { path: '/import', icon: Upload, labelKey: 'nav.import', color: 'cyan', adminOnly: true },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings', color: 'gray' },
];

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isCollapsed, toggleCollapse } = useSidebarStore();
  const isRTL = i18n.language === 'ar';
  const isAdmin = useIsAdmin();

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

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
      {/* ── Notification bell ──────────────── */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && <span className="text-xs font-medium text-muted dark:text-gray-500 uppercase tracking-wide">{isRTL ? 'القائمة' : 'Menu'}</span>}
          <NotificationBell />
        </div>
      </div>

      {/* ── Nav ──────────────────────────── */}
      <nav className="flex-1 py-2 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl
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
                        className="text-sm whitespace-nowrap"
                      >
                        {t(item.labelKey)}
                      </motion.span>
                    )}
                  </AnimatePresence>

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
