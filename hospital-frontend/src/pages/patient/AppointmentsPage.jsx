/**
 * ============================================================
 *  AppointmentsPage.jsx  — Patient Appointments
 *  Mobile-first redesign with full responsive polish
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
   STYLES
   ================================================================ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600&display=swap');

  .appts-root { font-family: 'DM Sans', sans-serif; }
  .appts-root h1,.appts-root h2,.appts-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes float1 {
    0%,100% { transform:translateY(0) rotate(-1.5deg); }
    50%      { transform:translateY(-10px) rotate(1.5deg); }
  }
  @keyframes float2 {
    0%,100% { transform:translateY(0) rotate(1deg); }
    50%      { transform:translateY(-7px) rotate(-1deg); }
  }
  @keyframes float3 {
    0%,100% { transform:translateY(0); }
    50%      { transform:translateY(-5px); }
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
    from { opacity:0; transform:scale(.95) translateY(10px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes overlayIn { from{opacity:0} to{opacity:1} }
  @keyframes cardIn {
    from { opacity:0; transform:translateY(14px) scale(.99); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes slideUp {
    from { opacity:0; transform:translateY(100%); }
    to   { opacity:1; transform:translateY(0); }
  }

  .anim-fade-up { animation:fadeUp .5s ease both; }
  .d1{animation-delay:.05s} .d2{animation-delay:.10s} .d3{animation-delay:.15s}
  .d4{animation-delay:.20s} .d5{animation-delay:.25s} .d6{animation-delay:.30s}

  .float-1 { animation:float1 5.5s ease-in-out infinite; }
  .float-2 { animation:float2 4.8s ease-in-out infinite .7s; }
  .float-3 { animation:float3 6.2s ease-in-out infinite 1.3s; }
  .pulse-dot { animation:pulse-dot 2s ease-in-out infinite; }
  .spin-slow  { animation:spin-slow 22s linear infinite; }

  .appt-card {
    transition: transform .22s cubic-bezier(.34,1.2,.64,1), box-shadow .22s ease;
  }
  @media (hover:hover) {
    .appt-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(29,78,216,.11);
    }
  }

  .glass-panel {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.75);
  }

  .stat-card { transition: transform .2s ease, box-shadow .2s ease; }
  @media (hover:hover) {
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,.08); }
  }

  .filter-chip { transition: all .16s ease; -webkit-tap-highlight-color: transparent; }
  .filter-chip:active { transform: scale(.96); }
  .chip-active {
    background: #2563eb !important;
    color: white !important;
    border-color: #2563eb !important;
    box-shadow: 0 3px 12px rgba(37,99,235,.3);
  }

  .btn-action { transition: all .16s ease; -webkit-tap-highlight-color: transparent; }
  .btn-action:active { transform: scale(.97); }

  /* Mobile bottom sheet modal */
  .modal-overlay { animation: overlayIn .2s ease both; }
  .modal-sheet   { animation: slideUp .32s cubic-bezier(.34,1.2,.64,1) both; }
  .modal-panel   { animation: modalIn .28s cubic-bezier(.34,1.2,.64,1) both; }

  .rx-input:focus {
    outline:none;
    border-color:#3b82f6;
    box-shadow:0 0 0 3px rgba(59,130,246,.15);
    background:white;
  }

  .shimmer-bg {
    background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  .card-entry { animation: cardIn .45s ease both; }

  /* Hide scrollbar on filter row */
  .filter-scroll { scrollbar-width:none; -ms-overflow-style:none; }
  .filter-scroll::-webkit-scrollbar { display:none; }

  /* Touch-friendly tap targets */
  @media (max-width: 640px) {
    .mobile-action-btn {
      min-height: 44px;
      font-size: 13px;
    }
  }
`;

/* ================================================================
   STATUS CONFIG
   ================================================================ */
const STATUS_CONFIG = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    border: 'border-amber-100',
    cardBg: 'from-amber-50/60',
    pill: 'bg-amber-100 text-amber-800',
  },
  confirmed: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    border: 'border-emerald-100',
    cardBg: 'from-emerald-50/60',
    pill: 'bg-emerald-100 text-emerald-800',
  },
  completed: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-100',
    cardBg: 'from-blue-50/60',
    pill: 'bg-blue-100 text-blue-800',
  },
  cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-400',
    border: 'border-red-100',
    cardBg: 'from-red-50/40',
    pill: 'bg-red-100 text-red-800',
  },
  rejected: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    border: 'border-slate-200',
    cardBg: 'from-slate-50/60',
    pill: 'bg-slate-100 text-slate-700',
  },
};
const getStatus = (s = '') =>
  STATUS_CONFIG[s.toLowerCase()] ?? STATUS_CONFIG.rejected;

/* ================================================================
   AVATAR
   ================================================================ */
const AVATAR_PALETTES = [
  { bg: '#eff6ff', fg: '#1d4ed8', border: '#bfdbfe' },
  { bg: '#eef2ff', fg: '#4338ca', border: '#c7d2fe' },
  { bg: '#f0fdfa', fg: '#0f766e', border: '#99f6e4' },
  { bg: '#fdf4ff', fg: '#7e22ce', border: '#e9d5ff' },
  { bg: '#fff7ed', fg: '#c2410c', border: '#fed7aa' },
];

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
      className={`flex items-center justify-center font-bold select-none ${className}`}
      style={{
        background: p.bg,
        color: p.fg,
        border: `2px solid ${p.border}`,
        fontSize: 'clamp(14px,3vw,18px)',
      }}
    >
      {initials || (
        <svg
          className="h-5 w-5 opacity-40"
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
   HERO — compact on mobile, full on desktop
   ================================================================ */
const HeroIllustration = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
      </defs>
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
      <rect
        x="55"
        y="35"
        width="190"
        height="175"
        rx="18"
        fill="white"
        opacity=".95"
      />
      <rect
        x="55"
        y="35"
        width="190"
        height="40"
        rx="18"
        fill="url(#calGrad)"
      />
      <rect x="55" y="57" width="190" height="18" fill="url(#calGrad)" />
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
    </svg>
    <svg
      viewBox="0 0 118 42"
      xmlns="http://www.w3.org/2000/svg"
      className="float-2 absolute top-2 right-0 w-24"
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
    <svg
      viewBox="0 0 112 38"
      xmlns="http://www.w3.org/2000/svg"
      className="float-3 absolute bottom-6 left-0 w-24"
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
  </div>
);

/* ================================================================
   STAT CARDS — horizontal scroll strip
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
    label: 'Done',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
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
  blue: { iconBg: 'bg-blue-500/20', icon: 'text-blue-200' },
  amber: { iconBg: 'bg-amber-500/20', icon: 'text-amber-200' },
  emerald: { iconBg: 'bg-emerald-500/20', icon: 'text-emerald-200' },
  red: { iconBg: 'bg-red-400/20', icon: 'text-red-200' },
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
      className="filter-scroll flex gap-2 mt-3 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none' }}
    >
      {STAT_DEFS.map((s, i) => {
        const c = STAT_COLOR[s.color];
        return (
          <div
            key={s.key}
            className={`stat-card glass-panel rounded-2xl px-3 py-2.5 flex items-center gap-2 flex-shrink-0 anim-fade-up d${i + 1}`}
          >
            <div className={`rounded-xl p-1.5 ${c.iconBg} flex-shrink-0`}>
              <svg
                className={`h-3.5 w-3.5 ${c.icon}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-blue-200 leading-none">
                {s.label}
              </p>
              <p className="text-lg font-extrabold text-white leading-tight">
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
   FILTER CHIPS — horizontal scroll, mobile-friendly
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
  <div className="anim-fade-up d2">
    {/* Label */}
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">
      Filter by
    </p>
    {/* Scrollable chips */}
    <div
      className="filter-scroll flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none' }}
    >
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`filter-chip flex-shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold capitalize whitespace-nowrap
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
   SKELETON LOADER — mobile-optimized
   ================================================================ */
const SkeletonCard = () => (
  <div className="rounded-3xl border border-slate-200 bg-white/80 overflow-hidden shadow-sm">
    <div className="p-4 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="shimmer-bg h-12 w-12 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="shimmer-bg h-3.5 w-36 rounded-full" />
          <div className="shimmer-bg h-3 w-24 rounded-full" />
        </div>
        <div className="shimmer-bg h-6 w-20 rounded-full" />
      </div>
    </div>
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="shimmer-bg h-14 rounded-2xl" />
        ))}
      </div>
      <div className="shimmer-bg h-3 w-full rounded-full" />
      <div className="shimmer-bg h-3 w-3/4 rounded-full" />
      <div className="flex gap-2 pt-1">
        <div className="shimmer-bg h-10 flex-1 rounded-2xl" />
        <div className="shimmer-bg h-10 flex-1 rounded-2xl" />
      </div>
    </div>
  </div>
);

/* ================================================================
   APPOINTMENT CARD — mobile-first layout
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
      style={{ animationDelay: `${0.05 + (index % 8) * 0.065}s` }}
    >
      {/* ── Header ── */}
      <div
        className={`bg-gradient-to-r ${s.cardBg} to-transparent px-4 pt-4 pb-3 border-b ${s.border}`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Doctor */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-2xl ring-2 ring-white shadow-sm">
                <DoctorAvatar
                  src={docPhoto}
                  name={docName}
                  idx={index}
                  className="h-full w-full rounded-2xl"
                />
              </div>
              {appointment.status === 'confirmed' && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white pulse-dot" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate leading-tight">
                Dr. {docName}
              </h3>
              <p className="text-xs text-blue-600 font-medium truncate">
                {deptName}
              </p>
            </div>
          </div>
          {/* Status badge */}
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${s.bg} ${s.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            <span className="capitalize">{appointment.status}</span>
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 py-3.5">
        {/* Meta pills — 3 columns */}
        <div className="grid grid-cols-3 gap-2 mb-3">
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
              className="rounded-2xl bg-slate-50 border border-slate-100 px-2 py-2.5 text-center"
            >
              <svg
                className="h-3 w-3 text-blue-400 mx-auto mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
              </svg>
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
                {f.label}
              </p>
              <p className="text-[11px] font-bold text-slate-800 leading-tight capitalize truncate">
                {f.val || '—'}
              </p>
            </div>
          ))}
        </div>

        {/* Fee */}
        {appointment.amount && (
          <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-3 py-2 mb-2.5">
            <span className="text-xs font-semibold text-blue-500">
              Consultation Fee
            </span>
            <span className="text-sm font-extrabold text-blue-700">
              ₹{appointment.amount}
            </span>
          </div>
        )}

        {/* Reason */}
        {appointment.reasonForVisit && (
          <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2.5 mb-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
              Reason
            </p>
            <p className="text-xs text-slate-700 leading-snug line-clamp-2">
              {appointment.reasonForVisit}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/patient/appointments/${appointment._id}`}
            className="btn-action mobile-action-btn flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50"
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
              className="btn-action mobile-action-btn flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-red-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700"
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
   EMPTY STATE
   ================================================================ */
