import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { getDoctorDashboard } from '../../api/dashboard.api.js';
import Skeleton from '../../components/ui/Skeleton.jsx';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .dash-root { font-family: 'DM Sans', sans-serif; }
  .dash-root h1, .dash-root h2, .dash-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(-1deg); }
    50%       { transform: translateY(-10px) rotate(1deg); }
  }
  @keyframes pulseDot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.5; transform:scale(1.4); }
  }
  @keyframes spinSlow { from{transform:rotate(0)} to{transform:rotate(360deg)} }

  .anim-fade-up   { animation: fadeUp 0.55s ease both; }
  .delay-1 { animation-delay: 0.07s; }
  .delay-2 { animation-delay: 0.14s; }
  .delay-3 { animation-delay: 0.21s; }
  .delay-4 { animation-delay: 0.28s; }
  .delay-5 { animation-delay: 0.35s; }
  .delay-6 { animation-delay: 0.42s; }

  /* Illustration floats only on md+ */
  .hero-illustration { animation: float 5s ease-in-out infinite; }

  .stat-card {
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 36px rgba(0,0,0,0.09);
  }

  .action-card {
    transition: transform 0.22s ease, box-shadow 0.22s ease;
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
    box-shadow: 0 4px 20px rgba(13,148,136,0.1);
  }

  .btn-hero-primary {
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .btn-hero-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255,255,255,0.25);
  }
  .btn-hero-ghost {
    transition: transform 0.18s ease, background 0.18s ease;
  }
  .btn-hero-ghost:hover {
    transform: translateY(-2px);
    background: rgba(255,255,255,0.18);
  }

  /* Schedule info items */
  .schedule-item {
    transition: transform .2s ease, box-shadow .2s ease;
  }
  .schedule-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,.06);
  }

  /* Spin ring */
  .spin-ring { animation: spinSlow 22s linear infinite; }
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
  confirmed: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
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

/* ─── Avatar fallback ─────────────────────────────────────────────────────── */
const PALETTES = [
  { bg: '#f0fdfa', fg: '#0f766e', border: '#99f6e4' },
  { bg: '#ecfeff', fg: '#0e7490', border: '#a5f3fc' },
  { bg: '#eff6ff', fg: '#1d4ed8', border: '#bfdbfe' },
  { bg: '#fdf4ff', fg: '#7e22ce', border: '#e9d5ff' },
];
const PatientAvatar = ({ src, name = '', idx = 0, className = '' }) => {
  const [err, setErr] = useState(false);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  const p = PALETTES[idx % PALETTES.length];
  if (src && !err)
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        className={`object-cover ${className}`}
      />
    );
  return (
    <div
      className={`flex items-center justify-center font-bold text-base select-none ${className}`}
      style={{ background: p.bg, color: p.fg, border: `2px solid ${p.border}` }}
    >
      {initials || '?'}
    </div>
  );
};

