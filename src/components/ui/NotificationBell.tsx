import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const TYPE_ICONS: Record<string, string> = {
  task: '📋', mention: '💬', sprint: '🏃', system: '⚙️', invite: '✉️',
};

function timeAgo(dateStr: string, isAr: boolean): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const mins = Math.floor((now - then) / 60000);
  if (mins < 1) return isAr ? 'الآن' : 'just now';
  if (mins < 60) return isAr ? `منذ ${mins} د` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return isAr ? `منذ ${hrs} س` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return isAr ? `منذ ${days} ي` : `${days}d ago`;
}

export function NotificationBell() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { notifications, isOpen, togglePanel, closePanel, markAsRead, markAllRead, dismissNotification, init } = useNotificationStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Init notifications on mount
  useEffect(() => {
    if (user?.id) init(user.id);
  }, [user?.id, init]);

  // Request push permission if enabled
  useEffect(() => {
    const prefs = useNotificationStore.getState().prefs;
    if (prefs.push_notifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) closePanel();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handle), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handle); };
  }, [isOpen, closePanel]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, closePanel]);

  const handleClick = (n: typeof notifications[0]) => {
    markAsRead(n.id);
    if (n.link) { navigate(n.link); closePanel(); }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={togglePanel}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        aria-label={isAr ? 'الإشعارات' : 'Notifications'}
      >
        <Bell size={20} className="text-muted dark:text-gray-400" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full mt-2 w-[360px] max-h-[420px] rounded-2xl overflow-hidden bg-white dark:bg-surface border border-gray-200/50 dark:border-white/10 shadow-2xl z-50"
            style={{ [isAr ? 'right' : 'left']: 0 }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50 dark:border-white/5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-ink dark:text-white">{isAr ? 'الإشعارات' : 'Notifications'}</h3>
                {unreadCount > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" title={isAr ? 'تحديد الكل كمقروء' : 'Mark all read'}>
                    <CheckCheck size={14} className="text-muted" />
                  </button>
                )}
                <button onClick={closePanel} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  <X size={14} className="text-muted" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[360px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell size={32} className="text-muted dark:text-gray-600 mb-3" />
                  <p className="text-sm text-muted dark:text-gray-500">{isAr ? 'لا توجد إشعارات' : 'No notifications'}</p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <motion.div
                    key={n.id}
                    className={`group flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/[0.03] last:border-0 ${!n.read ? 'bg-primary/[0.03] dark:bg-primary/[0.05]' : ''}`}
                    initial={{ opacity: 0, x: isAr ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => handleClick(n)}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink dark:text-white line-clamp-1">{isAr ? n.titleAr : n.title}</p>
                      <p className="text-xs text-muted dark:text-gray-400 mt-0.5 line-clamp-2">{isAr ? n.messageAr : n.message}</p>
                      <p className="text-[10px] text-muted dark:text-gray-500 mt-1">{timeAgo(n.created_at, isAr)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.read && (
                        <button onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title={isAr ? 'تحديد كمقروء' : 'Mark read'}>
                          <Check size={12} className="text-muted" />
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" title={isAr ? 'حذف' : 'Dismiss'}>
                        <Trash2 size={12} className="text-muted" />
                      </button>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
