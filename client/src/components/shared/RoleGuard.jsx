import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store.js';
import ROUTES from '../../constants/routes.js';

// Checks: does the user have the required role?
// Usage: <RoleGuard allowedRoles={["patient"]} />
const RoleGuard = ({ allowedRoles }) => {
  const user = useAuthStore((state) => state.user);
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
