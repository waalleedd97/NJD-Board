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

const initialNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'task',
    title: 'Task Completed',
    titleAr: 'تم إكمال المهمة',
    message: 'Waleed completed "Fix drift physics engine"',
    messageAr: 'أكمل وليد مهمة "إصلاح محرك فيزياء الانجراف"',
    time: '5 min ago',
    timeAr: 'منذ ٥ دقائق',
    read: false,
    avatar: '\u{1F468}\u{200D}\u{1F4BB}',
    link: '/board',
  },
  {
    id: 'n2',
    type: 'mention',
    title: 'You were mentioned',
    titleAr: 'تمت الإشارة إليك',
    message: 'Layla mentioned you in "Multiplayer sync issues"',
    messageAr: 'أشارت إليك ليلى في "مشاكل مزامنة اللعب الجماعي"',
    time: '15 min ago',
    timeAr: 'منذ ١٥ دقيقة',
    read: false,
    avatar: '\u{1F50D}',
    link: '/board',
  },
  {
    id: 'n3',
    type: 'sprint',
    title: 'Sprint Update',
    titleAr: 'تحديث السبرينت',
    message: 'Sprint 5 is 35% complete with 5 days remaining',
    messageAr: 'السبرينت ٥ مكتمل بنسبة ٣٥٪ مع ٥ أيام متبقية',
    time: '1h ago',
    timeAr: 'منذ ساعة',
    read: false,
    avatar: '\u{1F3C3}',
    link: '/sprints',
  },
  {
    id: 'n4',
    type: 'task',
    title: 'Task Due Soon',
    titleAr: 'المهمة مستحقة قريباً',
    message: '"Balance track difficulty" is due tomorrow',
    messageAr: '"موازنة صعوبة المسارات" مستحقة غداً',
    time: '2h ago',
    timeAr: 'منذ ساعتين',
    read: true,
    avatar: '\u{23F0}',
    link: '/board',
  },
  {
    id: 'n5',
    type: 'system',
    title: 'Welcome to NJD Board',
    titleAr: 'مرحباً بك في NJD Board',
    message: 'Your workspace is ready. Explore your projects and tasks.',
    messageAr: 'مساحة عملك جاهزة. استكشف مشاريعك ومهامك.',
    time: '1 day ago',
    timeAr: 'منذ يوم',
    read: true,
    avatar: '\u{1F389}',
  },
  {
    id: 'n6',
    type: 'invite',
    title: 'Workspace Invitation',
    titleAr: 'دعوة لمساحة العمل',
    message: 'Omar has been invited to join the workspace',
    messageAr: 'تمت دعوة عمر للانضمام إلى مساحة العمل',
    time: '2 days ago',
    timeAr: 'منذ يومين',
    read: true,
    avatar: '\u{1F4E8}',
    link: '/team',
  },
];

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
