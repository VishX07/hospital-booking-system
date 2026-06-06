/*
 * PatientDashboardPage.jsx — AlphaCare Design System (Blue Theme)
 * Sections:
 *  1. Styles & Keyframes
 *  2. Status Config & Helpers
 *  3. DoctorAvatar Sub-Component
 *  4. MedicalIllustration SVGs
 *  5. Skeleton Sub-Components (Stats, Section, Actions)
 *  6. StatCard Config
 *  7. QuickActions Config
 *  8. ApptRow Sub-Component
 *  9. SectionCard Sub-Component
 * 10. PatientDashboardPage Main Component
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getPatientDashboard } from '../../api/dashboard.api.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import useAuthStore from '../../store/auth.store.js';

/* === 1. STYLES & KEYFRAMES === */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .dash-root * { font-family: 'DM Sans', sans-serif; }
  .dash-root h1, .dash-root h2, .dash-root h3, .dash-root .sora { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(-1deg); }
    50%       { transform: translateY(-10px) rotate(1deg); }
  }
  @keyframes floatMini {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes spinSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes pulseDot {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: .4; transform: scale(1.5); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes heroReveal {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .anim-fade-up { animation: fadeUp 0.55s ease both; }
  .delay-1 { animation-delay: 0.07s; }
  .delay-2 { animation-delay: 0.14s; }
  .delay-3 { animation-delay: 0.21s; }
  .delay-4 { animation-delay: 0.28s; }
  .delay-5 { animation-delay: 0.35s; }
  .delay-6 { animation-delay: 0.42s; }
  .delay-7 { animation-delay: 0.49s; }

  .hero-illustration { animation: float 5s ease-in-out infinite; }
  .hero-illus-mini   { animation: floatMini 4s ease-in-out infinite; }
  .spin-slow         { animation: spinSlow 20s linear infinite; }
  .pulse-dot-anim    { animation: pulseDot 2s ease-in-out infinite; }
  .hero-text-in      { animation: heroReveal 0.6s ease both; }

  .illus-full { display: none; }
  .illus-mini { display: flex; align-items: center; justify-content: center; }
  @media (min-width: 768px) {
    .illus-mini { display: none; }
    .illus-full { display: block; }
  }

  .shimmer-bg {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }
  .shimmer-dark {
    background: linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.6s infinite;
  }

  .stat-card {
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.09);
  }
  .stat-card-inner { display: flex; align-items: center; gap: 0.75rem; }
  @media (min-width: 640px) { .stat-card-inner { display: block; } }

  .stat-num { font-size: 1.75rem; }
  @media (min-width: 640px) { .stat-num { font-size: 2.25rem; } }

  .action-card {
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .action-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.1);
  }

  .appt-row { transition: box-shadow 0.2s ease, transform 0.2s ease; }
  .appt-row:hover {
    transform: translateX(3px);
    box-shadow: 0 4px 20px rgba(59,130,246,0.1);
  }

  .btn-primary {
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59,130,246,0.35);
  }
  .btn-secondary {
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
    background: rgba(255,255,255,0.2);
  }

  .doc-avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-family: 'Sora', sans-serif;
    background: #eff6ff;
    color: #1d4ed8;
    border-radius: 1rem;
    flex-shrink: 0;
  }
