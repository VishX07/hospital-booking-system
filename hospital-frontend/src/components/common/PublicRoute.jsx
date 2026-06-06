import { Navigate } from 'react-router-dom';

import useAuthStore from '../../store/auth.store.js';

import ROUTES from '../../constants/routes.js';
import DashboardLayout from '../layout/DashboardLayout.jsx';
import Waiting from '../ui/Waiting.jsx';

const PublicRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuthStore();

  // Wait auth restore
  if (loading) {
    return <Waiting />;
  }

  // Already logged in
  if (isAuthenticated) {
    // Patient
    if (user?.role === 'patient') {
      return <Navigate to={ROUTES.PATIENT_DASHBOARD} replace />;
    }

    // Doctor
    if (user?.role === 'doctor') {
      return <Navigate to={ROUTES.DOCTOR_DASHBOARD} replace />;
    }
  }

  return children;
};

export default PublicRoute;
