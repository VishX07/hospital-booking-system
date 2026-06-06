/**
 * ============================================================
 *  AppointmentsPage.jsx  — Patient Appointments
 *
 *  Sections:
 *   1. Styles & Keyframes
 *   2. Utility helpers (status config, avatar fallback)
 *   3. Hero Illustration SVG
 *   4. Stat Cards
 *   5. Filter Chips
 *   6. Skeleton Loader
 *   7. Appointment Card
 *   8. Empty State
 *   9. Cancel Modal
 *  10. Main Page Component
 * ============================================================
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import {
  getMyAppointments,
  cancelAppointment,
} from '../../api/appointment.api.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';

/* ================================================================
   1. STYLES & KEYFRAMES
   ================================================================ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .appts-root { font-family: 'DM Sans', sans-serif; }
  .appts-root h1,.appts-root h2,.appts-root h3 { font-family: 'Sora', sans-serif; }

  /* ── Animation keyframes ── */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes float1 {
    0%,100% { transform:translateY(0) rotate(-1.5deg); }
    50%      { transform:translateY(-12px) rotate(1.5deg); }
  }
  @keyframes float2 {
    0%,100% { transform:translateY(0) rotate(1deg); }
    50%      { transform:translateY(-8px) rotate(-1deg); }
  }
  @keyframes float3 {
    0%,100% { transform:translateY(0); }
    50%      { transform:translateY(-6px); }
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.5; transform:scale(1.5); }
  }
  @keyframes spin-slow { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes shimmer {
    0%   { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  @keyframes modalIn {
    from { opacity:0; transform:scale(.95) translateY(12px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes overlayIn { from{opacity:0} to{opacity:1} }
  @keyframes cardIn {
    from { opacity:0; transform:translateY(18px) scale(.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  /* ── Animation utility classes ── */
  .anim-fade-up { animation:fadeUp .55s ease both; }
  .d1{animation-delay:.06s} .d2{animation-delay:.12s} .d3{animation-delay:.18s}
  .d4{animation-delay:.24s} .d5{animation-delay:.30s} .d6{animation-delay:.36s}

  .float-1 { animation:float1 5.5s ease-in-out infinite; }
  .float-2 { animation:float2 4.8s ease-in-out infinite .7s; }
  .float-3 { animation:float3 6.2s ease-in-out infinite 1.3s; }
  .pulse-dot { animation:pulse-dot 2s ease-in-out infinite; }
  .spin-slow  { animation:spin-slow 22s linear infinite; }

  /* ── Appointment card ── */
  .appt-card {
    transition: transform .25s cubic-bezier(.34,1.2,.64,1), box-shadow .25s ease;
  }
  .appt-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 50px rgba(29,78,216,.12);
  }

  /* ── Glass panel (used inside cards) ── */
  .glass-panel {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.75);
  }

  /* ── Stat card ── */
  .stat-card {
    transition: transform .22s ease, box-shadow .22s ease;
  }
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 36px rgba(0,0,0,.09);
  }

  /* ── Filter chip ── */
  .filter-chip {
    transition: all .18s ease;
  }
  .filter-chip:hover:not(.chip-active) {
    transform: translateY(-1px);
  }
  .chip-active {
    background: #2563eb !important;
    color: white !important;
    border-color: #2563eb !important;
    box-shadow: 0 4px 16px rgba(37,99,235,.3);
    transform: translateY(-1px);
  }

  /* ── Action buttons ── */
  .btn-action {
    transition: all .18s ease;
  }
  .btn-action:hover { transform:translateY(-2px); }

  /* ── Cancel modal ── */
  .modal-overlay { animation: overlayIn .2s ease both; }
  .modal-panel    { animation: modalIn .3s cubic-bezier(.34,1.2,.64,1) both; }

  /* ── Input focus ── */
  .rx-input:focus {
    outline:none;
    border-color:#3b82f6;
    box-shadow:0 0 0 3px rgba(59,130,246,.15);
    background:white;
  }

  /* ── Skeleton shimmer ── */
  .shimmer-bg {
    background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  /* ── Card entry animation (staggered via inline delay) ── */
  .card-entry { animation: cardIn .5s ease both; }
`;

/* ================================================================
   2. UTILITY HELPERS
   ================================================================ */

/* Status visual config — centralized so every component shares it */
const STATUS_CONFIG = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    border: 'border-amber-100',
    cardBg: 'from-amber-50/60',
  },
  confirmed: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    border: 'border-emerald-100',
    cardBg: 'from-emerald-50/60',
  },
  completed: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-100',
    cardBg: 'from-blue-50/60',
  },
  cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-400',
    border: 'border-red-100',
    cardBg: 'from-red-50/40',
  },
  rejected: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    border: 'border-slate-200',
    cardBg: 'from-slate-50/60',
  },
};
const getStatus = (s = '') =>
  STATUS_CONFIG[s.toLowerCase()] ?? STATUS_CONFIG.rejected;

/* Avatar fallback palettes */
const AVATAR_PALETTES = [
  { bg: '#eff6ff', fg: '#1d4ed8', border: '#bfdbfe' },
  { bg: '#eef2ff', fg: '#4338ca', border: '#c7d2fe' },
  { bg: '#f0fdfa', fg: '#0f766e', border: '#99f6e4' },
  { bg: '#fdf4ff', fg: '#7e22ce', border: '#e9d5ff' },
  { bg: '#fff7ed', fg: '#c2410c', border: '#fed7aa' },
];

/* Doctor avatar with graceful image-error fallback */
const DoctorAvatar = ({ src, name = '', idx = 0, className = '' }) => {
  const [err, setErr] = useState(false);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  const p = AVATAR_PALETTES[idx % AVATAR_PALETTES.length];
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
      className={`flex items-center justify-center font-bold text-lg select-none ${className}`}
      style={{ background: p.bg, color: p.fg, border: `2px solid ${p.border}` }}
    >
      {initials || (
        <svg
          className="h-6 w-6 opacity-40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
          />
        </svg>
      )}
    </div>
  );
};

/* ================================================================
   3. HERO ILLUSTRATION
   Floating SVG calendar/medical scene with badge overlays.
   ================================================================ */
const HeroIllustration = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    {/* ── Main SVG scene ── */}
    <svg
      viewBox="0 0 300 250"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity=".9" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00b4d8" />
          <stop offset="100%" stopColor="#2196f3" />
        </linearGradient>
      </defs>

      {/* Outer decorative ring */}
      <circle
        cx="150"
        cy="125"
        r="115"
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        className="spin-slow"
      />

      {/* Main calendar widget */}
      <rect
        x="55"
        y="35"
        width="190"
        height="175"
        rx="18"
        fill="white"
        opacity=".95"
      />
      {/* Calendar header */}
      <rect
        x="55"
        y="35"
        width="190"
        height="40"
        rx="18"
        fill="url(#calGrad)"
      />
      <rect x="55" y="57" width="190" height="18" fill="url(#calGrad)" />
      {/* Header text */}
      <text
        x="150"
        y="52"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="10"
        fill="white"
        fontWeight="700"
        opacity=".9"
      >
        JUNE 2026
      </text>
      {/* Day labels */}
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
        <text
          key={i}
          x={72 + i * 26}
          y="90"
          textAnchor="middle"
          fontFamily="sans-serif"
          fontSize="8"
          fill="#94a3b8"
          fontWeight="600"
        >
          {d}
        </text>
      ))}
      {/* Date grid */}
      {[
        [1, 2, 3, 4, 5, 6, 7],
        [8, 9, 10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19, 20, 21],
        [22, 23, 24, 25, 26, 27, 28],
      ].map((row, ri) =>
        row.map((day, ci) => {
          const isToday = day === 2;
          const hasAppt = [5, 10, 14, 19, 24].includes(day);
          return (
            <g key={`${ri}-${ci}`}>
              {isToday && (
                <circle
                  cx={72 + ci * 26}
                  cy={106 + ri * 22}
                  r="11"
                  fill="#3b82f6"
                  opacity=".9"
                />
              )}
              {hasAppt && !isToday && (
                <circle
                  cx={72 + ci * 26}
                  cy={106 + ri * 22}
                  r="11"
                  fill="#eff6ff"
                  stroke="#bfdbfe"
                  strokeWidth="1"
                />
              )}
              <text
                x={72 + ci * 26}
                y={110 + ri * 22}
                textAnchor="middle"
                fontFamily="sans-serif"
                fontSize="9"
                fill={isToday ? 'white' : hasAppt ? '#1d4ed8' : '#334155'}
                fontWeight={isToday || hasAppt ? '700' : '400'}
              >
                {day}
              </text>
              {/* Appointment dot indicator */}
              {hasAppt && (
                <circle
                  cx={72 + ci * 26}
                  cy={118 + ri * 22}
                  r="2"
                  fill="#3b82f6"
                />
              )}
            </g>
          );
        }),
      )}

      {/* Stethoscope top-right decoration */}
      <circle
        cx="248"
        cy="68"
        r="24"
        fill="rgba(255,255,255,0.1)"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />
      <path
        d="M237,61 Q239,50 248,50 Q257,50 259,61"
        fill="none"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <line
        x1="237"
        y1="61"
        x2="237"
        y2="75"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle
        cx="237"
        cy="79"
        r="5.5"
        fill="none"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="2.8"
      />
      <circle cx="237" cy="79" r="2.5" fill="rgba(255,255,255,0.45)" />

      {/* Pills bottom-left */}
      <rect
        x="28"
        y="170"
        width="26"
        height="12"
        rx="6"
        fill="rgba(255,255,255,0.25)"
      />
      <line
        x1="41"
        y1="170"
        x2="41"
        y2="182"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.5"
      />
      <rect
        x="28"
        y="188"
        width="26"
        height="12"
        rx="6"
        fill="rgba(255,255,255,0.18)"
      />
      <line
        x1="41"
        y1="188"
        x2="41"
        y2="200"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />

      {/* Medical cross top-left */}
      <rect
        x="34"
        y="42"
        width="9"
        height="26"
        rx="4"
        fill="rgba(255,255,255,0.28)"
      />
      <rect
        x="25"
        y="51"
        width="27"
        height="9"
        rx="4"
        fill="rgba(255,255,255,0.28)"
      />
    </svg>

    {/* ── Floating badge: Upcoming ── */}
    <svg
      viewBox="0 0 118 42"
      xmlns="http://www.w3.org/2000/svg"
      className="float-2 absolute top-2 right-0 w-28"
      aria-hidden="true"
    >
      <rect width="118" height="42" rx="12" fill="white" opacity=".95" />
      <rect
        width="118"
        height="42"
        rx="12"
        fill="none"
        stroke="#bfdbfe"
        strokeWidth="1"
      />
      <circle cx="20" cy="21" r="10" fill="#eff6ff" />
      <text
        x="19"
        y="24"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="10"
        fill="#3b82f6"
        fontWeight="800"
      >
        ↑
      </text>
      <text
        x="36"
        y="17"
        fontFamily="sans-serif"
        fontSize="7"
        fill="#64748b"
        fontWeight="600"
      >
        UPCOMING
      </text>
      <text
        x="36"
        y="30"
        fontFamily="sans-serif"
        fontSize="11"
        fill="#1d4ed8"
        fontWeight="800"
      >
        Today
      </text>
    </svg>

    {/* ── Floating badge: Confirmed ── */}
    <svg
      viewBox="0 0 112 38"
      xmlns="http://www.w3.org/2000/svg"
      className="float-3 absolute bottom-8 left-0 w-28"
      aria-hidden="true"
    >
      <rect width="112" height="38" rx="11" fill="white" opacity=".92" />
      <rect
        width="112"
        height="38"
        rx="11"
        fill="none"
        stroke="#bbf7d0"
        strokeWidth="1"
      />
      <circle cx="18" cy="19" r="9" fill="#dcfce7" />
      <path
        d="M13,19 l4,4 7-7"
        stroke="#16a34a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <text
        x="32"
        y="15"
        fontFamily="sans-serif"
        fontSize="7.5"
        fill="#15803d"
        fontWeight="700"
      >
        CONFIRMED
      </text>
      <text x="32" y="28" fontFamily="sans-serif" fontSize="7" fill="#64748b">
        Appointment Set
      </text>
    </svg>

    {/* ── Floating badge: Active dot ── */}
    <svg
      viewBox="0 0 96 34"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute top-16 left-1 w-24"
      style={{ animationDelay: '1.1s' }}
      aria-hidden="true"
    >
      <rect width="96" height="34" rx="10" fill="white" opacity=".9" />
      <rect
        width="96"
        height="34"
        rx="10"
        fill="none"
        stroke="#e0f2fe"
        strokeWidth="1"
      />
      <circle cx="14" cy="17" r="4.5" fill="#22c55e" className="pulse-dot" />
      <text
        x="25"
        y="13"
        fontFamily="sans-serif"
        fontSize="7"
        fill="#0f172a"
        fontWeight="700"
      >
        ONLINE
      </text>
      <text x="25" y="25" fontFamily="sans-serif" fontSize="6.5" fill="#64748b">
        Available now
      </text>
    </svg>
  </div>
);

/* ================================================================
   4. STAT CARDS
   Summary numbers shown inside the hero.
   ================================================================ */
const STAT_DEFS = [
  {
    key: 'total',
    label: 'Total',
    icon: 'M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6.75V19.5A1.5 1.5 0 004.5 21z',
    color: 'blue',
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z',
    color: 'amber',
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'emerald',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: 'M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-4.5',
    color: 'blue',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    icon: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'red',
  },
];
const STAT_COLOR = {
  blue: { iconBg: 'bg-blue-100', icon: 'text-blue-600', num: 'text-blue-700' },
  amber: {
    iconBg: 'bg-amber-100',
    icon: 'text-amber-600',
    num: 'text-amber-600',
  },
  emerald: {
    iconBg: 'bg-emerald-100',
    icon: 'text-emerald-600',
    num: 'text-emerald-700',
  },
  red: { iconBg: 'bg-red-100', icon: 'text-red-500', num: 'text-red-600' },
};

const StatCards = ({ appointments }) => {
  const counts = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };
  return (
    <div
      className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide"
      style={{ scrollbarWidth: 'none' }}
    >
      {' '}
      {STAT_DEFS.map((s, i) => {
        const c = STAT_COLOR[s.color];
        return (
          <div
            key={s.key}
            className={`stat-card glass-panel rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-[90px] sm:min-w-[110px] anim-fade-up d${i + 1}`}
          >
            <div
              className={`rounded-lg sm:rounded-xl p-1.5 sm:p-2 ${c.iconBg} flex-shrink-0`}
            >
              <svg
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${c.icon}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-blue-200">
                {s.label}
              </p>
              <p
                className={`text-base sm:text-xl font-extrabold text-white mt-0`}
              >
                {counts[s.key]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ================================================================
   5. FILTER CHIPS
   ================================================================ */
const FILTERS = [
  'all',
  'upcoming',
  'history',
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'rejected',
];

const FilterChips = ({ active, onChange }) => (
  /* Glass panel container */
  <div
    className="anim-fade-up d2 glass-panel rounded-2xl p-3 shadow-sm"
    style={{
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(16px)',
    }}
  >
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`filter-chip rounded-full border px-4 py-1.5 text-sm font-semibold capitalize
            ${
              active === f
                ? 'chip-active'
                : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'
            }`}
        >
          {f}
        </button>
      ))}
    </div>
  </div>
);

/* ================================================================
   6. SKELETON LOADER
   ================================================================ */
const SkeletonCard = () => (
  <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
    <div className="flex items-center gap-4 mb-5">
      <div className="shimmer-bg h-16 w-16 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="shimmer-bg h-4 w-48 rounded-full" />
        <div className="shimmer-bg h-3 w-32 rounded-full" />
        <div className="shimmer-bg h-5 w-20 rounded-full mt-1" />
      </div>
      <div className="shimmer-bg h-10 w-20 rounded-2xl" />
    </div>
    <div className="grid grid-cols-3 gap-2 mb-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="shimmer-bg h-14 rounded-2xl" />
      ))}
    </div>
    <div className="shimmer-bg h-3 w-full rounded-full mb-1" />
    <div className="shimmer-bg h-3 w-3/4 rounded-full" />
    <div className="flex gap-2 mt-5">
      <div className="shimmer-bg h-10 flex-1 rounded-2xl" />
      <div className="shimmer-bg h-10 flex-1 rounded-2xl" />
    </div>
  </div>
);

/* ================================================================
   7. APPOINTMENT CARD
   ================================================================ */
const AppointmentCard = ({ appointment, index, onCancelClick }) => {
  const s = getStatus(appointment.status);
  const docName = appointment?.doctorId?.userId?.fullName || '';
  const docPhoto = appointment?.doctorId?.userId?.profilePicture;
  const deptName = appointment?.doctorId?.department?.name || '';
  const apptDate = appointment?.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : '—';

  const canCancel = ['pending', 'confirmed'].includes(appointment.status);

  return (
    <div
      className={`appt-card card-entry rounded-3xl border bg-white shadow-sm overflow-hidden ${s.border}`}
      style={{ animationDelay: `${0.05 + (index % 8) * 0.07}s` }}
    >
      {/* ── Card top strip (status-tinted) ── */}
      <div
        className={`bg-gradient-to-r ${s.cardBg} to-transparent px-5 pt-4 pb-3 border-b ${s.border}`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Doctor info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="h-14 w-14 overflow-hidden rounded-2xl ring-2 ring-white shadow">
                <DoctorAvatar
                  src={docPhoto}
                  name={docName}
                  idx={index}
                  className="h-full w-full rounded-2xl"
                />
              </div>
              {/* Online dot for confirmed */}
              {appointment.status === 'confirmed' && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white pulse-dot" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 truncate">
                Dr. {docName}
              </h3>
              <p className="text-sm text-blue-600 font-medium truncate">
                {deptName}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${s.bg} ${s.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            <span className="capitalize">{appointment.status}</span>
          </span>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="px-5 py-4">
        {/* Meta fields — 3 glass pills */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            {
              label: 'Date',
              val: apptDate,
              icon: 'M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6.75V19.5A1.5 1.5 0 004.5 21z',
            },
            {
              label: 'Time',
              val: appointment.timeSlot || '—',
              icon: 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z',
            },
            {
              label: 'Type',
              val: appointment.consultationType,
              icon: 'M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z',
            },
          ].map((f) => (
            <div
              key={f.label}
              className="glass-panel rounded-2xl px-2.5 py-2.5 text-center"
              style={{ background: 'rgba(248,250,252,0.8)' }}
            >
              <svg
                className="h-3.5 w-3.5 text-blue-400 mx-auto mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
              </svg>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
                {f.label}
              </p>
              <p className="text-xs font-bold text-slate-800 leading-tight capitalize truncate">
                {f.val || '—'}
              </p>
            </div>
          ))}
        </div>

        {/* Fee row (if present) */}
        {appointment.amount && (
          <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-3.5 py-2.5 mb-3">
            <span className="text-xs font-semibold text-blue-500">
              Consultation Fee
            </span>
            <span className="text-base font-extrabold text-blue-700">
              ₹{appointment.amount}
            </span>
          </div>
        )}

        {/* Reason for visit */}
        {appointment.reasonForVisit && (
          <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3.5 py-2.5 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Reason for Visit
            </p>
            <p className="text-sm text-slate-700 leading-snug line-clamp-2">
              {appointment.reasonForVisit}
            </p>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="flex gap-2.5">
          <Link
            to={`/patient/appointments/${appointment._id}`}
            className="btn-action flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50"
          >
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
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Details
          </Link>

          {canCancel && (
            <button
              onClick={() => onCancelClick(appointment._id)}
              className="btn-action flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-red-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700"
              style={{ transition: 'all .18s ease' }}
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   8. EMPTY STATE
   ================================================================ */
const EmptyState = ({ filter }) => (
  <div className="col-span-2 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 py-20 text-center shadow-sm backdrop-blur-sm">
    {/* Mini SVG illustration */}
    <svg
      viewBox="0 0 120 100"
      xmlns="http://www.w3.org/2000/svg"
      className="float-2 mb-5 w-28"
      aria-hidden="true"
    >
      <ellipse cx="60" cy="88" rx="46" ry="10" fill="#e2e8f0" />
      <rect x="22" y="18" width="76" height="68" rx="14" fill="#f1f5f9" />
      <rect
        x="22"
        y="18"
        width="76"
        height="24"
        rx="14"
        fill="#3b82f6"
        opacity=".2"
      />
      <rect x="35" y="52" width="50" height="6" rx="3" fill="#e2e8f0" />
      <rect x="35" y="62" width="38" height="6" rx="3" fill="#e2e8f0" />
      <rect x="35" y="72" width="44" height="6" rx="3" fill="#e2e8f0" />
      <circle
        cx="85"
        cy="75"
        r="18"
        fill="#f0fdf4"
        stroke="#86efac"
        strokeWidth="2"
      />
      <text
        x="85"
        y="80"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="16"
        fill="#16a34a"
      >
        📅
      </text>
    </svg>
    <h3 className="text-xl font-bold text-slate-800">No Appointments Found</h3>
    <p className="mt-2 max-w-xs text-sm text-slate-500">
      {filter === 'all'
        ? "You haven't booked any appointments yet. Find a doctor and get started."
        : `No ${filter} appointments to show right now.`}
    </p>
    <Link
      to="/doctors"
      className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 hover:-translate-y-0.5"
      style={{ transition: 'all .18s ease' }}
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
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      Find a Doctor
    </Link>
  </div>
);

/* ================================================================
   9. CANCEL MODAL
   A polished glass modal with red accent header.
   ================================================================ */
const CancelModal = ({ open, reason, onChange, onClose, onConfirm }) => {
  if (!open) return null;
  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(10,22,40,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(0,0,0,.3)]">
        {/* Modal header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM10.29 3.86L1.82 18a1.875 1.875 0 001.61 2.85h17.14A1.875 1.875 0 0022.18 18L13.71 3.86a1.875 1.875 0 00-3.42 0z"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">
                Cancel Appointment
              </h2>
              <p className="text-sm text-red-100">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => onChange(e.target.value)}
              rows={4}
              placeholder="Please describe why you're cancelling this appointment…"
              className="rx-input w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-1">
            <button
              onClick={onClose}
              className="btn-action inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Keep Appointment
            </button>
            <button
              onClick={onConfirm}
              className="btn-action inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 text-sm font-bold text-white shadow-lg shadow-red-900/20 hover:bg-red-700"
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
              Confirm Cancellation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   10. MAIN PAGE COMPONENT
   ================================================================ */
const AppointmentsPage = () => {
  /* ── State ── */
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  /* ── Sync filter from URL search params ── */
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const s = searchParams.get('status');
    const t = searchParams.get('type');
    if (s) setStatusFilter(s);
    else if (t) setStatusFilter(t);
  }, [searchParams]);

  /* ── Fetch appointments (re-runs on filter change) ── */
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const query =
        statusFilter === 'all'
          ? ''
          : statusFilter === 'upcoming'
            ? 'type=upcoming'
            : statusFilter === 'history'
              ? 'type=history'
              : `status=${statusFilter}`;
      const res = await getMyAppointments(query);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to load appointments',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  /* ── Cancel handlers ── */
  const openCancelModal = (id) => {
    setSelectedApptId(id);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleCancelAppointment = async () => {
    if (!cancelReason.trim())
      return toast.error('Please enter a cancellation reason');
    try {
      await cancelAppointment(selectedApptId, { cancelReason });
      toast.success('Appointment cancelled successfully');
      setCancelModalOpen(false);
      setCancelReason('');
      setSelectedApptId(null);
      fetchAppointments();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to cancel appointment',
      );
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="appts-root min-h-screen bg-[#f0f5fb] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* ============================================================
              HERO SECTION
              Dark gradient banner with illustration + stat pills.
              ============================================================ */}
          <div className="anim-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 shadow-2xl">
            {/* Subtle grid texture */}
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
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-indigo-300 opacity-10 blur-3xl" />
            {/* Spinning decorative ring (desktop only) */}
            <div className="pointer-events-none absolute top-4 left-4 hidden h-20 w-20 opacity-20 lg:block">
              <svg viewBox="0 0 80 80" className="spin-slow w-full h-full">
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

            <div className="relative flex flex-col gap-8 px-8 py-10 md:flex-row md:items-center md:px-10">
              {/* Left — text + stat pills */}
              <div className="flex-1">
                {/* Breadcrumb pill */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-100 backdrop-blur-sm">
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
                      d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6.75V19.5A1.5 1.5 0 004.5 21z"
                    />
                  </svg>
                  My Appointments
                </div>

                <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                  Your Health
                  <br />
                  <span className="text-blue-200">Journey Awaits</span>
                </h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-100/85">
                  Track consultations, manage bookings, and stay on top of your
                  healthcare — all from one place.
                </p>

                {/* Stat pills — only after data loads */}
                {!loading && <StatCards appointments={appointments} />}
              </div>

              {/* Right — animated illustration */}
              <div className="hidden md:block md:h-52 md:w-56 lg:h-72 lg:w-80 flex-shrink-0 relative">
                <HeroIllustration />
              </div>
            </div>
          </div>

          {/* ============================================================
              FILTER CHIPS
              ============================================================ */}
          <FilterChips active={statusFilter} onChange={setStatusFilter} />

          {/* ============================================================
              RESULTS LABEL
              ============================================================ */}
          {!loading && appointments.length > 0 && (
            <div className="anim-fade-up d3 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-blue-50 p-2">
                  <svg
                    className="h-4 w-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6.75V19.5A1.5 1.5 0 004.5 21z"
                    />
                  </svg>
                </div>
                <span className="font-bold text-slate-800">
                  {appointments.length} appointment
                  {appointments.length !== 1 ? 's' : ''}
                </span>
                {statusFilter !== 'all' && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 capitalize">
                    {statusFilter}
                  </span>
                )}
              </div>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          )}

          {/* ============================================================
              CONTENT — Skeletons / Empty / Cards
              ============================================================ */}
          {loading ? (
            /* Skeleton grid */
            <div className="grid gap-5 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            /* Empty state */
            <div className="grid lg:grid-cols-2">
              <EmptyState filter={statusFilter} />
            </div>
          ) : (
            /* Appointment card grid */
            <div className="grid gap-5 lg:grid-cols-2">
              {appointments.map((appt, i) => (
                <AppointmentCard
                  key={appt._id}
                  appointment={appt}
                  index={i}
                  onCancelClick={openCancelModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          CANCEL MODAL (portal-like, fixed overlay)
          ============================================================ */}
      <CancelModal
        open={cancelModalOpen}
        reason={cancelReason}
        onChange={setCancelReason}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelAppointment}
      />
    </DashboardLayout>
  );
};

export default AppointmentsPage;