`;

/* === 2. STATUS CONFIG & HELPERS === */
const statusConfig = {
  upcoming: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    label: 'Upcoming',
  },
  completed: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
    label: 'Completed',
  },
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    label: 'Pending',
  },
  cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-400',
    label: 'Cancelled',
  },
  confirmed: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
    label: 'Confirmed',
  },
};
const getStatus = (s = '') =>
  statusConfig[s.toLowerCase()] ?? {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    label: s,
  };

/* === 3. DOCTOR AVATAR SUB-COMPONENT === */
const DoctorAvatar = ({ src, name }) => {
  const [err, setErr] = useState(false);
  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('')
    : 'Dr';
  if (src && !err)
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        className="h-12 w-12 rounded-2xl object-cover ring-2 ring-slate-100 flex-shrink-0"
      />
    );
  return (
    <div className="doc-avatar-fallback h-12 w-12 text-sm">{initials}</div>
  );
};

/* === 4. MEDICAL ILLUSTRATION SVGs === */
const MedicalIllustration = () => (
  <svg
    viewBox="0 0 340 280"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full hero-illustration"
    aria-hidden="true"
  >
    <ellipse
      cx="170"
      cy="155"
      rx="140"
      ry="115"
      fill="rgba(255,255,255,0.12)"
    />
    <ellipse cx="230" cy="100" rx="80" ry="65" fill="rgba(255,255,255,0.08)" />
    <rect
      x="60"
      y="50"
      width="220"
      height="148"
      rx="14"
      fill="white"
      opacity="0.95"
    />
    <rect x="60" y="50" width="220" height="28" rx="14" fill="#1d4ed8" />
    <rect x="60" y="64" width="220" height="14" fill="#1d4ed8" />
    <circle cx="79" cy="64" r="5" fill="#ef4444" opacity="0.8" />
    <circle cx="96" cy="64" r="5" fill="#f59e0b" opacity="0.8" />
    <circle cx="113" cy="64" r="5" fill="#22c55e" opacity="0.8" />
    <polyline
      points="75,145 95,145 108,115 118,168 128,133 138,148 158,148 170,125 182,158 192,135 202,145 265,145"
      fill="none"
      stroke="#3b82f6"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="78" y="88" width="72" height="30" rx="8" fill="#eff6ff" />
    <text
      x="88"
      y="100"
      fontFamily="sans-serif"
      fontSize="8"
      fill="#3b82f6"
      fontWeight="700"
    >
      Heart Rate
    </text>
    <text
      x="88"
      y="112"
      fontFamily="sans-serif"
      fontSize="11"
      fill="#1e40af"
      fontWeight="800"
    >
      78 bpm
    </text>
    <rect x="162" y="88" width="72" height="30" rx="8" fill="#f0fdf4" />
    <text
      x="172"
      y="100"
      fontFamily="sans-serif"
      fontSize="8"
      fill="#16a34a"
      fontWeight="700"
    >
      Blood Pressure
    </text>
    <text
      x="172"
      y="112"
      fontFamily="sans-serif"
      fontSize="11"
      fill="#15803d"
      fontWeight="800"
    >
      120/80
    </text>
    <rect x="78" y="165" width="184" height="6" rx="3" fill="#e2e8f0" />
    <rect x="78" y="165" width="120" height="6" rx="3" fill="#3b82f6" />
    <text x="78" y="184" fontFamily="sans-serif" fontSize="8" fill="#64748b">
      Recovery Progress — 65%
    </text>
    <circle cx="290" cy="190" r="22" fill="rgba(255,255,255,0.15)" />
    <path
      d="M278,185 Q280,175 290,175 Q300,175 302,185"
      fill="none"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="278"
      y1="185"
      x2="278"
      y2="197"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="278" cy="200" r="4" fill="white" opacity="0.9" />
    <rect
      x="48"
      y="30"
      width="12"
      height="36"
      rx="4"
      fill="rgba(255,255,255,0.3)"
    />
    <rect
      x="36"
      y="42"
      width="36"
      height="12"
      rx="4"
      fill="rgba(255,255,255,0.3)"
    />
  </svg>
);

const MedicalIllustrationMini = () => (
  <div className="illus-mini flex-shrink-0" style={{ width: 68, height: 68 }}>
    <svg
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="68"
      height="68"
      className="hero-illus-mini"
      aria-hidden="true"
    >
      <circle
        cx="36"
        cy="36"
        r="33"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
        strokeDasharray="4 3"
        className="spin-slow"
      />
      <rect
        x="10"
        y="14"
        width="52"
        height="38"
        rx="7"
        fill="white"
        opacity="0.92"
      />
      <rect x="10" y="14" width="52" height="10" rx="7" fill="#1d4ed8" />
      <rect x="10" y="20" width="52" height="4" fill="#1d4ed8" />
      <polyline
        points="14,38 20,38 24,28 28,44 32,34 36,38 44,38 48,31 52,42 56,36 58,38"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="4"
        y="8"
        width="4"
        height="12"
        rx="2"
        fill="rgba(255,255,255,0.35)"
      />
      <rect
        x="0"
        y="12"
        width="12"
        height="4"
        rx="2"
        fill="rgba(255,255,255,0.35)"
      />
      <circle cx="60" cy="18" r="4" fill="#22c55e" className="pulse-dot-anim" />
    </svg>
  </div>
);

/* === 5. SKELETON SUB-COMPONENTS === */

/* 2×2 stat card skeletons */
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6"
      >
        <div className="flex items-center gap-3 sm:block">
          <div className="shimmer-bg h-9 w-9 rounded-xl flex-shrink-0" />
          <div className="space-y-1.5 sm:mt-4">
            <div className="shimmer-bg h-3 w-16 rounded-full" />
            <div className="shimmer-bg h-8 w-12 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* Section card skeleton — mirrors the ApptRow layout */
const SectionSkeleton = ({ title, rows = 3 }) => (
  <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    {/* header */}
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
      <div className="flex items-center gap-2.5">
        <div className="shimmer-bg h-9 w-9 rounded-xl" />
        <div className="shimmer-bg h-5 w-40 rounded-full" />
      </div>
      <div className="shimmer-bg h-5 w-16 rounded-full" />
    </div>
    {/* rows */}
    <div className="divide-y divide-slate-50 px-3 py-1 sm:px-6 sm:py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="shimmer-bg h-12 w-12 rounded-2xl flex-shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <div className="shimmer-bg h-4 w-36 rounded-full" />
              <div className="shimmer-bg h-3 w-24 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="shimmer-bg h-4 w-20 rounded-full hidden sm:block" />
            <div className="shimmer-bg h-4 w-16 rounded-full hidden sm:block" />
            <div className="shimmer-bg h-8 w-20 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* Quick actions skeleton */
const ActionsSkeleton = () => (
  <div>
    <div className="mb-3 flex items-center gap-3 sm:mb-4">
      <div className="shimmer-bg h-6 w-32 rounded-full" />
      <div className="h-px flex-1 bg-slate-200" />
    </div>
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 sm:gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="flex items-center gap-3 sm:block">
            <div className="shimmer-bg h-12 w-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2 sm:mt-4">
              <div className="shimmer-bg h-4 w-28 rounded-full" />
              <div className="shimmer-bg h-3 w-40 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* === 6. STAT CARD CONFIG === */
const statCards = [
  {
    key: 'upcomingAppointments',
    label: 'Upcoming',
    status: 'upcoming',
    color: 'blue',
    iconPath:
      'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    key: 'completedAppointments',
    label: 'Completed',
    status: 'completed',
    color: 'green',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    key: 'pendingAppointments',
    label: 'Pending',
    status: 'pending',
    color: 'amber',
    iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    key: 'cancelledAppointments',
    label: 'Cancelled',
    status: 'cancelled',
    color: 'red',
    iconPath:
      'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];
const colorMap = {
  blue: {
    icon: 'text-blue-600',
    iconBg: 'bg-blue-50',
    accent: 'border-blue-100',
    num: 'text-blue-700',
  },
  green: {
    icon: 'text-green-600',
    iconBg: 'bg-green-50',
    accent: 'border-green-100',
    num: 'text-green-700',
  },
  amber: {
    icon: 'text-amber-500',
    iconBg: 'bg-amber-50',
    accent: 'border-amber-100',
    num: 'text-amber-600',
  },
  red: {
    icon: 'text-red-500',
    iconBg: 'bg-red-50',
    accent: 'border-red-100',
    num: 'text-red-600',
  },
};

/* === 7. QUICK ACTIONS CONFIG === */
const quickActions = [
  {
    to: '/doctors',
    label: 'Find Doctors',
    desc: 'Search specialists & book appointments',
    color: 'blue',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
  {
    to: '/patient/appointments',
    label: 'My Appointments',
    desc: 'View & manage your appointment history',
    color: 'indigo',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    to: '/patient/prescriptions',
    label: 'Prescriptions',
    desc: 'Access your medical prescriptions',
    color: 'teal',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
];
const actionColorMap = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    hover: 'group-hover:bg-blue-100',
    arrow: 'text-blue-400',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    hover: 'group-hover:bg-indigo-100',
    arrow: 'text-indigo-400',
  },
  teal: {
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    hover: 'group-hover:bg-teal-100',
    arrow: 'text-teal-400',
  },
};

/* === 8. APPOINTMENT ROW SUB-COMPONENT === */
const ApptRow = ({ appointment, linkBase }) => {
  const s = getStatus(appointment.status);
  return (
    <div className="appt-row flex flex-col gap-3 rounded-xl px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <DoctorAvatar
            src={appointment?.doctorId?.userId?.profilePicture}
            name={appointment?.doctorId?.userId?.fullName}
          />
          <span
            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${s.dot}`}
          />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-800 text-sm sm:text-base">
            Dr. {appointment?.doctorId?.userId?.fullName}
          </h3>
          <p className="truncate text-xs text-slate-500 sm:text-sm">
            {appointment?.doctorId?.department?.name}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 sm:contents">
        <div className="flex items-center gap-1.5 sm:flex-col sm:items-end sm:gap-0.5">
          <p className="text-xs font-medium text-slate-700 sm:text-sm">
            {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <p className="text-xs text-slate-400">{appointment.timeSlot}</p>
        </div>
        <span
          className={`hidden sm:inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${s.bg} ${s.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
        <Link
          to={`${linkBase}/${appointment._id}`}
          className="flex-shrink-0 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:px-4 sm:py-2 sm:text-sm"
        >
          Details
          <svg
            className="h-3 w-3 sm:h-3.5 sm:w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

/* === 9. SECTION CARD SUB-COMPONENT === */
const CalendarIcon = () => (
  <svg
    className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const SectionCard = ({
  title,
  icon,
  viewAllTo,
  children,
  delay = 'delay-5',
}) => (
  <div
    className={`anim-fade-up ${delay} rounded-3xl border border-slate-200 bg-white shadow-sm`}
  >
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
      <div className="flex items-center gap-2.5">
        <div className="rounded-xl bg-blue-50 p-2">{icon}</div>
        <h2 className="sora text-base font-bold text-slate-800 sm:text-lg">
          {title}
        </h2>
      </div>
      <Link
        to={viewAllTo}
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 sm:px-3 sm:text-sm"
      >
        View All
        <svg
          className="h-3 w-3 sm:h-3.5 sm:w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
    <div className="divide-y divide-slate-50 px-3 py-1 sm:px-6 sm:py-2">
      {children}
    </div>
  </div>
);

/* === 10. PATIENT DASHBOARD PAGE MAIN COMPONENT === */
const PatientDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const isProfileIncomplete = !user?.gender || !user?.dateOfBirth;

  const fetchDashboard = async () => {
    try {
      const response = await getPatientDashboard();
      setDashboard(response.data.dashboard);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="dash-root min-h-screen bg-[#f0f5fb] px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
          {/* ── HERO ── */}
          <div className="anim-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 shadow-xl">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white opacity-5" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-indigo-400 opacity-10 blur-3xl" />
            <div className="pointer-events-none absolute top-4 left-4 hidden h-16 w-16 opacity-20 lg:block">
              <svg viewBox="0 0 64 64" className="spin-slow w-full h-full">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                />
              </svg>
            </div>

            <div className="relative px-5 py-7 sm:px-8 sm:py-10">
              <div className="flex items-start justify-between gap-4 md:items-center">
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold tracking-widest text-blue-100 uppercase backdrop-blur-sm sm:text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Patient Portal
                  </span>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="min-w-0">
                      <h1 className="sora text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
                        Welcome Back
                        {user?.fullName
                          ? `, ${user.fullName.split(' ')[0]}`
                          : ''}{' '}
                        👋
                      </h1>
                      <p className="mt-2 text-sm leading-relaxed text-blue-100/90 sm:text-base">
                        <span className="hidden sm:inline">
                          Your health, beautifully organised. Manage
                          appointments, prescriptions, and your care journey —
                          all in one place.
                        </span>
                        <span className="sm:hidden">
                          Manage your health journey, all in one place.
                        </span>
                      </p>
                    </div>
                    <MedicalIllustrationMini />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
                    <Link
                      to="/doctors"
                      className="btn-primary inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-blue-700 shadow-md sm:px-5 sm:py-2.5 sm:text-sm"
                    >
                      <svg
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Find Doctors
                    </Link>
                    <Link
                      to="/patient/appointments"
                      className="btn-secondary inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm sm:px-5 sm:py-2.5 sm:text-sm"
                    >
                      My Appointments
                      <svg
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>

                <div className="illus-full flex-shrink-0 w-56 md:w-64 lg:w-72 xl:w-80">
                  <MedicalIllustration />
                </div>
              </div>
            </div>
          </div>

          {/* ── STATS — skeleton until data arrives ── */}
          {loading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              {statCards.map((card, i) => {
                const c = colorMap[card.color];
                return (
                  <Link
                    key={card.key}
                    to={`/patient/appointments?status=${card.status}`}
                    className={`stat-card anim-fade-up delay-${i + 1} group rounded-2xl border bg-white shadow-sm ${c.accent} p-4 sm:p-6`}
                  >
                    <div className="stat-card-inner">
                      <div
                        className={`rounded-xl p-2 sm:p-2.5 ${c.iconBg} transition-transform duration-200 group-hover:scale-110 flex-shrink-0`}
                      >
                        <svg
                          className={`h-4 w-4 sm:h-5 sm:w-5 ${c.icon}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={card.iconPath}
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 sm:text-sm">
                          {card.label}
                        </p>
                        <h2
                          className={`stat-num font-extrabold tracking-tight ${c.num}`}
                        >
                          {dashboard[card.key] ?? 0}
                        </h2>
                      </div>
                    </div>
                    <div className="hidden sm:flex justify-end mt-2">
                      <svg
                        className="h-4 w-4 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* ── PROFILE ALERT — only when data loaded and profile is incomplete ── */}
          {!loading && dashboard && isProfileIncomplete && (
            <div className="anim-fade-up delay-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="sora font-bold text-amber-900 text-sm sm:text-base">
                      Complete Your Profile
                    </h3>
                    <p className="mt-0.5 text-xs text-amber-700 sm:text-sm">
                      Add your gender and date of birth to get personalised
                      care.
                    </p>
                  </div>
                </div>
                <Link
                  to="/patient/settings"
                  className="self-start rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-600 sm:self-auto sm:text-sm"
                >
                  Complete Now
                </Link>
              </div>
            </div>
          )}

          {/* ── UPCOMING APPOINTMENTS — skeleton until data ── */}
          {loading ? (
            <SectionSkeleton rows={3} />
          ) : (
            <SectionCard
              title="Upcoming Appointments"
              icon={<CalendarIcon />}
              viewAllTo="/patient/appointments?status=upcoming"
              delay="delay-5"
            >
              {!dashboard?.upcomingAppointmentList?.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center sm:py-12">
                  <div className="mb-4 rounded-3xl bg-blue-50 p-4">
                    <svg
                      className="h-10 w-10 text-blue-300 sm:h-12 sm:w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="sora text-base font-semibold text-slate-700 sm:text-lg">
                    No Upcoming Appointments
                  </h3>
                  <p className="mt-1.5 max-w-xs px-4 text-xs text-slate-500 sm:text-sm">
                    Book with a specialist to get started on your care journey.
                  </p>
                  <Link
                    to="/doctors"
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-blue-700 sm:py-2.5 sm:text-sm"
                  >
                    Find Doctors
                  </Link>
                </div>
              ) : (
                dashboard.upcomingAppointmentList
                  .slice(0, 4)
                  .map((appt) => (
                    <ApptRow
                      key={appt._id}
                      appointment={appt}
                      linkBase="/patient/appointments"
                    />
                  ))
              )}
            </SectionCard>
          )}

          {/* ── RECENT APPOINTMENTS — skeleton until data ── */}
          {loading ? (
            <SectionSkeleton rows={3} />
          ) : (
            <SectionCard
              title="Recent Appointments"
              icon={<CalendarIcon />}
              viewAllTo="/patient/appointments"
              delay="delay-6"
            >
              {!dashboard?.recentAppointments?.slice(0, 4).length ? (
                <p className="py-8 text-center text-xs text-slate-400 sm:text-sm">
                  No recent appointments found.
                </p>
              ) : (
                dashboard.recentAppointments
                  .slice(0, 4)
                  .map((appt) => (
                    <ApptRow
                      key={appt._id}
                      appointment={appt}
                      linkBase="/patient/appointments"
                    />
                  ))
              )}
            </SectionCard>
          )}

          {/* ── QUICK ACTIONS — skeleton until data ── */}
          {loading ? (
            <ActionsSkeleton />
          ) : (
            <div className="anim-fade-up delay-7">
              <div className="mb-3 flex items-center gap-3 sm:mb-4">
                <h2 className="sora text-lg font-bold text-slate-800 sm:text-xl">
                  Quick Actions
                </h2>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 sm:gap-4">
                {quickActions.map((action) => {
                  const c = actionColorMap[action.color];
                  return (
                    <Link
                      key={action.to}
                      to={action.to}
                      className="action-card group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
                    >
                      <div className="flex items-center gap-3 sm:block">
                        <div
                          className={`rounded-xl p-2.5 sm:p-3 ${c.bg} ${c.text} ${c.hover} transition-colors duration-200 flex-shrink-0`}
                        >
                          {action.icon}
                        </div>
                        <div className="flex-1 min-w-0 sm:mt-4">
                          <h3 className="sora font-bold text-slate-800 text-sm sm:text-base">
                            {action.label}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500 leading-snug sm:mt-1 sm:text-sm">
                            {action.desc}
                          </p>
                        </div>
                        <svg
                          className={`h-4 w-4 flex-shrink-0 ${c.arrow} transition-transform duration-200 group-hover:translate-x-1 sm:hidden`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                      <div className="hidden sm:flex justify-end mt-2">
                        <svg
                          className={`h-5 w-5 ${c.arrow} transition-transform duration-200 group-hover:translate-x-1`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboardPage;