const EmptyState = ({ filter }) => (
  <div className="col-span-2 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 py-16 text-center shadow-sm backdrop-blur-sm">
    <svg
      viewBox="0 0 120 100"
      xmlns="http://www.w3.org/2000/svg"
      className="float-2 mb-4 w-24"
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
    <h3 className="text-lg font-bold text-slate-800">No Appointments Found</h3>
    <p className="mt-1.5 max-w-[260px] text-sm text-slate-500 leading-snug">
      {filter === 'all'
        ? "You haven't booked any appointments yet."
        : `No ${filter} appointments right now.`}
    </p>
    <Link
      to="/doctors"
      className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md btn-action"
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
   CANCEL MODAL — bottom sheet on mobile, centered on desktop
   ================================================================ */
const CancelModal = ({ open, reason, onChange, onClose, onConfirm }) => {
  if (!open) return null;
  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(10,22,40,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Bottom sheet on mobile, centered card on sm+ */}
      <div className="modal-sheet sm:modal-panel w-full sm:max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-[0_24px_80px_rgba(0,0,0,.3)]">
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-500 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <svg
                className="h-4 w-4 text-white"
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
              <h2 className="text-base font-bold text-white">
                Cancel Appointment
              </h2>
              <p className="text-xs text-red-100">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => onChange(e.target.value)}
              rows={3}
              placeholder="Why are you cancelling this appointment?"
              className="rx-input w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition"
            />
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end pt-1">
            <button
              onClick={onClose}
              className="btn-action mobile-action-btn inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Keep Appointment
            </button>
            <button
              onClick={onConfirm}
              className="btn-action mobile-action-btn inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-bold text-white shadow-lg shadow-red-900/20 hover:bg-red-700"
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

        {/* Safe area padding for mobile home bar */}
        <div
          className="sm:hidden h-safe-bottom"
          style={{ height: 'env(safe-area-inset-bottom,0px)' }}
        />
      </div>
    </div>
  );
};

