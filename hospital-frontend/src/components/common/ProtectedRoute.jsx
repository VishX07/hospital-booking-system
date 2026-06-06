import { Navigate } from 'react-router-dom';

import useAuthStore from '../../store/auth.store.js';

import ROUTES from '../../constants/routes.js';
import DashboardLayout from '../layout/DashboardLayout.jsx';
import Waiting from '../ui/Waiting.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuthStore();

  // Wait for auth check
  if (loading) {
    return <Waiting />;
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Logged in
  return children;
};

export default ProtectedRoute;
