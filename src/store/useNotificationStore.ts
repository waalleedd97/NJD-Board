import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'task' | 'mention' | 'sprint' | 'system' | 'invite';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  time: string;
  timeAr: string;
  read: boolean;
  avatar?: string;
  link?: string;
}

const initialNotifications: Notification[] = [];

interface NotificationPrefs {
  email: boolean;
  push: boolean;
  taskReminders: boolean;
  sprintUpdates: boolean;
  teamActivity: boolean;
}

interface NotificationState {
  notifications: Notification[];
  isOpen: boolean;
  prefs: NotificationPrefs;
  unreadCount: number;
  togglePanel: () => void;
  closePanel: () => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  dismissNotification: (id: string) => void;
  togglePref: (key: keyof NotificationPrefs) => void;
}

function loadPrefs(): NotificationPrefs {
  const saved = localStorage.getItem('njd_notif_prefs');
  if (saved) {
    try { return JSON.parse(saved); } catch { /* fall through */ }
  }
  return { email: true, push: true, taskReminders: true, sprintUpdates: true, teamActivity: false };
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: initialNotifications,
  isOpen: false,
  prefs: loadPrefs(),
  get unreadCount() {
    return get().notifications.filter((n) => !n.read).length;
  },

  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
  closePanel: () => set({ isOpen: false }),

  markAsRead: (id: string) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  dismissNotification: (id: string) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),

  togglePref: (key: keyof NotificationPrefs) =>
    set((s) => {
      const next = { ...s.prefs, [key]: !s.prefs[key] };
      localStorage.setItem('njd_notif_prefs', JSON.stringify(next));
      return { prefs: next };
    }),
}));
