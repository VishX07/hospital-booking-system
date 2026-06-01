import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,

  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;

    const message = error?.response?.data?.message;

    // Unauthorized
    if (status === 401) {
      toast.error(message || 'Please login again');
    }

    // Forbidden
    if (status === 403) {
      toast.error('You are not allowed to do this');
    }

    // Server Error
    if (status === 500) {
      toast.error('Server error');
    }

    return Promise.reject(error);
  },
);

export default api;
