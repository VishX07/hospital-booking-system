import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import router from './routes/index.jsx';

import { useAuthStore } from './store/auth.store.js';

import ErrorBoundary from './utils/ErrorBoundary.jsx';

const App = () => {
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,

          style: {
            borderRadius: '8px',
            fontSize: '14px',
          },

          success: {
            iconTheme: {
              primary: '#0e9f9f',
              secondary: '#fff',
            },
          },

          error: {
            iconTheme: {
              primary: '#e74c3c',
              secondary: '#fff',
            },
          },
        }}
      />
    </ErrorBoundary>
  );
};

export default App;
