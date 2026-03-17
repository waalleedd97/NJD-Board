import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, Bell, LogOut } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { NotificationPanel } from '../ui/NotificationPanel';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user, logout } = useAuthStore();
  const { notifications, isOpen, togglePanel } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ⌘K / Ctrl+K search shortcut placeholder
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search');
        if (searchInput) searchInput.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <motion.header
      className="
        sticky top-0 z-30 h-[72px]
        bg-white/80 dark:bg-night/80
        backdrop-blur-xl
        border-b border-gray-200/50 dark:border-white/5
        flex items-center justify-between
        px-6
      "
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-xl font-bold text-ink dark:text-white">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search
            size={18}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            id="global-search"
            type="text"
            placeholder={t('common.search')}
            aria-label={isAr ? 'البحث في المنصة' : 'Search the platform'}
            className="
              w-64 h-10 ps-10 pe-12
              rounded-xl
              bg-gray-100 dark:bg-white/5
              border border-transparent
              focus:border-primary dark:focus:border-night-accent
              focus:bg-white dark:focus:bg-white/10
              text-sm text-ink dark:text-white
              placeholder:text-muted
              outline-none transition-all duration-200
            "
          />
          <kbd className="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] text-muted bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={togglePanel}
            className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label={`${t('common.notifications')}${unreadCount > 0 ? ` (${unreadCount} ${isAr ? 'غير مقروءة' : 'unread'})` : ''}`}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <Bell size={20} className="text-muted" />
            {unreadCount > 0 && (
              <motion.span
                className="absolute top-1.5 end-1.5 min-w-[18px] h-[18px] rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center px-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                {unreadCount}
              </motion.span>
            )}
          </button>
          <NotificationPanel />
        </div>

        {/* User menu */}
        {user && (
          <div className="flex items-center gap-2 ps-2 border-s border-gray-200/50 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-lg">{user.avatar}</span>
              <div className="hidden md:block">
                <p className="text-xs font-medium text-ink dark:text-white leading-tight">
                  {isAr ? user.nameAr : user.name}
                </p>
                <p className="text-[10px] text-muted dark:text-gray-400 capitalize">
                  {user.role === 'admin' ? (isAr ? 'مدير النظام' : 'System Admin') : (isAr ? 'موظف' : 'Employee')}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              aria-label={isAr ? 'تسجيل الخروج' : 'Sign out'}
              title={isAr ? 'تسجيل الخروج' : 'Sign out'}
            >
              <LogOut size={16} className="text-muted" />
            </button>
          </div>
        )}
      </div>
    </motion.header>
  );
}
