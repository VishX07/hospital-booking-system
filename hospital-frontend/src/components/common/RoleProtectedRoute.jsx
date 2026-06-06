import { Navigate } from 'react-router-dom';

import useAuthStore from '../../store/auth.store.js';

import ROUTES from '../../constants/routes.js';
import DashboardLayout from '../layout/DashboardLayout.jsx';
import Waiting from '../ui/Waiting.jsx';

const RoleProtectedRoute = ({ children, allowedRole }) => {
  const { user, doctorProfile, isAuthenticated, loading } = useAuthStore();

  // Wait auth restore
  if (loading) {
    return <Waiting />;
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Doctor-specific checks
  // if (user?.role === 'doctor') {
  //   if (doctorProfile?.approvalStatus !== 'approved') {
  //     return <Navigate to={ROUTES.CREATE_PROFILE} replace />;
  //   }
  // }

  // Wrong role
  if (user?.role !== allowedRole) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }
  // Doctor-specific checks
  // if (user?.role === 'doctor') {
  //   if (doctorProfile?.approvalStatus === 'approved') {
  //     // return <Navigate to={ROUTES.DOCTOR_DASHBOARD} replace />;
  //     console.log(doctorProfile);
  //   }
  // }

  // if (user?.role === 'doctor' && doctorProfile?.approvalStatus !== 'approved') {
  //   return <Navigate to={ROUTES.CREATE_PROFILE} />;
  // }

  return children;
};

export default RoleProtectedRoute;
