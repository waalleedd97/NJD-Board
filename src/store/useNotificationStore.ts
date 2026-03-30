import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  type: 'task' | 'mention' | 'sprint' | 'system' | 'invite';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  read: boolean;
  link?: string;
  created_at: string;
}

export interface NotificationPrefs {
  email_notifications: boolean;
  push_notifications: boolean;
  task_reminders: boolean;
  sprint_updates: boolean;
  team_activity: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  email_notifications: true,
  push_notifications: true,
  task_reminders: true,
  sprint_updates: true,
  team_activity: false,
};

interface NotificationState {
  notifications: Notification[];
  isOpen: boolean;
  prefs: NotificationPrefs;
  prefsLoaded: boolean;

  // Actions
  init: (userId: string) => Promise<void>;
  togglePanel: () => void;
  closePanel: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  loadPrefs: (userId: string) => Promise<void>;
  updatePref: (userId: string, key: keyof NotificationPrefs, value: boolean) => Promise<void>;
  addNotification: (n: Notification) => void;
}

function mapRow(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    type: (row.type as Notification['type']) || 'system',
    title: (row.title_en as string) || '',
    titleAr: (row.title_ar as string) || '',
    message: (row.body_en as string) || '',
    messageAr: (row.body_ar as string) || '',
    read: (row.is_read as boolean) ?? false,
    link: (row.link as string) || undefined,
    created_at: (row.created_at as string) || '',
  };
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isOpen: false,
  prefs: DEFAULT_PREFS,
  prefsLoaded: false,

  init: async (userId) => {
    // Fetch notifications
    const { data } = await supabase
      .from('notifications' as never)
      .select('*')
      .eq('user_id', userId)
      .eq('app_name', 'board')
      .order('created_at', { ascending: false })
      .limit(50) as { data: Record<string, unknown>[] | null };

    if (data) {
      set({ notifications: data.map(mapRow) });
    }

    // Subscribe to realtime inserts
    supabase
      .channel('notifications-board')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const n = mapRow(payload.new as Record<string, unknown>);
        if ((payload.new as Record<string, unknown>).app_name !== 'board') return;
        get().addNotification(n);

        // Browser notification if page is hidden
        if (document.hidden && Notification.permission === 'granted') {
          const lang = document.documentElement.lang || 'ar';
          new Notification(lang === 'ar' ? n.titleAr : n.title, {
            body: lang === 'ar' ? n.messageAr : n.message,
            icon: '/njd-logo.png',
          });
        }
      })
      .subscribe();

    // Load prefs
    await get().loadPrefs(userId);
  },

  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
  closePanel: () => set({ isOpen: false }),

  addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),

  markAsRead: async (id) => {
    set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) }));
    await supabase.from('notifications' as never).update({ is_read: true } as never).eq('id', id);
  },

  markAllRead: async () => {
    const unread = get().notifications.filter((n) => !n.read).map((n) => n.id);
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    for (const id of unread) {
      await supabase.from('notifications' as never).update({ is_read: true } as never).eq('id', id);
    }
  },

  dismissNotification: async (id) => {
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
    await supabase.from('notifications' as never).delete().eq('id', id);
  },

  loadPrefs: async (userId) => {
    const { data } = await supabase
      .from('notification_preferences' as never)
      .select('*')
      .eq('user_id', userId)
      .eq('app_name', 'board')
      .single() as { data: Record<string, unknown> | null };

    if (data) {
      set({
        prefs: {
          email_notifications: (data.email_notifications as boolean) ?? true,
          push_notifications: (data.push_notifications as boolean) ?? true,
          task_reminders: (data.task_reminders as boolean) ?? true,
          sprint_updates: (data.sprint_updates as boolean) ?? true,
          team_activity: (data.team_activity as boolean) ?? false,
        },
        prefsLoaded: true,
      });
    } else {
      // Create default row
      await supabase.from('notification_preferences' as never).insert({
        user_id: userId, app_name: 'board', ...DEFAULT_PREFS,
      } as never);
      set({ prefs: DEFAULT_PREFS, prefsLoaded: true });
    }
  },

  updatePref: async (userId, key, value) => {
    set((s) => ({ prefs: { ...s.prefs, [key]: value } }));
    await supabase
      .from('notification_preferences' as never)
      .update({ [key]: value } as never)
      .eq('user_id', userId)
      .eq('app_name', 'board');
  },
}));

// ── Utility: create a notification ──

export async function createNotification(params: {
  userId: string;
  appName?: string;
  type: Notification['type'];
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  link?: string;
}) {
  await supabase.from('notifications' as never).insert({
    user_id: params.userId,
    app_name: params.appName ?? 'board',
    type: params.type,
    title_ar: params.titleAr,
    title_en: params.titleEn,
    body_ar: params.bodyAr,
    body_en: params.bodyEn,
    link: params.link ?? null,
    is_read: false,
  } as never);
}
