/**
 * ============================================================
 *  DoctorAppointmentsPage.jsx
 *
 *  Sections:
 *   1. Styles & Keyframes
 *   2. Status config & helpers
 *   3. Hero Illustration (floating SVG scene)
 *   4. Patient Avatar (with fallback)
 *   5. Stat Pills (inside hero)
 *   6. Filter Chips + Sort
 *   7. Skeleton Loader
 *   8. Empty State
 *   9. Appointment Card
 *  10. Cancel Modal
 *  11. Main Page Component
 * ============================================================
 */

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getDoctorAppointments,
  confirmAppointment,
  rejectAppointment,
  cancelAppointment,
} from '../../api/appointment.api.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import useAuthStore from '../../store/auth.store.js';

/* ================================================================
   1. STYLES & KEYFRAMES
   ================================================================ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .doc-appts-root { font-family:'DM Sans',sans-serif; }
  .doc-appts-root h1,.doc-appts-root h2,.doc-appts-root h3 { font-family:'Sora',sans-serif; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes float1 {
    0%,100% { transform:translateY(0) rotate(-1.5deg); }
    50%      { transform:translateY(-13px) rotate(1.5deg); }
  }
  @keyframes float2 {
    0%,100% { transform:translateY(0) rotate(1deg); }
    50%      { transform:translateY(-8px) rotate(-1deg); }
  }
  @keyframes float3 {
    0%,100% { transform:translateY(0); }
    50%      { transform:translateY(-6px); }
  }
  @keyframes pulseDot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.4; transform:scale(1.6); }
  }
  @keyframes spinSlow { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes shimmer {
    0%   { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  @keyframes modalIn {
    from { opacity:0; transform:scale(.95) translateY(10px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes cardIn {
    from { opacity:0; transform:translateY(16px) scale(.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes confirmPop {
    0%  { transform:scale(1); }
    40% { transform:scale(.93); }
    70% { transform:scale(1.06); }
    100%{ transform:scale(1); }
  }

  .anim-fade-up { animation:fadeUp .55s ease both; }
  .d1{animation-delay:.06s} .d2{animation-delay:.12s} .d3{animation-delay:.18s}
  .d4{animation-delay:.24s} .d5{animation-delay:.30s}

  .float-1 { animation:float1 5.5s ease-in-out infinite; }
  .float-2 { animation:float2 4.8s ease-in-out infinite .7s; }
  .float-3 { animation:float3 6.2s ease-in-out infinite 1.3s; }
  .pulse-dot { animation:pulseDot 2s ease-in-out infinite; }
  .spin-slow  { animation:spinSlow 22s linear infinite; }

  .glass-panel {
    background:rgba(255,255,255,0.6);
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
    border:1px solid rgba(255,255,255,0.75);
  }

  .appt-card {
    transition:transform .25s cubic-bezier(.34,1.2,.64,1),box-shadow .25s ease;
  }
  .appt-card:hover {
    transform:translateY(-5px);
    box-shadow:0 20px 50px rgba(29,78,216,.11);
  }
  .appt-card-entry { animation:cardIn .5s ease both; }

  .filter-chip { transition:all .18s ease; }
  .filter-chip:hover:not(.chip-active) { transform:translateY(-1px); }
  .chip-active {
    background:#0d9488 !important;
    color:white !important;
    border-color:#0d9488 !important;
    box-shadow:0 4px 16px rgba(13,148,136,.28);
  }

  .btn-act { transition:all .2s cubic-bezier(.34,1.3,.64,1); }
  .btn-act:hover:not(:disabled) { transform:translateY(-2px); }
  .btn-act:active:not(:disabled) { animation:confirmPop .28s ease; }

  .shimmer-bg {
    background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
    background-size:200% 100%;
    animation:shimmer 1.4s infinite;
  }

  .modal-overlay { animation:fadeUp .2s ease both; }
  .modal-panel   { animation:modalIn .3s cubic-bezier(.34,1.2,.64,1) both; }

  .rx-input:focus {
    outline:none;
    border-color:#3b82f6;
    box-shadow:0 0 0 3px rgba(59,130,246,.15);
    background:white;
  }
  .rx-input-red:focus {
    outline:none;
    border-color:#ef4444;
    box-shadow:0 0 0 3px rgba(239,68,68,.12);
    background:white;
  }

  /* ── Hero illustration: visible on md+, decorative mini on sm ── */
  .hero-illus-full  { display:none; }
  .hero-illus-mini  { display:flex; }

  @media (min-width: 640px) {
    .hero-illus-mini { display:none; }
    .hero-illus-full { display:block; }
  }

  /* ── Stat grid: 2-col compact on mobile, 5-col on md+ ── */
  .stat-grid {
    display:grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  @media (min-width: 640px) {
    .stat-grid {
      display:flex;
      flex-wrap:wrap;
      gap:0.625rem;
    }
  }

  /* ── Stat pill compact on mobile ── */
  .stat-pill {
    display:flex;
    align-items:center;
    gap:0.5rem;
    border-radius:1rem;
    padding:0.5rem 0.75rem;
    background:rgba(255,255,255,0.13);
    backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,0.22);
  }
  @media (min-width:640px) {
    .stat-pill {
      border-radius:1.125rem;
      padding:0.625rem 0.875rem;
      gap:0.625rem;
    }
  }

  .stat-pill-icon {
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:0.625rem;
    width:1.75rem;
    height:1.75rem;
    flex-shrink:0;
  }
  @media (min-width:640px) {
    .stat-pill-icon { width:2rem; height:2rem; border-radius:0.75rem; }
  }

  .stat-pill-label {
    font-size:0.6rem;
    font-weight:700;
    text-transform:uppercase;
    letter-spacing:0.08em;
    color:#99f6e4;
    line-height:1;
  }
  @media (min-width:640px) {
    .stat-pill-label { font-size:0.625rem; }
  }

  .stat-pill-value {
    font-size:1.1rem;
    font-weight:800;
    color:white;
    line-height:1;
    margin-top:0.2rem;
  }
  @media (min-width:640px) {
    .stat-pill-value { font-size:1.375rem; }
  }

  /* ── Filter bar: horizontal scroll on mobile ── */
  .filter-chips-wrap {
    display:flex;
    gap:0.5rem;
    overflow-x:auto;
    -webkit-overflow-scrolling:touch;
    scrollbar-width:none;
    padding-bottom:2px;
  }
  .filter-chips-wrap::-webkit-scrollbar { display:none; }

  /* ── Appointment card meta grid ── */
  .meta-grid {
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:0.5rem;
  }
  @media (min-width:640px) {
    .meta-grid { grid-template-columns:repeat(4,1fr); }
  }

  /* ── Action buttons: full-width on mobile, auto on sm+ ── */
  .action-row {
    display:flex;
    flex-wrap:wrap;
    gap:0.5rem;
  }
  .action-row .btn-full-mobile {
    flex:1 1 0%;
    justify-content:center;
  }
  @media (min-width:640px) {
    .action-row { justify-content:flex-end; }
    .action-row .btn-full-mobile { flex:none; }
  }