/* ─── SVG Illustration ────────────────────────────────────────────────────── */
const DoctorIllustration = () => (
  <svg
    viewBox="0 0 300 240"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full hero-illustration"
    aria-hidden="true"
  >
    <ellipse
      cx="150"
      cy="130"
      rx="125"
      ry="105"
      fill="rgba(255,255,255,0.08)"
    />
    <ellipse cx="90" cy="80" rx="60" ry="48" fill="rgba(255,255,255,0.06)" />

    {/* Spinning outer ring */}
    <circle
      cx="150"
      cy="120"
      r="112"
      fill="none"
      stroke="rgba(255,255,255,.06)"
      strokeWidth="1.5"
      strokeDasharray="6 5"
      className="spin-ring"
    />

    {/* Clipboard */}
    <rect
      x="70"
      y="28"
      width="160"
      height="185"
      rx="14"
      fill="white"
      opacity="0.95"
    />
    <rect x="70" y="28" width="160" height="36" rx="14" fill="#0f766e" />
    <rect x="70" y="50" width="160" height="14" fill="#0f766e" />
    <rect x="120" y="20" width="60" height="22" rx="6" fill="#134e4a" />
    <rect x="130" y="25" width="40" height="10" rx="4" fill="#0f766e" />

    {/* Rx symbol */}
    <text
      x="90"
      y="48"
      fontFamily="serif"
      fontSize="14"
      fill="white"
      fontWeight="800"
      opacity=".85"
    >
      ℞
    </text>
    <text
      x="108"
      y="48"
      fontFamily="sans-serif"
      fontSize="7.5"
      fill="rgba(255,255,255,.75)"
      fontWeight="700"
    >
      PATIENT RECORD
    </text>

    {/* Lines */}
    <rect x="88" y="78" width="124" height="6" rx="3" fill="#e2e8f0" />
    <rect x="88" y="89" width="95" height="6" rx="3" fill="#e2e8f0" />
    <rect x="88" y="100" width="110" height="6" rx="3" fill="#e2e8f0" />
    <line
      x1="88"
      y1="118"
      x2="212"
      y2="118"
      stroke="#e2e8f0"
      strokeWidth="1.5"
    />

    {/* Patient rows */}
    <rect
      x="88"
      y="126"
      width="124"
      height="26"
      rx="7"
      fill="#f0fdf4"
      stroke="#99f6e4"
      strokeWidth="1"
    />
    <circle cx="101" cy="139" r="9" fill="#14b8a6" opacity=".25" />
    <circle cx="101" cy="139" r="5" fill="#0d9488" />
    <rect x="116" y="132" width="72" height="5.5" rx="2.5" fill="#5eead4" />
    <rect x="116" y="141" width="52" height="4.5" rx="2" fill="#ccfbf1" />

    <rect
      x="88"
      y="158"
      width="124"
      height="26"
      rx="7"
      fill="#ecfeff"
      stroke="#a5f3fc"
      strokeWidth="1"
    />
    <circle cx="101" cy="171" r="9" fill="#0891b2" opacity=".22" />
    <circle cx="101" cy="171" r="5" fill="#0891b2" />
    <rect x="116" y="164" width="68" height="5.5" rx="2.5" fill="#7dd3fc" />
    <rect x="116" y="173" width="48" height="4.5" rx="2" fill="#bae6fd" />

    {/* Mini chart */}
    <polyline
      points="88,202 102,193 116,203 130,189 144,198 158,191 172,200 186,188 200,196"
      fill="none"
      stroke="#0d9488"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Stethoscope */}
    <circle
      cx="260"
      cy="155"
      r="24"
      fill="rgba(255,255,255,.10)"
      stroke="rgba(255,255,255,.18)"
      strokeWidth="1"
    />
    <path
      d="M248,148 Q250,137 260,137 Q270,137 272,148"
      fill="none"
      stroke="white"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    <line
      x1="248"
      y1="148"
      x2="248"
      y2="163"
      stroke="white"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    <circle cx="248" cy="167" r="5" fill="white" opacity=".9" />

    {/* Pills */}
    <rect
      x="32"
      y="178"
      width="28"
      height="13"
      rx="6.5"
      fill="rgba(255,255,255,.22)"
    />
    <line
      x1="46"
      y1="178"
      x2="46"
      y2="191"
      stroke="rgba(255,255,255,.45)"
      strokeWidth="1.5"
    />
    <rect
      x="32"
      y="196"
      width="28"
      height="13"
      rx="6.5"
      fill="rgba(255,255,255,.16)"
    />
    <line
      x1="46"
      y1="196"
      x2="46"
      y2="209"
      stroke="rgba(255,255,255,.35)"
      strokeWidth="1.5"
    />

    {/* Cross */}
    <rect
      x="38"
      y="32"
      width="10"
      height="30"
      rx="4"
      fill="rgba(255,255,255,.28)"
    />
    <rect
      x="28"
      y="42"
      width="30"
      height="10"
      rx="4"
      fill="rgba(255,255,255,.28)"
    />
  </svg>
);

