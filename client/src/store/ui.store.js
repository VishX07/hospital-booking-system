import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarOpen: true,
      darkMode: false,

      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),

      toggleDarkMode: () =>
        set((state) => ({
          darkMode: !state.darkMode,
        })),

      setSidebar: (val) =>
        set({
          sidebarOpen: val,
        }),
    }),

    {
      name: 'ui',
    },
  ),
);
