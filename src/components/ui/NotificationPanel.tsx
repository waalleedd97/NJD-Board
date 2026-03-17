import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import type { Notification } from '../../store/useNotificationStore';
import { useNavigate } from 'react-router-dom';

const typeColors: Record<string, string> = {
  task: 'bg-blue-500',
  mention: 'bg-purple-500',
  sprint: 'bg-amber-500',
  system: 'bg-emerald-500',
  invite: 'bg-pink-500',
};

export function NotificationPanel() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, isOpen, closePanel, markAsRead, markAllRead, dismissNotification } =
    useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePanel();
      }
    };
    // Delay to avoid immediate close from the bell click
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, closePanel]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closePanel]);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      closePanel();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          className="
            absolute top-full end-0 mt-2
            w-[380px] max-h-[500px]
            rounded-2xl overflow-hidden
            bg-white dark:bg-surface
            border border-gray-200/50 dark:border-white/10
            shadow-2xl shadow-black/10 dark:shadow-black/40
            z-50
          "
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50 dark:border-white/5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-ink dark:text-white">
                {t('common.notifications')}
              </h3>
              {unreadCount > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  title={isAr ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                  aria-label={isAr ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                >
                  <CheckCheck size={16} className="text-muted" />
                </button>
              )}
              <button
                onClick={closePanel}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                aria-label={t('common.close')}
              >
                <X size={16} className="text-muted" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto max-h-[420px]">
            {notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted dark:text-gray-500">
                {isAr ? 'لا توجد إشعارات' : 'No notifications'}
              </div>
            ) : (
              notifications.map((notification, i) => (
                <motion.div
                  key={notification.id}
                  className={`
                    group flex items-start gap-3 px-4 py-3 cursor-pointer
                    hover:bg-gray-50 dark:hover:bg-white/5 transition-colors
                    border-b border-gray-100 dark:border-white/[0.03] last:border-0
                    ${!notification.read ? 'bg-primary/[0.03] dark:bg-primary/[0.05]' : ''}
                  `}
                  initial={{ opacity: 0, x: isAr ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Avatar + type indicator */}
                  <div className="relative shrink-0 mt-0.5">
                    <span className="text-xl">{notification.avatar}</span>
                    <span className={`absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-surface ${typeColors[notification.type]}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink dark:text-white line-clamp-1">
                      {isAr ? notification.titleAr : notification.title}
                    </p>
                    <p className="text-xs text-muted dark:text-gray-400 mt-0.5 line-clamp-2">
                      {isAr ? notification.messageAr : notification.message}
                    </p>
                    <p className="text-[10px] text-muted dark:text-gray-500 mt-1">
                      {isAr ? notification.timeAr : notification.time}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        title={isAr ? 'تحديد كمقروء' : 'Mark as read'}
                        aria-label={isAr ? 'تحديد كمقروء' : 'Mark as read'}
                      >
                        <Check size={12} className="text-muted" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notification.id);
                      }}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                      title={isAr ? 'حذف' : 'Dismiss'}
                      aria-label={isAr ? 'حذف' : 'Dismiss'}
                    >
                      <Trash2 size={12} className="text-muted" />
                    </button>
                  </div>

                  {/* Unread dot */}
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
