import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles }) {
  const { user, loading, sessionExpired } = useAuth();
  const location = useLocation();

  if (loading) return <div className="section-shell py-16 text-slate-600">Loading your account...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location, sessionExpired }} />;
  if (roles?.length && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
