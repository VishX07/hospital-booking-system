import { Outlet } from 'react-router-dom';

// Public layout wrapper — renders PublicNavbar + Footer around all public pages.
// Currently just an Outlet; add <PublicNavbar /> and <Footer /> here when built.
const PublicRoutes = () => {
  return <Outlet />;
};

export default PublicRoutes;
