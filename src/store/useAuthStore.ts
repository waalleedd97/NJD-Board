import { create } from 'zustand';

export type UserRole = 'admin' | 'employee';

export interface AuthUser {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: UserRole;
  avatar: string;
}

const USERS: Record<string, AuthUser & { password: string }> = {
  admin: {
    id: 'u1',
    name: 'Admin',
    nameAr: 'المدير',
    email: 'admin@njdgames.com',
    role: 'admin',
    avatar: '\u{1F451}',
    password: 'admin123',
  },
  waleed: {
    id: '1',
    name: 'Waleed Al-Rashid',
    nameAr: 'وليد الراشد',
    email: 'waleed@njdgames.com',
    role: 'employee',
    avatar: '\u{1F468}\u{200D}\u{1F4BB}',
    password: 'waleed123',
  },
  nora: {
    id: '2',
    name: 'Nora Al-Saud',
    nameAr: 'نورة آل سعود',
    email: 'nora@njdgames.com',
    role: 'employee',
    avatar: '\u{1F469}\u{200D}\u{1F3A8}',
    password: 'nora123',
  },
};

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loginError: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    const saved = localStorage.getItem('njd_auth_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  })(),
  isAuthenticated: !!localStorage.getItem('njd_auth_user'),
  loginError: null,

  login: (username: string, password: string) => {
    const userEntry = USERS[username.toLowerCase()];
    if (userEntry && userEntry.password === password) {
      const { password: _, ...user } = userEntry;
      localStorage.setItem('njd_auth_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, loginError: null });
      return true;
    }
    set({ loginError: 'invalid_credentials' });
    return false;
  },

  logout: () => {
    localStorage.removeItem('njd_auth_user');
    set({ user: null, isAuthenticated: false, loginError: null });
  },

  clearError: () => set({ loginError: null }),
}));
