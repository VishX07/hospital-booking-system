import { create } from 'zustand';
import { getCurrentUser, logout } from '../api/auth.api.js';

const useAuthStore = create((set) => ({
  user: null,
  doctorProfile: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user) => set({ user, isAuthenticated: true }),

  fetchCurrentUser: async () => {
    try {
      const response = await getCurrentUser();
      const userData = response.data.user;
      const doctorProfile = response.data.doctorProfile || null;

      set({
        user: userData,
        doctorProfile,
        isAuthenticated: true,
        loading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  logoutUser: async () => {
    try {
      console.log('before', localStorage.getItem('accessToken'));

      await logout();

      localStorage.removeItem('accessToken');

      console.log('after', localStorage.getItem('accessToken'));
    } catch (err) {
      console.log(err);
    }

    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