`;

/* ================================================================
   2. STATUS CONFIG & HELPERS
   ================================================================ */
const STATUS = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    border: 'border-amber-100',
    strip: 'from-amber-50/70',
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-100',
    strip: 'from-blue-50/70',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    border: 'border-emerald-100',
    strip: 'from-emerald-50/70',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-400',
    border: 'border-red-100',
    strip: 'from-red-50/50',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    border: 'border-slate-200',
    strip: 'from-slate-50/50',
  },
};
const getS = (s = '') => STATUS[s?.toLowerCase()] ?? STATUS.pending;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/* ================================================================
   3. HERO ILLUSTRATION
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
        <linearGradient id="da-headerGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      <circle
        cx="150"
        cy="125"
        r="115"
        fill="none"
        stroke="rgba(255,255,255,.06)"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        className="spin-slow"
      />
      <rect
        x="62"
        y="25"
        width="176"
        height="195"
        rx="18"
        fill="white"
        opacity=".95"
      />
      <rect
        x="62"
        y="25"
        width="176"
        height="36"
        rx="18"
        fill="url(#da-headerGrad)"
      />
      <rect x="62" y="47" width="176" height="14" fill="url(#da-headerGrad)" />
      <rect
        x="110"
        y="16"
        width="80"
        height="20"
        rx="10"
        fill="#1e3a8a"
        opacity=".85"
      />
      <rect
        x="118"
        y="21"
        width="64"
        height="10"
        rx="5"
        fill="#3b82f6"
        opacity=".65"
      />
      <text
        x="150"
        y="43"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="9"
        fill="white"
        fontWeight="700"
        opacity=".9"
      >
        PATIENT SCHEDULE
      </text>
      <rect
        x="74"
        y="68"
        width="152"
        height="34"
        rx="9"
        fill="#fffbeb"
        stroke="#fde68a"
        strokeWidth="1"
      />
      <circle cx="88" cy="85" r="10" fill="#fbbf24" opacity=".3" />
      <circle cx="88" cy="85" r="5" fill="#f59e0b" />
      <rect x="103" y="78" width="80" height="6" rx="3" fill="#fde68a" />
      <rect x="103" y="88" width="55" height="5" rx="2.5" fill="#fef3c7" />
      <rect
        x="194"
        y="79"
        width="24"
        height="12"
        rx="5"
        fill="#f59e0b"
        opacity=".2"
      />
      <text
        x="200"
        y="88"
        fontFamily="sans-serif"
        fontSize="6"
        fill="#b45309"
        fontWeight="700"
      >
        PEND
      </text>
      <rect
        x="74"
        y="108"
        width="152"
        height="34"
        rx="9"
        fill="#eff6ff"
        stroke="#bfdbfe"
        strokeWidth="1"
      />
      <circle cx="88" cy="125" r="10" fill="#3b82f6" opacity=".25" />
      <circle cx="88" cy="125" r="5" fill="#2563eb" />
      <rect x="103" y="118" width="72" height="6" rx="3" fill="#93c5fd" />
      <rect x="103" y="128" width="50" height="5" rx="2.5" fill="#dbeafe" />
      <rect
        x="190"
        y="119"
        width="28"
        height="12"
        rx="5"
        fill="#2563eb"
        opacity=".15"
      />
      <text
        x="196"
        y="128"
        fontFamily="sans-serif"
        fontSize="6"
        fill="#1d4ed8"
        fontWeight="700"
      >
        CONF
      </text>
      <rect
        x="74"
        y="148"
        width="152"
        height="34"
        rx="9"
        fill="#f0fdf4"
        stroke="#bbf7d0"
        strokeWidth="1"
      />
      <circle cx="88" cy="165" r="10" fill="#22c55e" opacity=".25" />
      <circle cx="88" cy="165" r="5" fill="#16a34a" />
      <rect x="103" y="158" width="65" height="6" rx="3" fill="#86efac" />
      <rect x="103" y="168" width="45" height="5" rx="2.5" fill="#dcfce7" />
      <path
        d="M192,162 l4,4 7-7"
        stroke="#15803d"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect
        x="74"
        y="188"
        width="152"
        height="22"
        rx="7"
        fill="#f8fafc"
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      <rect x="85" y="195" width="90" height="5" rx="2.5" fill="#e2e8f0" />
      <rect x="85" y="203" width="60" height="4" rx="2" fill="#f1f5f9" />
      <circle
        cx="248"
        cy="65"
        r="24"
        fill="rgba(255,255,255,.09)"
        stroke="rgba(255,255,255,.18)"
        strokeWidth="1"
      />
      <path
        d="M237,58 Q239,47 248,47 Q257,47 259,58"
        fill="none"
        stroke="rgba(255,255,255,.65)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="237"
        y1="58"
        x2="237"
        y2="72"
        stroke="rgba(255,255,255,.65)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle
        cx="237"
        cy="76"
        r="5.5"
        fill="none"
        stroke="rgba(255,255,255,.65)"
        strokeWidth="2.5"
      />
      <circle cx="237" cy="76" r="2.5" fill="rgba(255,255,255,.4)" />
      <rect
        x="26"
        y="170"
        width="26"
        height="12"
        rx="6"
        fill="rgba(255,255,255,.25)"
      />
      <line
        x1="39"
        y1="170"
        x2="39"
        y2="182"
        stroke="rgba(255,255,255,.45)"
        strokeWidth="1.5"
      />
      <rect
        x="26"
        y="187"
        width="26"
        height="12"
        rx="6"
        fill="rgba(255,255,255,.18)"
      />
      <line
        x1="39"
        y1="187"
        x2="39"
        y2="199"
        stroke="rgba(255,255,255,.35)"
        strokeWidth="1.5"
      />
      <rect
        x="32"
        y="36"
        width="9"
        height="26"
        rx="4"
        fill="rgba(255,255,255,.28)"
      />
      <rect
        x="23"
        y="45"
        width="27"
        height="9"
        rx="4"
        fill="rgba(255,255,255,.28)"
      />
    </svg>

    {/* Floating badge: Pending */}
    <svg
      viewBox="0 0 116 40"
      xmlns="http://www.w3.org/2000/svg"
      className="float-2 absolute top-2 right-0 w-28"
      aria-hidden="true"
    >
      <rect width="116" height="40" rx="11" fill="white" opacity=".95" />
      <rect
        width="116"
        height="40"
        rx="11"
        fill="none"
        stroke="#fde68a"
        strokeWidth="1"
      />
      <circle cx="18" cy="20" r="9" fill="#fef3c7" />
      <circle cx="18" cy="20" r="4" fill="#f59e0b" className="pulse-dot" />
      <text
        x="33"
        y="15"
        fontFamily="sans-serif"
        fontSize="7"
        fill="#64748b"
        fontWeight="600"
      >
        AWAITING
      </text>
      <text
        x="33"
        y="29"
        fontFamily="sans-serif"
        fontSize="11"
        fill="#b45309"
        fontWeight="800"
      >
        Review
      </text>
    </svg>

    {/* Floating badge: Confirmed */}
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
        Patient Ready
      </text>
    </svg>

    {/* Floating badge: Today */}
    <svg
      viewBox="0 0 92 34"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute top-14 left-0 w-22"
      style={{ animationDelay: '1s' }}
      aria-hidden="true"
    >
      <rect width="92" height="34" rx="10" fill="white" opacity=".9" />
      <rect
        width="92"
        height="34"
        rx="10"
        fill="none"
        stroke="#e0f2fe"
        strokeWidth="1"
      />
      <circle cx="14" cy="17" r="5" fill="#3b82f6" className="pulse-dot" />
      <text
        x="25"
        y="13"
        fontFamily="sans-serif"
        fontSize="7"
        fill="#0f172a"
        fontWeight="700"
      >
        TODAY'S LIST
      </text>
      <text x="25" y="24" fontFamily="sans-serif" fontSize="6.5" fill="#64748b">
        Live Schedule
      </text>
    </svg>
  </div>
);

/* Mini illustration for small screens — simple bell + pulse */
const HeroIllustrationMini = () => (
  <div
    className="hero-illus-mini flex-shrink-0 items-center justify-center"
    style={{ width: 64, height: 64 }}
  >
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
    >
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <path
        d="M32 14 C22 14 17 22 17 32 L14 46 H50 L47 32 C47 22 42 14 32 14Z"
        fill="rgba(255,255,255,0.22)"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.5"
      />
      <path
        d="M26 46 C26 49.3 28.7 52 32 52 C35.3 52 38 49.3 38 46"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.5"
      />
      <circle cx="32" cy="14" r="3.5" fill="rgba(255,255,255,0.3)" />
    </svg>
  </div>
);

/* ================================================================
   4. PATIENT AVATAR
   ================================================================ */
const AVATAR_PALETTES = [
  { bg: '#eff6ff', fg: '#1d4ed8', border: '#bfdbfe' },
  { bg: '#fdf4ff', fg: '#7e22ce', border: '#e9d5ff' },
  { bg: '#f0fdfa', fg: '#0f766e', border: '#99f6e4' },
  { bg: '#fff7ed', fg: '#c2410c', border: '#fed7aa' },
  { bg: '#f0fdf4', fg: '#15803d', border: '#bbf7d0' },
];

const PatientAvatar = ({ src, name = '', idx = 0, className = '' }) => {
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
   5. STAT PILLS
   ================================================================ */
const STAT_DEFS = [
  {
    key: 'total',
    label: 'Total',
    iconPath:
      'M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6.75V19.5A1.5 1.5 0 004.5 21z',
    color: 'blue',
  },
  {
    key: 'pending',
    label: 'Pending',
    iconPath: 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z',
    color: 'amber',
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    iconPath: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'sky',
  },
  {
    key: 'completed',
    label: 'Done',
    iconPath:
      'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    color: 'green',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    iconPath:
      'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'red',
  },
];
const STAT_COLOR = {
  blue: { iconBg: 'bg-blue-100', icon: 'text-blue-500' },
  amber: { iconBg: 'bg-amber-100', icon: 'text-amber-500' },
  sky: { iconBg: 'bg-sky-100', icon: 'text-sky-600' },
  green: { iconBg: 'bg-emerald-100', icon: 'text-emerald-600' },
  red: { iconBg: 'bg-red-100', icon: 'text-red-500' },
};

const StatPills = ({ appointments }) => {
  const counts = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };
  return (
    <div className="stat-grid mt-4">
      {STAT_DEFS.map((s, i) => {
        const c = STAT_COLOR[s.color];
        return (
          <div key={s.key} className={`stat-pill anim-fade-up d${i + 1}`}>
            <div className={`stat-pill-icon ${c.iconBg} flex-shrink-0`}>
              <svg
                className={`h-3.5 w-3.5 ${c.icon}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={s.iconPath}
                />
              </svg>
            </div>
            <div>
              <p className="stat-pill-label">{s.label}</p>
              <p className="stat-pill-value">{counts[s.key]}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ================================================================
   6. FILTER CHIPS + SORT
   ================================================================ */
