/*
 * DoctorSidebar.jsx — AlphaCare Design System (Teal Theme)
 * Sections:
 *  1. Styles & Keyframes
 *  2. AlphaLogo Sub-Component (animated SVG)
 *  3. NavItem Sub-Component
 *  4. SidebarContent Sub-Component
 *  5. DoctorSidebar Main Component
 */

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/auth.store.js';

/* === 1. STYLES & KEYFRAMES === */
const sidebarStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .sidebar-root * { font-family: 'DM Sans', sans-serif; }
  .sidebar-root .sora { font-family: 'Sora', sans-serif; }

  @keyframes sb-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(1.5); }
  }
  @keyframes sb-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes sb-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-3px); }
  }
  @keyframes sb-fadeIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes sb-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes sb-glow {
    0%, 100% { box-shadow: 0 0 12px rgba(20,184,166,0.4); }
    50%       { box-shadow: 0 0 22px rgba(20,184,166,0.7); }
  }

  .sb-spin  { animation: sb-spin 18s linear infinite; }
  .sb-float { animation: sb-float 3.5s ease-in-out infinite; }
  .sb-pulse { animation: sb-pulse 2s ease-in-out infinite; }
  .sb-glow  { animation: sb-glow 2.5s ease-in-out infinite; }

  .sb-nav-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 14px;
    padding: 10px 14px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #475569;
    transition: background .18s, color .18s, transform .18s, box-shadow .18s;
    cursor: pointer;
    text-decoration: none;
  }
  .sb-nav-item:hover {
    background: linear-gradient(135deg, #f0fdfa, #ecfdf5);
    color: #0d9488;
    transform: translateX(3px);
  }
  .sb-nav-item.active {
    background: linear-gradient(135deg, #0f766e, #0d9488);
    color: white;
    box-shadow: 0 4px 14px rgba(13,148,136,0.35);
    transform: translateX(2px);
  }
  .sb-nav-item.active .sb-nav-indicator {
    opacity: 1;
  }
  .sb-nav-indicator {
    position: absolute;
    right: 12px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.7);
    opacity: 0;
    transition: opacity .2s;
  }
  .sb-logout {
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 14px;
    padding: 10px 14px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #ef4444;
    transition: background .18s, transform .18s;
    cursor: pointer;
    width: 100%;
    background: none;
    border: none;
    text-align: left;
  }
  .sb-logout:hover {
    background: #fef2f2;
    transform: translateX(3px);
  }

  .sidebar-gradient {
    background: linear-gradient(180deg, #ffffff 0%, #f8fffe 60%, #f0fdfa 100%);
  }

  .logo-ring {
    transform-origin: center;
  }

  .sb-footer-card {
    background: linear-gradient(135deg, #f0fdfa, #ecfdf5);
    border: 1px solid #99f6e4;
    border-radius: 16px;
    padding: 14px;
  }

  .sb-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, #e2e8f0, transparent);
    margin: 6px 0;
  }

  .sb-section-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #94a3b8;
    padding: 0 14px;
    margin-bottom: 4px;
    margin-top: 8px;
  }
`;

{
  /* <Link to="/">Doctor Dashboard</Link>; */
}

/* === 2. ALPHA LOGO SVG === */
const AlphaLogo = () => (
  <div className="sb-float relative flex h-12 w-12 items-center justify-center flex-shrink-0">
    <Link to={ROUTES.HOME} className="h-full w-full">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="logoGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Background rounded square */}
        <rect width="48" height="48" rx="14" fill="url(#logoGrad)" />

        {/* Spinning outer ring decoration */}
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          strokeDasharray="5 4"
          className="sb-spin logo-ring"
        />

        {/* Letter A shape */}
        <path
          d="M24 10 L33 34 H29.5 L27.5 28.5 H20.5 L18.5 34 H15 Z"
          fill="white"
          fillOpacity="0.95"
        />
        {/* Crossbar of A */}
        <rect
          x="21.2"
          y="23"
          width="5.6"
          height="2.8"
          rx="1.4"
          fill="url(#logoGrad2)"
        />

        {/* Small medical cross bottom-right */}
        <circle cx="37" cy="37" r="6" fill="rgba(255,255,255,0.18)" />
        <path
          d="M34.5 37h5M37 34.5v5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Pulse dot */}
      <span
        className="sb-pulse absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white"
        style={{ background: '#2dd4bf' }}
      />
    </Link>
  </div>
);

/* === 3. NAV ITEM SUB-COMPONENT === */
const NavItem = ({ item, onClick }) => (
  <NavLink
    to={item.path}
    onClick={onClick}
    className={({ isActive }) => `sb-nav-item ${isActive ? 'active' : ''}`}
  >
    <span className="flex-shrink-0">{item.icon}</span>
    <span className="flex-1 truncate">{item.name}</span>
    <span className="sb-nav-indicator" />
  </NavLink>
);

/* === 4. SIDEBAR CONTENT SUB-COMPONENT === */
const SidebarContent = ({ menu, onClose, onLogout, user }) => (
  <div className="sidebar-root sidebar-gradient flex h-full flex-col">
    {/* Header */}
    <div
      className="px-5 py-4"
      style={{ borderBottom: '1px solid rgba(20,184,166,0.15)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlphaLogo />
          <div>
            <h1 className="sora text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
              AlphaCare
            </h1>
            <div
              className="mt-0.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{ background: 'rgba(13,148,136,0.1)', color: '#0d9488' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 sb-pulse" />
              Doctor Portal
            </div>
          </div>
        </div>

        {/* Close button — mobile only */}
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 lg:hidden"
          aria-label="Close sidebar"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Doctor quick info */}
      {user && (
        <div
          className="mt-4 flex items-center gap-3 rounded-2xl p-3"
          style={{
            background: 'rgba(13,148,136,0.06)',
            border: '1px solid rgba(13,148,136,0.12)',
          }}
        >
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold"
            style={{
              background: 'linear-gradient(135deg, #ccfbf1, #cffafe)',
              color: '#0f766e',
            }}
          >
            {user.fullName
              ?.split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase() || 'Dr'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      )}
    </div>

    {/* Nav */}
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
      <p className="sb-section-label">Navigation</p>
      {menu.slice(0, 5).map((item) => (
        <NavItem key={item.path} item={item} onClick={onClose} />
      ))}

      <div className="sb-divider my-3" />
      <p className="sb-section-label">Account</p>

      {menu.slice(5).map((item) => (
        <NavItem key={item.path} item={item} onClick={onClose} />
      ))}

      <div className="sb-divider my-3" />

      <button type="button" onClick={onLogout} className="sb-logout">
        <svg
          className="h-5 w-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.9}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
          />
        </svg>
        <span>Logout</span>
      </button>
    </nav>

    {/* Footer */}
    <div className="px-3 pb-4">
      <div className="sb-footer-card">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <p className="sora text-xs font-bold text-slate-800">
              Doctor Workspace
            </p>
            <p className="mt-0.5 text-xs leading-4 text-slate-500">
              Appointments, schedules & prescriptions in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* === 5. DOCTOR SIDEBAR MAIN COMPONENT === */
const DoctorSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const logoutUser = useAuthStore((state) => state.logoutUser);
  const user = useAuthStore((state) => state.user);

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
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.9}
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
      name: 'My Patients',
      path: ROUTES.DOCTOR_PATIENTS,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.9}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
          />
        </svg>
      ),
    },
    {
      name: 'Schedule',
      path: ROUTES.DOCTOR_SCHEDULE,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.9}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      name: 'Prescriptions',
      path: ROUTES.DOCTOR_PRESCRIPTIONS,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.9}
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
      name: 'Notifications',
      path: ROUTES.NOTIFICATIONS,
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.9}
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
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.9}
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

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <style>{sidebarStyles}</style>

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg transition hover:scale-105 lg:hidden"
        style={{
          background: 'linear-gradient(135deg, #0f766e, #0891b2)',
          boxShadow: '0 4px 14px rgba(13,148,136,0.4)',
        }}
        aria-label="Open sidebar"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r shadow-xl transition-transform duration-300 lg:sticky lg:z-auto lg:translate-x-0 lg:shadow-sm ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ borderColor: 'rgba(20,184,166,0.2)' }}
      >
        <SidebarContent
          menu={menu}
          onClose={closeSidebar}
          onLogout={handleLogout}
          user={user}
        />
      </aside>
    </>
  );
};

export default DoctorSidebar;
