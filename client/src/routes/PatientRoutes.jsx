import { Outlet } from "react-router-dom";

// Sits inside ProtectedRoute → RoleGuard(patient) → DashboardLayout.
// All patient pages render via this Outlet.
const PatientRoutes = () => {
  return <Outlet />;
};

export default PatientRoutes;