/* ─── Stat cards config ───────────────────────────────────────────────────── */
const statCards = [
  {
    key: 'todayAppointments',
    label: "Today's",
    color: 'teal',
    iconPath:
      'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    key: 'pendingAppointments',
    label: 'Pending',
    color: 'amber',
    iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    key: 'completedAppointments',
    label: 'Completed',
    color: 'green',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    key: 'totalPatients',
    label: 'Patients',
    color: 'purple',
    iconPath:
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
];
const colorMap = {
  teal: {
    icon: 'text-teal-600',
    iconBg: 'bg-teal-50',
    accent: 'border-teal-100',
    num: 'text-teal-700',
  },
  amber: {
    icon: 'text-amber-500',
    iconBg: 'bg-amber-50',
    accent: 'border-amber-100',
    num: 'text-amber-600',
  },
  green: {
    icon: 'text-green-600',
    iconBg: 'bg-green-50',
    accent: 'border-green-100',
    num: 'text-green-700',
  },
  purple: {
    icon: 'text-purple-600',
    iconBg: 'bg-purple-50',
    accent: 'border-purple-100',
    num: 'text-purple-700',
  },
};

/* ─── Quick Actions config ────────────────────────────────────────────────── */
const quickActions = [
  {
    to: '/doctor/appointments',
    label: 'Appointments',
    desc: 'Manage all patient appointments',
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
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    to: '/doctor/schedule',
    label: 'My Schedule',
    desc: 'Update availability and working hours',
    color: 'cyan',
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
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    to: '/doctor/prescriptions',
    label: 'Prescriptions',
    desc: 'Create and manage patient prescriptions',
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
];
const actionColorMap = {
  teal: {
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    hover: 'group-hover:bg-teal-100',
    arrow: 'text-teal-400',
  },
  cyan: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    hover: 'group-hover:bg-cyan-100',
    arrow: 'text-cyan-400',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    hover: 'group-hover:bg-indigo-100',
    arrow: 'text-indigo-400',
  },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const DoctorDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const response = await getDoctorDashboard();
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

  if (loading)
    return (
      <DashboardLayout>
        <Skeleton />
      </DashboardLayout>
    );
  if (!dashboard)
    return <div className="p-6 text-slate-500">Failed to load dashboard.</div>;

  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="dash-root min-h-screen bg-[#f0f5fb] px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-5 sm:space-y-7">
          {/* ══════════════════════════════════════════════════════
              HERO SECTION
              — Illustration hidden on mobile (<md), small on md,
                full-size on lg+
              ══════════════════════════════════════════════════════ */}
          <div className="anim-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 shadow-xl">
            {/* Grid texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            {/* Glow orbs */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white opacity-5" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-cyan-400 opacity-10 blur-3xl" />
            {/* Spinning ring — desktop only */}
            <div className="pointer-events-none absolute top-4 left-4 hidden h-16 w-16 opacity-20 lg:block">
              <svg viewBox="0 0 80 80" className="spin-ring w-full h-full">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="22"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                />
              </svg>
            </div>

            {/* ── Inner flex: text left, illustration right ── */}
            <div className="relative flex items-center justify-between gap-4 px-5 py-7 sm:px-8 sm:py-9 md:gap-6 lg:gap-8">
              {/* TEXT SIDE — always visible */}
              <div className="flex-1 min-w-0">
                {/* Eyebrow badge */}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold tracking-widest text-teal-100 uppercase backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Doctor Portal
                </span>

                {/* Heading — shorter on mobile */}
                <h1 className="mt-3 text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
                  Welcome Back,
                  <br className="hidden sm:block" />
                  <span className="text-teal-200"> Doctor 👨‍⚕️</span>
                </h1>

                {/* Subtitle — hidden on xs, visible sm+ */}
                <p className="mt-2 hidden max-w-md text-sm leading-relaxed text-teal-100/85 sm:block">
                  Manage appointments, prescriptions, schedules and patient
                  consultations — all from one place.
                </p>

                {/* CTA buttons */}
                <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
                  <Link
                    to="/doctor/appointments"
                    className="btn-hero-primary inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-teal-700 shadow-md sm:px-5 sm:py-2.5 sm:text-sm"
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Appointments
                  </Link>
                  <Link
                    to="/doctor/schedule"
                    className="btn-hero-ghost inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm sm:px-5 sm:py-2.5 sm:text-sm"
                  >
                    Schedule
                    <svg
                      className="h-3 w-3 sm:h-4 sm:w-4"
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

              {/* ILLUSTRATION
                  — Hidden on xs (<380px via overflow clipping)
                  — Small floating on sm/md (right-aligned, partial)
                  — Full on lg+                                          */}
              <div
                className="
                hidden
                sm:block
                sm:h-44 sm:w-44 sm:flex-shrink-0
                md:h-52 md:w-52
                lg:h-64 lg:w-72
                xl:w-80
                relative
              "
              >
                <DoctorIllustration />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              STAT CARDS
              — 2×2 on mobile (compact height)
              — 4 columns on xl
              ══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {statCards.map((card, i) => {
              const c = colorMap[card.color];
              return (
                <div
                  key={card.key}
                  className={`stat-card anim-fade-up delay-${i + 1} rounded-2xl border bg-white shadow-sm ${c.accent}`}
                >
                  {/* Mobile layout: horizontal compact */}
                  <div className="flex items-center gap-3 p-3.5 sm:hidden">
                    <div className={`flex-shrink-0 rounded-xl p-2 ${c.iconBg}`}>
                      <svg
                        className={`h-4 w-4 ${c.icon}`}
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
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-slate-500 truncate">
                        {card.label}
                      </p>
                      <h2
                        className={`text-2xl font-extrabold tracking-tight leading-none mt-0.5 ${c.num}`}
                      >
                        {dashboard[card.key] ?? 0}
                      </h2>
                    </div>
                  </div>

                  {/* sm+ layout: original vertical */}
                  <div className="hidden sm:block p-5 sm:p-6">
                    <div className={`inline-flex rounded-xl p-2.5 ${c.iconBg}`}>
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
                    <p className="mt-4 text-sm font-medium text-slate-500">
                      {card.label}
                    </p>
                    <h2
                      className={`mt-1 text-4xl font-extrabold tracking-tight ${c.num}`}
                    >
                      {dashboard[card.key] ?? 0}
                    </h2>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ══════════════════════════════════════════════════════
              TODAY'S SCHEDULE
              ══════════════════════════════════════════════════════ */}
          <div className="anim-fade-up delay-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="rounded-xl bg-teal-50 p-2">
                  <svg
                    className="h-4 w-4 text-teal-600 sm:h-5 sm:w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-800 sm:text-lg">
                  Today's Schedule
                </h2>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  dashboard?.todaySchedule?.isAvailable
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    dashboard?.todaySchedule?.isAvailable
                      ? 'bg-green-500 animate-pulse'
                      : 'bg-red-400'
                  }`}
                />
                {dashboard?.todaySchedule?.isAvailable
                  ? 'Available'
                  : 'Unavailable'}
              </span>
            </div>

            <div className="px-4 py-4 sm:px-6 sm:py-6">
              {dashboard?.todaySchedule ? (
                /* Schedule info grid — 1 col on mobile, 3 on sm+ */
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: 'Working Hours',
                      value: `${dashboard.todaySchedule.startTime} – ${dashboard.todaySchedule.endTime}`,
                      iconBg: 'bg-teal-50',
                      iconColor: 'text-teal-600',
                      path: 'M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.36l-.71.71M5.64 18.36l-.71.71m12.73 0l-.71-.71M5.64 5.64l-.71-.71M12 6a6 6 0 100 12A6 6 0 0012 6z',
                    },
                    {
                      label: 'Slot Duration',
                      value: `${dashboard.todaySchedule.slotDuration} mins`,
                      iconBg: 'bg-blue-50',
                      iconColor: 'text-blue-600',
                      path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
                    },
                    {
                      label: 'Break Time',
                      value: `${dashboard.todaySchedule.breakStart} – ${dashboard.todaySchedule.breakEnd}`,
                      iconBg: 'bg-amber-50',
                      iconColor: 'text-amber-500',
                      path: 'M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M6.343 6.343a9 9 0 000 12.728',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="schedule-item flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:p-4"
                    >
                      <div
                        className={`flex-shrink-0 rounded-xl p-2 sm:p-2.5 ${item.iconBg}`}
                      >
                        <svg
                          className={`h-4 w-4 sm:h-5 sm:w-5 ${item.iconColor}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={item.path}
                          />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500 truncate">
                          {item.label}
                        </p>
                        <h3 className="mt-0.5 text-sm font-bold text-slate-800 truncate sm:text-base">
                          {item.value}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty schedule state */
                <div className="flex flex-col items-center justify-center py-10 text-center sm:py-12">
                  <div className="mb-4 rounded-3xl bg-teal-50 p-4 sm:p-5">
                    <svg
                      className="h-10 w-10 text-teal-400 sm:h-12 sm:w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 sm:text-lg">
                    No Schedule Found
                  </h3>
                  <p className="mt-2 max-w-xs text-xs text-slate-500 sm:max-w-sm sm:text-sm">
                    You haven't set your availability for today. Create your
                    schedule to start accepting appointments.
                  </p>
                  <Link
                    to="/doctor/schedule"
                    className="mt-5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700"
                  >
                    Set Up Schedule
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              UPCOMING APPOINTMENTS
              ══════════════════════════════════════════════════════ */}
          <div className="anim-fade-up delay-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="rounded-xl bg-teal-50 p-2">
                  <svg
                    className="h-4 w-4 text-teal-600 sm:h-5 sm:w-5"
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
                <h2 className="text-base font-bold text-slate-800 sm:text-lg">
                  Upcoming Appointments
                </h2>
              </div>
              <Link
                to="/doctor/appointments"
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-50 sm:px-3 sm:text-sm"
              >
                View All
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

            <div className="divide-y divide-slate-50 px-3 py-2 sm:px-6">
              {!dashboard.upcomingAppointments?.length ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 rounded-3xl bg-teal-50 p-4 sm:p-5">
                    <svg
                      className="h-10 w-10 text-teal-400 sm:h-14 sm:w-14"
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
                  <h3 className="text-base font-semibold text-slate-800 sm:text-lg">
                    No Upcoming Appointments
                  </h3>
                  <p className="mt-2 max-w-xs text-xs text-slate-500 sm:max-w-sm sm:text-sm">
                    You're all caught up. New appointments will appear here once
                    patients book with you.
                  </p>
                </div>
              ) : (
                dashboard.upcomingAppointments
                  .slice(0, 5)
                  .map((appointment, idx) => {
                    const s = getStatus(appointment.status);
                    return (
                      <div
                        key={appointment._id}
                        className="appt-row rounded-xl px-1 py-3 sm:px-2 sm:py-4"
                      >
                        {/* ── Mobile layout: stacked ── */}
                        <div className="flex items-center gap-3 sm:hidden">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="h-10 w-10 overflow-hidden rounded-xl ring-2 ring-slate-100">
                              <PatientAvatar
                                src={
                                  appointment?.patientId?.userId?.profilePicture
                                }
                                name={
                                  appointment?.patientId?.userId?.fullName || ''
                                }
                                idx={idx}
                                className="h-full w-full rounded-xl"
                              />
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${s.dot}`}
                            />
                          </div>
                          {/* Name + date */}
                          <div className="flex-1 min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-800">
                              {appointment?.patientId?.userId?.fullName}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {new Date(
                                appointment.appointmentDate,
                              ).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                              })}
                              {' · '}
                              {appointment.timeSlot}
                            </p>
                          </div>
                          {/* Status + link */}
                          <div className="flex flex-col items-end gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${s.bg} ${s.text}`}
                            >
                              <span
                                className={`h-1 w-1 rounded-full ${s.dot}`}
                              />
                              {s.label}
                            </span>
                            <Link
                              to={`/doctor/appointments/${appointment._id}`}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                            >
                              Details →
                            </Link>
                          </div>
                        </div>

                        {/* ── sm+ layout: horizontal row ── */}
                        <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                          {/* Patient info */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="relative flex-shrink-0">
                              <div className="h-12 w-12 overflow-hidden rounded-2xl ring-2 ring-slate-100">
                                <PatientAvatar
                                  src={
                                    appointment?.patientId?.userId
                                      ?.profilePicture
                                  }
                                  name={
                                    appointment?.patientId?.userId?.fullName ||
                                    ''
                                  }
                                  idx={idx}
                                  className="h-full w-full rounded-2xl"
                                />
                              </div>
                              <span
                                className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${s.dot}`}
                              />
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate font-semibold text-slate-800">
                                {appointment?.patientId?.userId?.fullName}
                              </h3>
                              <p className="truncate text-sm text-slate-500">
                                {appointment?.patientId?.userId?.email}
                              </p>
                            </div>
                          </div>
                          {/* Date / time */}
                          <div className="flex-shrink-0 text-right">
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
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${s.dot}`}
                              />
                              {s.label}
                            </span>
                          </div>
                          {/* Details link */}
                          <Link
                            to={`/doctor/appointments/${appointment._id}`}
                            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
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
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              QUICK ACTIONS
              — 1 col on mobile, 3 on sm+
              ══════════════════════════════════════════════════════ */}
          <div className="anim-fade-up delay-6">
            <div className="mb-3 flex items-center gap-3 sm:mb-4">
              <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
                Quick Actions
              </h2>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              {quickActions.map((action) => {
                const c = actionColorMap[action.color];
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="action-card group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`rounded-xl p-2.5 sm:p-3 ${c.bg} ${c.text} ${c.hover} transition-colors duration-200`}
                      >
                        {action.icon}
                      </div>
                      <svg
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${c.arrow} transition-transform duration-200 group-hover:translate-x-1`}
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
                    <h3 className="mt-3 text-sm font-bold text-slate-800 sm:mt-4 sm:text-base">
                      {action.label}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 leading-snug sm:mt-1 sm:text-sm">
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

export default DoctorDashboardPage;
