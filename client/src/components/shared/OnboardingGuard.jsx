import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '../../store/auth.store.js';

import ROUTES from '../../constants/routes.js';

const OnboardingGuard = () => {
  const user = useAuthStore((state) => state.user);

  const location = useLocation();

  // No profile yet
  if (!user?.doctorProfile) {
    if (location.pathname !== ROUTES.ONBOARDING_CREATE) {
      return <Navigate to={ROUTES.ONBOARDING_CREATE} replace />;
    }

    return <Outlet />;
  }

  const status = user.doctorProfile?.approvalStatus;

  // Pending
  if (status === 'pending') {
    if (location.pathname !== ROUTES.ONBOARDING_WAITING) {
      return <Navigate to={ROUTES.ONBOARDING_WAITING} replace />;
    }

    return <Outlet />;
  }

  // Rejected
  if (status === 'rejected') {
    if (location.pathname !== ROUTES.ONBOARDING_REJECTED) {
      return <Navigate to={ROUTES.ONBOARDING_REJECTED} replace />;
    }

    return <Outlet />;
  }

  // Approved
  return <Outlet />;
};

export default OnboardingGuard;
