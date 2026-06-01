import { useEffect } from 'react';

import { RouterProvider } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';

import router from './routes/index.jsx';

import useAuthStore from './store/auth.store.js';

const App = () => {
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <>
      <RouterProvider router={router} />

      <Toaster position="top-right" />
    </>
  );
};

export default App;
