import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import useAuthStore from '../../store/auth.store.js';
import ROUTES from '../../constants/routes.js';

const PatientSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const logoutUser = useAuthStore((state) => state.logoutUser);

  const menu = [
    {
      name: 'Dashboard',
      path: ROUTES.PATIENT_DASHBOARD,
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
      name: 'Find Doctors',
      path: ROUTES.DOCTORS,
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
            d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0m-3.75-7.5h4.5m-2.25-2.25V15"
          />
        </svg>
      ),
    },
    {
      name: 'My Appointments',
      path: ROUTES.PATIENT_APPOINTMENTS,
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
            d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6.75V19.5A1.5 1.5 0 004.5 21z"
          />
        </svg>
      ),
    },
    {
      name: 'My Prescriptions',
      path: ROUTES.PATIENT_PRESCRIPTIONS,
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
            d="M9 12h6m-6 4h6M9 8h6m2.25-4.5H6.75A2.25 2.25 0 004.5 5.75v12.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V5.75a2.25 2.25 0 00-2.25-2.25z"
          />
        </svg>
      ),
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
      path: ROUTES.PATIENT_SETTINGS,
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
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.654.85.196.095.388.196.576.304.325.188.72.202 1.052.047l1.168-.544a1.125 1.125 0 011.45.478l1.296 2.247a1.125 1.125 0 01-.256 1.465l-.955.784c-.293.241-.438.613-.431.992a7.723 7.723 0 010 .712c-.007.379.138.751.431.992l.955.784c.431.354.54.971.256 1.465l-1.296 2.247a1.125 1.125 0 01-1.45.478l-1.168-.544c-.332-.155-.727-.141-1.052.047a6.498 6.498 0 01-.576.304c-.341.164-.591.476-.654.85l-.213 1.281c-.09.542-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.654-.85a6.498 6.498 0 01-.576-.304c-.325-.188-.72-.202-1.052-.047l-1.168.544a1.125 1.125 0 01-1.45-.478l-1.296-2.247a1.125 1.125 0 01.256-1.465l.955-.784c.293-.241.438-.613.431-.992a7.723 7.723 0 010-.712c.007-.379-.138-.751-.431-.992l-.955-.784a1.125 1.125 0 01-.256-1.465l1.296-2.247a1.125 1.125 0 011.45-.478l1.168.544c.332.155.727.141 1.052-.047.188-.108.38-.209.576-.304.341-.164.591-.476.654-.85l.213-1.281z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out successfully');
    navigate(ROUTES.LOGIN);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center justify-between gap-3">
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
              <p className="text-xs font-medium text-slate-500">
                Patient Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 lg:hidden"
            aria-label="Close sidebar"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeSidebar}
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
          <p className="text-sm font-bold text-slate-950">Need help?</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Manage appointments, doctors, and prescriptions from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-700 lg:hidden"
        aria-label="Open sidebar"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {sidebarOpen && (
        <button
          type="button"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 lg:sticky lg:z-auto lg:translate-x-0 lg:shadow-sm ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default PatientSidebar;
