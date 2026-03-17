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
  Moon,
  Sun,
  Languages,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { useSidebarStore } from '../../store/useSidebarStore';
import { Icon3D } from '../icons/Icon3D';

const navItems = [
  { path: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard', color: 'purple' },
  { path: '/projects', icon: FolderKanban, labelKey: 'nav.projects', color: 'blue' },
  { path: '/board', icon: Columns3, labelKey: 'nav.board', color: 'cyan' },
  { path: '/design-items', icon: Palette, labelKey: 'nav.designItems', color: 'pink' },
  { path: '/sprints', icon: Timer, labelKey: 'nav.sprints', color: 'amber' },
  { path: '/team', icon: Users, labelKey: 'nav.team', color: 'green' },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings', color: 'gray' },
];

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isDark, toggleTheme } = useThemeStore();
  const { isCollapsed, toggleCollapse } = useSidebarStore();
  const isRTL = i18n.language === 'ar';

  const toggleLanguage = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
    localStorage.setItem('i18nextLng', next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <motion.aside
      className="
        fixed top-0 start-0 h-screen z-40
        bg-white/90 dark:bg-surface/90
        backdrop-blur-xl
        border-e border-gray-200/50 dark:border-white/5
        flex flex-col
      "
      animate={{ width: isCollapsed ? 80 : 272 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* ── Logo ─────────────────────────── */}
      <div className="flex items-center gap-3 px-5 h-[72px] border-b border-gray-200/50 dark:border-white/5 shrink-0">
        <motion.div
          className="flex items-center justify-center w-10 h-10 shrink-0"
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <img src="/njd-logo.png" alt="NJD Games" className="w-10 h-10 object-contain" />
        </motion.div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="font-bold text-lg text-ink dark:text-white whitespace-nowrap"
            >
              NJD Board
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav ──────────────────────────── */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
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
                    <div className="pointer-events-none absolute start-full ms-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
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
      <div className="px-3 pb-4 pt-3 space-y-1 border-t border-gray-200/50 dark:border-white/5 shrink-0">
        <SidebarButton
          icon={isDark ? <Sun size={20} /> : <Moon size={20} />}
          label={isDark ? t('common.lightMode') : t('common.darkMode')}
          collapsed={isCollapsed}
          onClick={toggleTheme}
        />
        <SidebarButton
          icon={<Languages size={20} />}
          label={i18n.language === 'ar' ? 'English' : 'عربي'}
          collapsed={isCollapsed}
          onClick={toggleLanguage}
        />
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
