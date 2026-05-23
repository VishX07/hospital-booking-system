import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentUser, logout as logoutApi } from '../api/auth.api.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,

      // Called after login / OTP verify — sets user from API response
      login: (user) => {
        set({ user, isAuthenticated: true });
      },

      // Clears session on logout or 401
      logout: async () => {
        try {
          await logoutApi();
        } catch {
          // Proceed with client-side logout even if API call fails
        }
        set({ user: null, isAuthenticated: false });
      },

      // Called on app mount to restore session from httpOnly cookie
      fetchCurrentUser: async () => {
        set({ loading: true });
        try {
          const res = await getCurrentUser();
          set({ user: res.data.user, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ loading: false });
        }
      },

      // Helpers — read from already-loaded user
      getRole: () => get().user?.role ?? null,
      isDoctor: () => get().user?.role === 'doctor',
      isPatient: () => get().user?.role === 'patient',
      isVerified: () => get().user?.isVerified ?? false,
    }),

    {
      name: 'auth', // localStorage key
      partialize: (state) => ({
        // only persist these — never persist loading
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
