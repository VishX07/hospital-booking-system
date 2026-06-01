import { NavLink } from 'react-router-dom';

import ROUTES from '../../constants/routes.js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import useAuthStore from '../../store/auth.store.js';
const DoctorSidebar = () => {
  const menu = [
    {
      name: 'Dashboard',
      path: ROUTES.DOCTOR_DASHBOARD,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.9}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 13.5l8.25-8.25 8.25 8.25M5.25 12v7.5A1.5 1.5 0 006.75 21h3.75v-5.25h3V21h3.75a1.5 1.5 0 001.5-1.5V12"
          />
        </svg>
      ),
    },

    {
      name: 'Appointments',
      path: ROUTES.DOCTOR_APPOINTMENTS,
    },
    {
      name: 'Schedule',
      path: ROUTES.DOCTOR_SCHEDULE,
    },
    {
      name: 'Prescriptions',
      path: ROUTES.DOCTOR_PRESCRIPTIONS,
    },
    {
      name: 'My Notifications',
      path: ROUTES.NOTIFICATIONS,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.9}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
      ),
    },
    {
      name: 'Settings',
      path: ROUTES.DOCTOR_SETTINGS,
    },
  ];

  const navigate = useNavigate();
  const logoutUser = useAuthStore((state) => state.logoutUser);

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out successfully');
    navigate(ROUTES.LOGIN);
  };
  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/20">
            <svg
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
            </svg>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950">
              AlphaCare
            </h1>
            <p className="text-xs font-medium text-slate-500">Doctor Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <span className="shrink-0">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.9}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
          </span>
          <span className="truncate">Logout</span>
        </button>
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-2xl bg-blue-50 p-4">
          <p className="text-sm font-bold text-slate-950">Doctor workspace</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Manage appointments, schedules, and prescriptions from one place.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default DoctorSidebar;
