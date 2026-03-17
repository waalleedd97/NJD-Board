import { create } from 'zustand';

interface SidebarState {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: localStorage.getItem('njd_sidebar_collapsed') === 'true',
  toggleCollapse: () =>
    set((s) => {
      const next = !s.isCollapsed;
      localStorage.setItem('njd_sidebar_collapsed', String(next));
      return { isCollapsed: next };
    }),
}));
