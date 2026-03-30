import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Board } from './pages/Board';
import { DesignItems } from './pages/DesignItems';
import { Sprints } from './pages/Sprints';
import { Team } from './pages/Team';
import { Settings } from './pages/Settings';
import { Import } from './pages/Import';
import { useAuthStore, useIsAdmin } from './store/useAuthStore';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center gap-8">
        <motion.img
          src="/njd-logo.png"
          alt="NJD Games"
          className="w-20 h-20 object-contain"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Pulsing dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#7C3AED' }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function App() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Keep loader visible while auth is loading; fade out once resolved
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowLoader(false), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <>
      <AnimatePresence>{showLoader && <LoadingScreen />}</AnimatePresence>

      {!isLoading && isAuthenticated && (
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/board" element={<Board />} />
            <Route path="/design-items" element={<DesignItems />} />
            <Route path="/sprints" element={<Sprints />} />
            <Route path="/team" element={<AdminRoute><Team /></AdminRoute>} />
            <Route path="/import" element={<AdminRoute><Import /></AdminRoute>} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  );
}

export default App;
