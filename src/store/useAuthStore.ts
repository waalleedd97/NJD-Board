import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

const AUTH_REDIRECT = 'https://njd-services.net';

export type UserRole = 'super_admin' | 'employee';

export interface AuthUser {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  avatar: string;
}

function mapSupabaseUser(user: User): AuthUser {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    name: meta.full_name ?? meta.name ?? user.email?.split('@')[0] ?? 'User',
    nameAr: meta.full_name_ar ?? meta.name_ar ?? meta.full_name ?? user.email?.split('@')[0] ?? 'مستخدم',
    email: user.email ?? '',
    avatar: meta.avatar ?? '👤',
  };
}

/** Wait for a settled session — getSession first, then fall back to onAuthStateChange with a timeout. */
async function waitForSession(): Promise<Session | null> {
  // 1. Try hash tokens first (redirect from njd-services.net)
  const hash = window.location.hash.substring(1);
  if (hash.includes('access_token') && hash.includes('refresh_token')) {
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (accessToken && refreshToken) {
      const { data } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      if (data.session) return data.session;
    }
  }

  // 2. Try cached session
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session;

  // 3. Session might still be restoring — wait for the first auth state event
  return new Promise<Session | null>((resolve) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      subscription.unsubscribe();
      resolve(s);
    });
    // If nothing fires within 3 seconds, there's genuinely no session
    setTimeout(() => {
      subscription.unsubscribe();
      resolve(null);
    }, 3000);
  });
}

interface AuthState {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: 'employee',
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const session = await waitForSession();

    if (!session?.user) {
      set({ isLoading: false });
      window.location.href = AUTH_REDIRECT;
      return;
    }

    const authUser = mapSupabaseUser(session.user);

    // Check app access — only redirect on explicit false, not on error
    const { data: hasAccess, error: accessError } = await supabase.rpc('has_app_access' as never, {
      uid: session.user.id,
      app: 'board',
    } as never);

    if (accessError) {
      // Retry once
      const { data: retryAccess } = await supabase.rpc('has_app_access' as never, {
        uid: session.user.id,
        app: 'board',
      } as never);
      if (retryAccess === false) {
        set({ isLoading: false });
        alert('ليس لديك صلاحية للوصول إلى Board');
        window.location.href = AUTH_REDIRECT;
        return;
      }
    } else if (hasAccess === false) {
      set({ isLoading: false });
      alert('ليس لديك صلاحية للوصول إلى Board');
      window.location.href = AUTH_REDIRECT;
      return;
    }

    // Fetch user role
    const { data: fetchedRole } = await supabase.rpc('get_user_role' as never, {
      uid: session.user.id,
    } as never);

    const role: UserRole = fetchedRole === 'super_admin' ? 'super_admin' : 'employee';

    // Fetch profile for display name
    const { data: profile } = await supabase
      .from('profiles' as never)
      .select('name_ar, name_en')
      .eq('id', session.user.id)
      .single() as { data: { name_ar: string; name_en: string } | null };

    if (!profile) {
      set({ isLoading: false });
      window.location.href = 'https://njd-services.net/#complete-profile';
      return;
    }

    set({
      user: {
        ...authUser,
        name: profile.name_en || authUser.name,
        nameAr: profile.name_ar || authUser.nameAr,
      },
      role,
      isAuthenticated: true,
      isLoading: false,
    });

    // Listen for future auth changes (sign-out, token refresh)
    supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession?.user) {
        set((prev) => ({
          user: prev.user ?? mapSupabaseUser(newSession.user),
          isAuthenticated: true,
        }));
      } else {
        set({ user: null, isAuthenticated: false });
        window.location.href = AUTH_REDIRECT;
      }
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
  },
}));

/** Returns true if the current user is a super_admin */
export function useIsAdmin(): boolean {
  return useAuthStore((s) => s.role === 'super_admin');
}
