import { Outlet } from "react-router-dom";

// Sits inside ProtectedRoute → RoleGuard(doctor) → OnboardingGuard → DashboardLayout.
// Only approved doctors reach this Outlet.
const DoctorRoutes = () => {
  return <Outlet />;
};

export default DoctorRoutes;