/* ================================================================
   MAIN PAGE COMPONENT
   ================================================================ */
const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const [searchParams] = useSearchParams();
  useEffect(() => {
    const s = searchParams.get('status');
    const t = searchParams.get('type');
    if (s) setStatusFilter(s);
    else if (t) setStatusFilter(t);
  }, [searchParams]);

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

  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="appts-root min-h-screen bg-[#f0f5fb] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl space-y-4 sm:space-y-5">
          {/* ===================================================
              HERO — compact on mobile, full on desktop
              =================================================== */}
          <div className="anim-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 shadow-xl">
            {/* Texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            {/* Glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white opacity-5" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-36 w-36 rounded-full bg-indigo-300 opacity-10 blur-3xl" />

            <div className="relative px-5 py-5 sm:px-8 sm:py-8 md:py-10 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              {/* Left — text + stats */}
              <div className="flex-1 min-w-0">
                {/* ── Mobile layout: row with breadcrumb + book button ── */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-100 backdrop-blur-sm">
                    <svg
                      className="h-3 w-3"
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
                  {/* Quick book CTA — visible on mobile in hero */}
                  <Link
                    to="/doctors"
                    className="btn-action inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/30"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    Book
                  </Link>
                </div>

                {/* Heading — shorter on mobile */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-white">
                  Your Health
                  <span className="text-blue-200"> Journey</span>
                </h1>
                {/* Subtitle — hidden on very small screens to save space */}
                <p className="hidden sm:block mt-2 text-sm leading-relaxed text-blue-100/80 max-w-sm">
                  Track consultations, manage bookings, and stay on top of your
                  healthcare.
                </p>

                {/* Stat pills */}
                {!loading && <StatCards appointments={appointments} />}
              </div>

              {/* Right — illustration, desktop only */}
              <div className="hidden md:block md:h-52 md:w-56 lg:h-64 lg:w-72 flex-shrink-0 relative">
                <HeroIllustration />
              </div>
            </div>
          </div>

          {/* ===================================================
              FILTER CHIPS
              =================================================== */}
          <div
            className="anim-fade-up d2 rounded-2xl p-3 sm:p-4 shadow-sm"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <FilterChips active={statusFilter} onChange={setStatusFilter} />
          </div>

          {/* ===================================================
              RESULTS LABEL
              =================================================== */}
          {!loading && appointments.length > 0 && (
            <div className="anim-fade-up d3 flex items-center gap-3 px-1">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-blue-50 p-1.5">
                  <svg
                    className="h-3.5 w-3.5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6.75V19.5A1.5 1.5 0 004.5 21z"
                    />
                  </svg>
                </div>
                <span className="font-bold text-sm text-slate-800">
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

          {/* ===================================================
              CONTENT
              =================================================== */}
          {loading ? (
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="grid lg:grid-cols-2">
              <EmptyState filter={statusFilter} />
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
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

          {/* Bottom padding for mobile nav bars */}
          <div className="h-4 sm:h-0" />
        </div>
      </div>

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
