import { Navigate } from 'react-router-dom';

import useAuthStore from '../../store/auth.store.js';

import ROUTES from '../../constants/routes.js';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuthStore();

  // Wait for auth check
  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f5f8fb] p-6">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="rounded-3xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="text-sm font-semibold text-slate-600">
              Loading appointment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Logged in
  return children;
};

export default ProtectedRoute;
