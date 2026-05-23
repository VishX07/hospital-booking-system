import axios from 'axios';
import toast from 'react-hot-toast';
import ENV from '../config/env.js';

const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true, // sends httpOnly cookie on every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor
// Runs before every request — extend here if you later add an Authorization header
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// ── Response interceptor
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;
    // eslint-disable-next-line no-unused-vars
    const message = error?.response?.data?.message;

    if (status === 401) {
      // Lazy import avoids circular dependency between axios instance and auth store
      import('../store/auth.store.js').then(({ useAuthStore }) => {
        useAuthStore.getState().logout();
      });
      toast.error('Session expired. Please login again.');
    }

    if (status === 403) {
      toast.error('You do not have permission to perform this action.');
    }
    if (status === 500) {
      toast.error('Server error. Please try again later.');
    }

    // 400 / 404 / 409 errors are handled per-feature — don't toast globally
    return Promise.reject(error);
  },
);

export default api;
