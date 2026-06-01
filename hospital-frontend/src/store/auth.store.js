import { create } from 'zustand';

import { getCurrentUser, logout } from '../api/auth.api.js';

const useAuthStore = create((set) => ({
  user: null,

  isAuthenticated: false,

  loading: true,

  // Set user after login
  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),

  // Get logged-in user
  fetchCurrentUser: async () => {
    try {
      const response = await getCurrentUser();

      set({
        user: response.data.user,

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

  // Logout
  logoutUser: async () => {
    try {
      await logout();
    } catch {
      // ignore api error
    }

    set({
      user: null,

      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
