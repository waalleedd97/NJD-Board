import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';
import { useSidebarStore } from '../../store/useSidebarStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { NotificationBell } from '../ui/NotificationBell';
import { supabase } from '../../lib/supabase';

export function AppLayout() {
  const { isCollapsed } = useSidebarStore();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const sidebarWidth = isCollapsed ? 80 : 272;
  const navbarRef = useRef<Element | null>(null);
  const setTheme = useThemeStore((s) => s.setTheme);
  const user = useAuthStore((s) => s.user);
  const fetchAll = useDataStore((s) => s.fetchAll);
  const notifications = useNotificationStore((s) => s.notifications);
  const togglePanel = useNotificationStore((s) => s.togglePanel);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch data from Supabase on mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Wire up njd-navbar custom events
  useEffect(() => {
    const navbar = document.querySelector('njd-navbar');
    if (!navbar) return;
    navbarRef.current = navbar;

    const handleLogout = () => { supabase.auth.signOut(); };

    const handleLangChange = (e: Event) => {
      const lang = (e as CustomEvent).detail?.lang;
      if (lang && (lang === 'ar' || lang === 'en')) {
        i18n.changeLanguage(lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      }
    };

    const handleThemeChange = (e: Event) => {
      const theme = (e as CustomEvent).detail?.theme;
      if (theme === 'dark' || theme === 'light') setTheme(theme === 'dark');
    };

    const handleNotificationClick = () => { togglePanel(); };

    navbar.addEventListener('njd-logout', handleLogout);
    navbar.addEventListener('njd-lang-change', handleLangChange);
    navbar.addEventListener('njd-theme-change', handleThemeChange);
    navbar.addEventListener('njd-notification-click', handleNotificationClick);

    return () => {
      navbar.removeEventListener('njd-logout', handleLogout);
      navbar.removeEventListener('njd-lang-change', handleLangChange);
      navbar.removeEventListener('njd-theme-change', handleThemeChange);
      navbar.removeEventListener('njd-notification-click', handleNotificationClick);
    };
  }, [i18n, setTheme, togglePanel]);

  // Keep navbar attributes in sync
  useEffect(() => {
    const navbar = navbarRef.current ?? document.querySelector('njd-navbar');
    if (navbar) {
      navbar.setAttribute('lang', i18n.language);
      navbar.setAttribute('notification-count', String(unreadCount));
      if (user) {
        navbar.setAttribute('user-name', i18n.language === 'ar' ? user.nameAr : user.name);
      }
    }
  }, [i18n.language, user, unreadCount]);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      className="min-h-screen bg-white dark:bg-night bg-pattern"
    >
      {/* logo="/njd-logo.png" overrides the navbar's default absolute Landing URL so the logo loads same-origin. */}
      {/* @ts-expect-error njd-navbar is a web component */}
      <njd-navbar lang={i18n.language} app="board" logo="/njd-logo.png" user-name={user ? (isRTL ? user.nameAr : user.name) : ''} notification-count={unreadCount} />

      {/* Notification dropdown — positioned relative to navbar */}
      <NotificationBell />

      <Sidebar />
      <div
        className="transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          ...(isRTL ? { marginRight: sidebarWidth } : { marginLeft: sidebarWidth }),
          minHeight: 'calc(100dvh - var(--njd-navbar-height, 64px))',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