const FILTERS = [
  'all',
  'upcoming',
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'rejected',
];

const FilterBar = ({ active, onChange, sortBy, onSortChange }) => (
  <div className="anim-fade-up d2 glass-panel rounded-2xl p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="filter-chips-wrap">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`filter-chip flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize sm:px-4 sm:text-sm
            ${active === f ? 'chip-active text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-600'}`}
        >
          {f}
        </button>
      ))}
    </div>
    <select
      value={sortBy}
      onChange={(e) => onSortChange(e.target.value)}
      className="w-full flex-shrink-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-teal-400 focus:outline-none sm:w-auto"
    >
      <option value="latest">Latest First</option>
      <option value="oldest">Oldest First</option>
    </select>
  </div>
);

/* ================================================================
   7. SKELETON LOADER
   ================================================================ */
const SkeletonCard = () => (
  <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
    <div className="flex items-start gap-3 mb-5">
      <div className="shimmer-bg h-12 w-12 rounded-2xl flex-shrink-0 sm:h-16 sm:w-16" />
      <div className="flex-1 space-y-2.5">
        <div className="shimmer-bg h-4 w-36 rounded-full sm:w-44" />
        <div className="shimmer-bg h-3 w-44 rounded-full sm:w-56" />
        <div className="shimmer-bg h-5 w-20 rounded-full mt-1" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mb-4 sm:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="shimmer-bg h-14 rounded-2xl" />
      ))}
    </div>
    <div className="shimmer-bg h-11 w-full rounded-2xl mb-4" />
    <div className="flex gap-2 justify-end">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="shimmer-bg h-10 flex-1 rounded-2xl sm:flex-none sm:w-24"
        />
      ))}
    </div>
  </div>
);

/* ================================================================
   8. EMPTY STATE
   ================================================================ */
const EmptyState = ({ filter }) => (
  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 py-16 text-center shadow-sm backdrop-blur-sm">
    <svg
      viewBox="0 0 110 90"
      xmlns="http://www.w3.org/2000/svg"
      className="float-2 mb-5 w-24 sm:w-28"
      aria-hidden="true"
    >
      <ellipse cx="55" cy="82" rx="42" ry="8" fill="#e2e8f0" />
      <rect x="18" y="12" width="74" height="66" rx="14" fill="#f1f5f9" />
      <rect
        x="18"
        y="12"
        width="74"
        height="22"
        rx="14"
        fill="#3b82f6"
        opacity=".15"
      />
      <line
        x1="30"
        y1="22"
        x2="30"
        y2="34"
        stroke="#93c5fd"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="80"
        y1="22"
        x2="80"
        y2="34"
        stroke="#93c5fd"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="28" y="46" width="54" height="6" rx="3" fill="#e2e8f0" />
      <rect x="28" y="56" width="38" height="6" rx="3" fill="#e2e8f0" />
      <rect x="28" y="66" width="46" height="6" rx="3" fill="#e2e8f0" />
      <circle
        cx="85"
        cy="70"
        r="17"
        fill="#f0fdf4"
        stroke="#86efac"
        strokeWidth="1.5"
      />
      <path
        d="M77,70 l5,5 10-10"
        stroke="#16a34a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
    <h3 className="text-lg font-bold text-slate-800 sm:text-xl">
      No Appointments Found
    </h3>
    <p className="mt-2 max-w-xs px-4 text-sm text-slate-500">
      {filter === 'all'
        ? "You don't have any appointments yet."
        : `No ${filter} appointments right now.`}
    </p>
  </div>
);

/* ================================================================
   9. APPOINTMENT CARD
   ================================================================ */
const AppointmentCard = ({
  appointment,
  index,
  loadingId,
  onConfirm,
  onReject,
  onCancel,
}) => {
  const s = getS(appointment.status);
  const p = appointment.patientId ?? {};
  const isLoading = loadingId === appointment._id;

  return (
    <div
      className={`appt-card appt-card-entry rounded-3xl border bg-white shadow-sm overflow-hidden ${s.border}`}
      style={{ animationDelay: `${0.05 + (index % 8) * 0.07}s` }}
    >
      {/* Status-tinted top strip */}
      <div
        className={`bg-gradient-to-r ${s.strip} to-transparent px-4 pt-4 pb-3 border-b ${s.border} sm:px-5`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Patient info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="h-12 w-12 overflow-hidden rounded-2xl ring-2 ring-white shadow sm:h-14 sm:w-14">
                <PatientAvatar
                  src={p.profilePicture}
                  name={p.fullName}
                  idx={index}
                  className="h-full w-full rounded-2xl"
                />
              </div>
              {appointment.status === 'confirmed' && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white pulse-dot sm:h-3.5 sm:w-3.5" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-sm truncate sm:text-base">
                {p.fullName || '—'}
              </h3>
              {/* Contact info: stack on mobile, row on sm+ */}
              <div className="mt-0.5 flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:gap-x-3">
                <span className="flex items-center gap-1 text-xs text-slate-500 truncate">
                  <svg
                    className="h-3 w-3 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  <span className="truncate">{p.email || '—'}</span>
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <svg
                    className="h-3 w-3 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                    />
                  </svg>
                  {p.phoneNumber || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold sm:px-3 ${s.bg} ${s.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 py-4 space-y-3 sm:px-5">
        {/* 4 meta pills — 2 cols on mobile, 4 cols on sm+ */}
        <div className="meta-grid">
          {[
            {
              label: 'Date',
              val: fmtDate(appointment.appointmentDate),
              icon: 'M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6.75V19.5A1.5 1.5 0 004.5 21z',
            },
            {
              label: 'Time',
              val: appointment.timeSlot || '—',
              icon: 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z',
            },
            {
              label: 'Type',
              val: appointment.consultationType || '—',
              icon: 'M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z',
            },
            {
              label: 'Fee',
              val: appointment.amount ? `₹${appointment.amount}` : '—',
              icon: 'M2.25 8.25h19.5M3.75 6h16.5A1.5 1.5 0 0121.75 7.5v9A1.5 1.5 0 0120.25 18H3.75A1.5 1.5 0 012.25 16.5v-9A1.5 1.5 0 013.75 6z',
            },
          ].map((f) => (
            <div
              key={f.label}
              className="rounded-2xl text-center px-2 py-2.5"
              style={{
                background: 'rgba(248,250,252,0.85)',
                border: '1px solid #e8eef6',
              }}
            >
              <svg
                className="h-3.5 w-3.5 text-teal-400 mx-auto mb-1"
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
                {f.val}
              </p>
            </div>
          ))}
        </div>

        {/* Reason for visit */}
        {appointment.reasonForVisit && (
          <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Reason for Visit
            </p>
            <p className="text-sm text-slate-700 leading-snug line-clamp-2">
              {appointment.reasonForVisit}
            </p>
          </div>
        )}

        {/* Action buttons — full width on mobile, auto on sm+ */}
        <div className="action-row pt-1">
          {appointment.status === 'pending' && (
            <>
              <button
                onClick={() => onConfirm(appointment._id)}
                disabled={isLoading}
                className="btn-act btn-full-mobile inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 sm:py-2"
                style={{
                  boxShadow: isLoading
                    ? 'none'
                    : '0 4px 14px rgba(5,150,105,.28)',
                }}
              >
                {isLoading ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Confirming…
                  </>
                ) : (
                  <>
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
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    Confirm
                  </>
                )}
              </button>
              <button
                onClick={() => onReject(appointment._id)}
                disabled={isLoading}
                className="btn-act btn-full-mobile inline-flex items-center gap-1.5 rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60 sm:py-2"
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
                Reject
              </button>
            </>
          )}

          {appointment.status === 'confirmed' && (
            <button
              onClick={() => onCancel(appointment._id)}
              className="btn-act btn-full-mobile inline-flex items-center gap-1.5 rounded-2xl border border-red-300 bg-white px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 sm:py-2"
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

          <Link
            to={`/doctor/appointments/${appointment._id}`}
            className="btn-act btn-full-mobile inline-flex items-center gap-1.5 rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700 sm:py-2"
            style={{ boxShadow: '0 4px 14px rgba(13,148,136,.28)' }}
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
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   10. CANCEL MODAL
   ================================================================ */
const CancelModal = ({
  open,
  reason,
  onChange,
  onClose,
  onConfirm,
  loading,
}) => {
  if (!open) return null;
  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 sm:items-center sm:pb-0"
      style={{ background: 'rgba(10,22,40,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(0,0,0,.28)]">
        <div className="bg-gradient-to-r from-red-600 to-rose-500 px-5 py-4 sm:px-6 sm:py-5">
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
              <h2 className="text-base font-bold text-white sm:text-lg">
                Cancel Appointment
              </h2>
              <p className="text-xs text-red-100 sm:text-sm">
                The patient will be notified of this cancellation.
              </p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4 sm:p-6">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => onChange(e.target.value)}
              rows={4}
              placeholder="e.g. Doctor unavailable due to an emergency…"
              className="rx-input-red w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition"
            />
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-1">
            <button
              onClick={onClose}
              className="btn-act inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Keep Appointment
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || !reason.trim()}
              className="btn-act inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 text-sm font-bold text-white shadow-lg shadow-red-900/20 hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Cancelling…
                </>
              ) : (
                <>
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
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   11. MAIN PAGE COMPONENT
   ================================================================ */
const DoctorAppointmentsPage = () => {
  const { user } = useAuthStore();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [loadingActionId, setLoadingAction] = useState(null);

  const [showCancel, setShowCancel] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoad] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const query =
        status === 'upcoming'
          ? 'type=upcoming'
          : status === 'all'
            ? ''
            : `status=${status}`;
      const res = await getDoctorAppointments(query);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to load appointments',
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleConfirm = async (id) => {
    setLoadingAction(id);
    try {
      await confirmAppointment(id);
      toast.success('Appointment confirmed');
      fetchAppointments();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to confirm');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async (id) => {
    setLoadingAction(id);
    try {
      await rejectAppointment(id);
      toast.success('Appointment rejected');
      fetchAppointments();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject');
    } finally {
      setLoadingAction(null);
    }
  };

  const openCancelModal = (id) => {
    setCancelId(id);
    setCancelReason('');
    setShowCancel(true);
  };
  const closeCancelModal = () => {
    setShowCancel(false);
    setCancelId(null);
    setCancelReason('');
  };

  const handleCancel = async () => {
    if (!cancelReason.trim())
      return toast.error('Please enter a cancellation reason');
    setCancelLoad(true);
    try {
      await cancelAppointment(cancelId, { cancelReason });
      toast.success('Appointment cancelled');
      closeCancelModal();
      fetchAppointments();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelLoad(false);
    }
  };

  const displayed = [...appointments].sort((a, b) => {
    const da = new Date(a.appointmentDate);
    const db = new Date(b.appointmentDate);
    return sortBy === 'latest' ? db - da : da - db;
  });

  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="doc-appts-root min-h-screen bg-[#f0f5fb] px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
          {/* ── HERO ── */}
          <div className="anim-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 shadow-2xl">
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
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-indigo-300 opacity-10 blur-3xl" />
            {/* Spinning ring desktop */}
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

            <div className="relative flex items-start justify-between gap-4 px-5 py-7 sm:px-8 sm:py-10">
              {/* Text + stats — always visible */}
              <div className="flex-1 min-w-0">
                {/* Eyebrow */}
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-100 backdrop-blur-sm sm:text-xs">
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
                      d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6.75V19.5A1.5 1.5 0 004.5 21z"
                    />
                  </svg>
                  Patient Appointments
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
                      Manage Your
                      <br />
                      <span className="text-teal-200">Schedule</span>
                    </h1>
                    <p className="mt-1.5 text-xs text-blue-100/80 sm:text-sm">
                      Dr. {user?.fullName ?? 'Doctor'} ·{' '}
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="mt-1 hidden max-w-sm text-sm leading-relaxed text-blue-100/70 sm:block">
                      Confirm, reject, and track patient appointments from one
                      place.
                    </p>
                  </div>
                  {/* Mini bell illustration — only on xs/sm */}
                  <HeroIllustrationMini />
                </div>

                {/* Stat pills */}
                {!loading && <StatPills appointments={appointments} />}
              </div>

              {/* Full illustration — hidden on xs, shown sm+ */}
              <div className="hero-illus-full flex-shrink-0 h-52 w-56 md:h-64 md:w-72 lg:h-72 lg:w-80 relative">
                <HeroIllustration />
              </div>
            </div>
          </div>

          {/* ── FILTER BAR ── */}
          <FilterBar
            active={status}
            onChange={setStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* ── RESULTS LABEL ── */}
          {!loading && displayed.length > 0 && (
            <div className="anim-fade-up d3 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-teal-50 p-2">
                  <svg
                    className="h-4 w-4 text-teal-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
                    />
                  </svg>
                </div>
                <span className="font-bold text-slate-800 text-sm sm:text-base">
                  {displayed.length} patient{displayed.length !== 1 ? 's' : ''}
                </span>
                {status !== 'all' && (
                  <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700 capitalize">
                    {status}
                  </span>
                )}
              </div>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          )}

          {/* ── CONTENT ── */}
          {loading ? (
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <EmptyState filter={status} />
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {displayed.map((appt, i) => (
                <AppointmentCard
                  key={appt._id}
                  appointment={appt}
                  index={i}
                  loadingId={loadingActionId}
                  onConfirm={handleConfirm}
                  onReject={handleReject}
                  onCancel={openCancelModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CANCEL MODAL ── */}
      <CancelModal
        open={showCancel}
        reason={cancelReason}
        onChange={setCancelReason}
        onClose={closeCancelModal}
        onConfirm={handleCancel}
        loading={cancelLoading}
      />
    </DashboardLayout>
  );
};

export default DoctorAppointmentsPage;
