import { Navigate } from 'react-router-dom';

import useAuthStore from '../../store/auth.store.js';

import ROUTES from '../../constants/routes.js';

const DoctorApprovalRoute = ({ children }) => {
  const { user, doctorProfile } = useAuthStore();

  if (user?.role !== 'doctor') {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  if (!doctorProfile) {
    return <Navigate to={ROUTES.CREATE_PROFILE} replace />;
  }

  if (doctorProfile.approvalStatus !== 'approved') {
    return <Navigate to={ROUTES.CREATE_PROFILE} replace />;
  }

  return children;
};

export default DoctorApprovalRoute;
