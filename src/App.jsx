// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import FeedPage from './pages/FeedPage';
import AdminPage from './pages/AdminPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="display-title text-4xl animate-pulse">CARREGANDO...</div>
    </div>
  );
  return user ? children : <Navigate to="/auth" replace />;
}

function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="fog-bg" />
      <div className="display-title text-5xl animate-pulse text-cyan-neon">SDG</div>
    </div>
  );

  return (
    <Routes>
      <Route
        path="/auth"
        element={user ? <Navigate to={profile?.role === 'admin' ? '/admin' : '/'} replace /> : <AuthPage />}
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <FeedPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
