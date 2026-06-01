import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getPatientDashboard } from '../../api/dashboard.api.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import useAuthStore from '../../store/auth.store.js';
/* ─── Inline keyframe styles ─────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .dash-root { font-family: 'DM Sans', sans-serif; }
  .dash-root h1, .dash-root h2, .dash-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(-1deg); }
    50%       { transform: translateY(-10px) rotate(1deg); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59,130,246,0.35); }
    70%  { transform: scale(1);    box-shadow: 0 0 0 10px rgba(59,130,246,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59,130,246,0); }
  }

  .anim-fade-up   { animation: fadeUp 0.55s ease both; }
  .anim-fade-in   { animation: fadeIn 0.4s ease both; }
  .delay-1  { animation-delay: 0.07s; }
  .delay-2  { animation-delay: 0.14s; }
  .delay-3  { animation-delay: 0.21s; }
  .delay-4  { animation-delay: 0.28s; }
  .delay-5  { animation-delay: 0.35s; }
  .delay-6  { animation-delay: 0.42s; }

  .hero-illustration { animation: float 5s ease-in-out infinite; }

  .stat-card {
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.09);
  }

  .action-card {
    transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
  }
  .action-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.1);
  }

  .appt-row {
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }
  .appt-row:hover {
    transform: translateX(3px);
    box-shadow: 0 4px 20px rgba(59,130,246,0.1);
  }

  .btn-primary {
    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59,130,246,0.35);
    background: #1d4ed8;
  }
  .btn-secondary {
    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }
  .btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
    background: #f1f5f9;
  }
`;

/* ─── Status badge config ─────────────────────────────────────────────────── */
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
};

const getStatus = (s = '') =>
  statusConfig[s.toLowerCase()] ?? {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    label: s,
  };

/* ─── SVG Illustration ────────────────────────────────────────────────────── */
const MedicalIllustration = () => (
  <svg
    viewBox="0 0 340 280"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full hero-illustration"
    aria-hidden="true"
  >
    {/* Background blobs */}
    <ellipse
      cx="170"
      cy="155"
      rx="140"
      ry="115"
      fill="rgba(255,255,255,0.12)"
    />
    <ellipse cx="230" cy="100" rx="80" ry="65" fill="rgba(255,255,255,0.08)" />

    {/* Monitor/Screen */}
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

    {/* Screen content – ECG line */}
    <polyline
      points="75,145 95,145 108,115 118,168 128,133 138,148 158,148 170,125 182,158 192,135 202,145 265,145"
      fill="none"
      stroke="#3b82f6"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Stat pill 1 */}
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

    {/* Stat pill 2 */}
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

    {/* Progress bar area */}
    <rect x="78" y="165" width="184" height="6" rx="3" fill="#e2e8f0" />
    <rect x="78" y="165" width="120" height="6" rx="3" fill="#3b82f6" />
    <text x="78" y="184" fontFamily="sans-serif" fontSize="8" fill="#64748b">
      Recovery Progress — 65%
    </text>

    {/* Stand */}
    <rect x="155" y="198" width="30" height="16" rx="3" fill="#cbd5e1" />
    <rect x="130" y="213" width="80" height="8" rx="4" fill="#94a3b8" />

    {/* Stethoscope decoration */}
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

    {/* Pills decoration bottom-left */}
    <rect
      x="42"
      y="200"
      width="28"
      height="13"
      rx="6.5"
      fill="rgba(255,255,255,0.25)"
    />
    <line
      x1="56"
      y1="200"
      x2="56"
      y2="213"
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="1.5"
    />
    <rect
      x="42"
      y="218"
      width="28"
      height="13"
      rx="6.5"
      fill="rgba(255,255,255,0.18)"
    />
    <line
      x1="56"
      y1="218"
      x2="56"
      y2="231"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="1.5"
    />

    {/* Cross / plus */}
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

/* ─── Stat Card ───────────────────────────────────────────────────────────── */
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

