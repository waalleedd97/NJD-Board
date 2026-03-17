import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useSidebarStore } from '../../store/useSidebarStore';

export function AppLayout() {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-white dark:bg-night bg-pattern">
      <Sidebar />
      <div
        className="min-h-screen transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ marginInlineStart: isCollapsed ? 80 : 272 }}
      >
        <Outlet />
      </div>
    </div>
  );
}
