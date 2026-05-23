import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store.js';
import PageLoader from './PageLoader.jsx';
import ROUTES from '../../constants/routes.js';

// Checks: is the user logged in?
// If not → redirect to /login and remember where they were trying to go
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const loading = useAuthStore((state) => state.loading);
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