/* ─── Quick Action configs ────────────────────────────────────────────────── */
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

/* ─── Main Component ──────────────────────────────────────────────────────── */
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

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f0f5fb] p-6">
        <div className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center">
          <div className="rounded-3xl border border-slate-200 bg-white px-10 py-9 text-center shadow-md">
            <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="text-sm font-semibold text-slate-500 tracking-wide">
              Loading your dashboard…
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return <div className="p-6 text-slate-500">Failed to load dashboard.</div>;
  }

  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="dash-root min-h-screen bg-[#f0f5fb] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* ── HERO ─────────────────────────────────────────────────────────── */}
          <div className="anim-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-8 shadow-xl md:p-10">
            {/* subtle grid texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            {/* glow orb */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white opacity-5" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-indigo-400 opacity-10 blur-3xl" />

            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              {/* Text side */}
              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-widest text-blue-100 uppercase backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Patient Portal
                </span>

                <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                  Welcome Back 👋
                </h1>
                <p className="mt-3 max-w-md text-base leading-relaxed text-blue-100/90">
                  Your health, beautifully organised. Manage appointments,
                  prescriptions, and your care journey — all in one place.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to="/doctors"
                    className="btn-primary inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-md"
                  >
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Find Doctors
                  </Link>
                  <Link
                    to="/patient/appointments"
                    className="btn-secondary inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm"
                  >
                    My Appointments
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Illustration */}
              <div className="mx-auto w-64 flex-shrink-0 md:mx-0 md:w-72 lg:w-80">
                <MedicalIllustration />
              </div>
            </div>
          </div>

          {/* ── STATS ────────────────────────────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card, i) => {
              const c = colorMap[card.color];
              return (
                <Link
                  key={card.key}
                  to={`/patient/appointments?status=${card.status}`}
                  className={`stat-card anim-fade-up delay-${i + 1} group rounded-2xl border bg-white p-6 shadow-sm ${c.accent}`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`rounded-xl p-2.5 ${c.iconBg} transition-transform duration-200 group-hover:scale-110`}
                    >
                      <svg
                        className={`h-5 w-5 ${c.icon}`}
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
                  <p className="mt-4 text-sm font-medium text-slate-500">
                    {card.label}
                  </p>
                  <h2
                    className={`mt-1 text-4xl font-extrabold tracking-tight ${c.num}`}
                  >
                    {dashboard[card.key] ?? 0}
                  </h2>
                </Link>
              );
            })}
          </div>

          {/* ── complete profile alert ────────────────────────────────────────────────────────── */}
          {isProfileIncomplete && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold text-amber-900">
                    Complete Your Profile
                  </h3>

                  <p className="mt-1 text-sm text-amber-700">
                    Add your gender and date of birth to complete your profile.
                  </p>
                </div>

                <Link
                  to="/patient/settings"
                  className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  Complete Now
                </Link>
              </div>
            </div>
          )}
          {/* ──  UPCOMING APPOINTMENTS ──────────────────────────────────────────── */}
          <div className="anim-fade-up delay-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2">
                  <svg
                    className="h-5 w-5 text-blue-600"
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
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  Upcoming Appointments
                </h2>
              </div>
              <Link
                to="/patient/appointments?status=upcoming"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
              >
                View All
                <svg
                  className="h-3.5 w-3.5"
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

            <div className="divide-y divide-slate-50 px-4 py-2 sm:px-6">
              {!dashboard.upcomingAppointmentList?.length ? (
                // ── Empty state ──────────────────────────────────────────
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="mb-4 rounded-3xl bg-blue-50 p-5">
                    <svg
                      className="h-14 w-14 text-blue-400"
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
                  <h3 className="text-lg font-semibold text-slate-800">
                    No Upcoming Appointments
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    You don't have any upcoming consultations scheduled. Book an
                    appointment with a specialist to get started.
                  </p>
                  <Link
                    to="/doctors"
                    className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Find Doctors
                  </Link>
                </div>
              ) : (
                // ── Appointment rows ─────────────────────────────────────
                dashboard.upcomingAppointmentList
                  .slice(0, 4)
                  .map((appointment) => {
                    const s = getStatus(appointment.status);
                    return (
                      <div
                        key={appointment._id}
                        className="appt-row flex flex-col gap-4 rounded-xl px-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <img
                              src={
                                appointment?.doctorId?.userId?.profilePicture
                              }
                              alt={appointment?.doctorId?.userId?.fullName}
                              className="h-12 w-12 rounded-2xl object-cover ring-2 ring-slate-100"
                            />
                            <span
                              className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${s.dot}`}
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-slate-800">
                              Dr. {appointment?.doctorId?.userId?.fullName}
                            </h3>
                            <p className="truncate text-sm text-slate-500">
                              {appointment?.doctorId?.department?.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-0.5">
                          <p className="text-sm font-medium text-slate-700">
                            {new Date(
                              appointment.appointmentDate,
                            ).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-xs text-slate-400">
                            {appointment.timeSlot}
                          </p>
                        </div>

                        <div className="flex-shrink-0">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${s.bg} ${s.text}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${s.dot}`}
                            />
                            {s.label}
                          </span>
                        </div>

                        <Link
                          to={`/patient/appointments/${appointment._id}`}
                          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          Details
                          <svg
                            className="h-3.5 w-3.5"
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
                    );
                  })
              )}
            </div>
          </div>

          {/* ── RECENT APPOINTMENTS ──────────────────────────────────────────── */}
          <div className="anim-fade-up delay-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2">
                  <svg
                    className="h-5 w-5 text-blue-600"
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
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  Recent Appointments
                </h2>
              </div>
              <Link
                to="/patient/appointments"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
              >
                View All
                <svg
                  className="h-3.5 w-3.5"
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

            <div className="divide-y divide-slate-50 px-4 py-2 sm:px-6">
              {dashboard.recentAppointments?.slice(0, 4).length === 0 && (
                <p className="py-10 text-center text-sm text-slate-400">
                  No recent appointments found.
                </p>
              )}
              {dashboard.recentAppointments?.slice(0, 4).map((appointment) => {
                const s = getStatus(appointment.status);
                return (
                  <div
                    key={appointment._id}
                    className="appt-row flex flex-col gap-4 rounded-xl px-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Doctor info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <img
                          src={appointment?.doctorId?.userId?.profilePicture}
                          alt={appointment?.doctorId?.userId?.fullName}
                          className="h-12 w-12 rounded-2xl object-cover ring-2 ring-slate-100"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${s.dot}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-800">
                          Dr. {appointment?.doctorId?.userId?.fullName}
                        </h3>
                        <p className="truncate text-sm text-slate-500">
                          {appointment?.doctorId?.department?.name}
                        </p>
                      </div>
                    </div>

                    {/* Date / time */}
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-0.5">
                      <p className="text-sm font-medium text-slate-700">
                        {new Date(
                          appointment.appointmentDate,
                        ).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {appointment.timeSlot}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${s.bg} ${s.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>

                    {/* View details */}
                    <Link
                      to={`/patient/appointments/${appointment._id}`}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      Details
                      <svg
                        className="h-3.5 w-3.5"
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
                );
              })}
            </div>
          </div>

          {/* ── QUICK ACTIONS ────────────────────────────────────────────────── */}
          <div className="anim-fade-up delay-6">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-800">
                Quick Actions
              </h2>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {quickActions.map((action) => {
                const c = actionColorMap[action.color];
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="action-card group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`rounded-xl p-3 ${c.bg} ${c.text} ${c.hover} transition-colors duration-200`}
                      >
                        {action.icon}
                      </div>
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
                    <h3 className="mt-4 font-bold text-slate-800">
                      {action.label}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 leading-snug">
                      {action.desc}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboardPage;
