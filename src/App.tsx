import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Board } from './pages/Board';
import { DesignItems } from './pages/DesignItems';
import { Sprints } from './pages/Sprints';
import { Team } from './pages/Team';
import { Settings } from './pages/Settings';
import { Import } from './pages/Import';
import { Backlog } from './pages/Backlog';
import { useAuthStore, useIsAdmin } from './store/useAuthStore';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function dismissLoader() {
  const loader = document.querySelector('.njd-loader');
  if (loader) {
    loader.classList.add('fade-out');
    loader.addEventListener('transitionend', () => loader.remove());
  }
}

function App() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Dismiss the HTML loading screen once auth resolves
  useEffect(() => {
    if (!isLoading) {
      dismissLoader();
    }
  }, [isLoading]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/board" element={<Board />} />
        <Route path="/backlog" element={<Backlog />} />
        <Route path="/design-items" element={<DesignItems />} />
        <Route path="/sprints" element={<Sprints />} />
        <Route path="/team" element={<AdminRoute><Team /></AdminRoute>} />
        <Route path="/import" element={<AdminRoute><Import /></AdminRoute>} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
