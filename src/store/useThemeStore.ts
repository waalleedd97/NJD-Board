import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

function applyTheme(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// main.tsx already synced cookies → localStorage before this runs
const savedTheme = localStorage.getItem('njd-theme') || localStorage.getItem('theme');
const initialDark = savedTheme === 'dark';
applyTheme(initialDark);

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: initialDark,

  toggleTheme: () =>
    set((state) => {
      const next = !state.isDark;
      applyTheme(next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      localStorage.setItem('njd-theme', next ? 'dark' : 'light');
      return { isDark: next };
    }),

  // Sync-only: update internal state + DOM class without writing back to storage/cookies
  setTheme: (dark: boolean) =>
    set((state) => {
      if (state.isDark === dark) return state;
      applyTheme(dark);
      return { isDark: dark };
    }),
}));
