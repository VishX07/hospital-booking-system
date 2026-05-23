import { Outlet } from "react-router-dom";

// Sits inside ProtectedRoute only — no role check, no dashboard layout.
// Doctors land here right after signup to complete their profile.
const OnboardingRoutes = () => {
  return <Outlet />;
};

export default OnboardingRoutes;
