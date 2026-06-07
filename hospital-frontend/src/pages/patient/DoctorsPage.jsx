import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { getAllDoctors } from '../../api/doctor.api.js';

/* ================================================================
   STYLES
   ================================================================ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .doc-root { font-family:'DM Sans',sans-serif; }
  .doc-root h1,.doc-root h2,.doc-root h3,.doc-root h4 { font-family:'Sora',sans-serif; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes float1 {
    0%,100% { transform:translateY(0) rotate(-1.5deg) scale(1); }
    50%      { transform:translateY(-12px) rotate(1.5deg) scale(1.02); }
  }
  @keyframes float2 {
    0%,100% { transform:translateY(0) rotate(1deg); }
    50%      { transform:translateY(-8px) rotate(-1deg); }
  }
  @keyframes float3 {
    0%,100% { transform:translateY(0) rotate(-0.5deg); }
    50%      { transform:translateY(-10px) rotate(0.5deg); }
  }
  @keyframes shimmer {
    0%   { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  @keyframes spinSlow {
    from { transform:rotate(0deg); }
    to   { transform:rotate(360deg); }
  }
  @keyframes pulseDot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.5; transform:scale(1.4); }
  }
  @keyframes cardIn {
    from { opacity:0; transform:translateY(20px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes slideUp {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .anim-fade-up { animation:fadeUp .5s ease both; }
  .d1{animation-delay:.06s} .d2{animation-delay:.12s} .d3{animation-delay:.18s}
  .d4{animation-delay:.24s} .d5{animation-delay:.30s}

  .float-1 { animation:float1 5.5s ease-in-out infinite; }
  .float-2 { animation:float2 4.8s ease-in-out infinite .8s; }
  .float-3 { animation:float3 6.2s ease-in-out infinite 1.4s; }
  .spin-slow { animation:spinSlow 18s linear infinite; }
  .pulse-dot { animation:pulseDot 2s ease-in-out infinite; }

  /* ── Doctor card ── */
  .doc-card {
    animation: cardIn 0.5s ease both;
    transition: transform .25s cubic-bezier(.34,1.3,.64,1), box-shadow .25s ease;
  }
  .doc-card:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 20px 50px rgba(30,64,175,.13);
  }
  .doc-card:hover .book-btn {
    background: #1d4ed8;
    box-shadow: 0 8px 24px rgba(59,130,246,.35);
    transform: translateY(-1px);
  }
  .book-btn {
    transition: background .18s ease, box-shadow .18s ease, transform .18s ease;
  }

  /* ── Mobile horizontal card ── */
  .doc-card-mobile {
    animation: slideUp .4s ease both;
    transition: transform .2s ease, box-shadow .2s ease;
  }
  .doc-card-mobile:hover {
    transform: translateX(3px);
    box-shadow: 0 8px 28px rgba(29,78,216,.1);
  }

  /* ── Filter chips ── */
  .filter-chip { transition:all .18s ease; }
  .filter-chip:hover:not(.chip-active) { transform:translateY(-1px); }
  .chip-active {
    background: #1d4ed8 !important;
    color: white !important;
    border-color: #1d4ed8 !important;
    box-shadow: 0 4px 14px rgba(29,78,216,.3);
  }

  /* ── Shimmer ── */
  .shimmer-bg {
    background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  /* ── Search input ── */
  .search-input:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59,130,246,.18);
  }

  /* ── Glass panel ── */
  .glass-panel {
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.75);
  }

  /* ── Stat strip hover ── */
  .stat-strip { transition: transform .2s ease; }
  .stat-strip:hover { transform: translateY(-2px); }
`;

/* ================================================================
   AVATAR
   ================================================================ */
const PALETTES = ['blue', 'indigo', 'violet', 'teal', 'cyan'];
const PALETTE_MAP = {
  blue: { bg: '#eff6ff', text: '#1d4ed8', ring: '#bfdbfe' },
  indigo: { bg: '#eef2ff', text: '#4338ca', ring: '#c7d2fe' },
  violet: { bg: '#f5f3ff', text: '#6d28d9', ring: '#ddd6fe' },
  teal: { bg: '#f0fdfa', text: '#0f766e', ring: '#99f6e4' },
  cyan: { bg: '#ecfeff', text: '#0e7490', ring: '#a5f3fc' },
};

const DoctorAvatar = ({
  src,
  name = '',
  index = 0,
  className = '',
  textSize = 'text-2xl',
}) => {
  const [err, setErr] = useState(false);
  const color = PALETTES[index % PALETTES.length];
  const p = PALETTE_MAP[color];
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

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
      className={`flex items-center justify-center font-bold select-none ${textSize} ${className}`}
      style={{ background: p.bg, color: p.text, border: `2px solid ${p.ring}` }}
    >
      {initials || (
        <svg
          className="h-8 w-8 opacity-40"
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
   STAR RATING
   ================================================================ */
const Stars = ({ rating, size = 'sm' }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} ${s <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

/* ================================================================
   HERO ILLUSTRATION (desktop only)
   ================================================================ */
const HeroIllustration = () => (
  <div className="relative w-full h-full">
    <svg
      viewBox="0 0 320 260"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <ellipse
        cx="160"
        cy="200"
        rx="130"
        ry="55"
        fill="rgba(255,255,255,0.08)"
      />
      <rect
        x="100"
        y="120"
        width="120"
        height="110"
        rx="16"
        fill="white"
        opacity=".92"
      />
      <path
        d="M148,120 L130,170 L160,160 L190,170 L172,120"
        fill="#e0e7ff"
        opacity=".9"
      />
      <line
        x1="160"
        y1="160"
        x2="160"
        y2="230"
        stroke="#3b82f6"
        strokeWidth="3"
        opacity=".4"
      />
      <circle cx="160" cy="90" r="38" fill="#fde8d0" />
      <path
        d="M122,80 Q125,50 160,48 Q195,50 198,80 Q185,62 160,62 Q135,62 122,80z"
        fill="#7c3aed"
        opacity=".8"
      />
      <circle cx="150" cy="88" r="4" fill="#1e293b" opacity=".7" />
      <circle cx="170" cy="88" r="4" fill="#1e293b" opacity=".7" />
      <path
        d="M150,102 Q160,110 170,102"
        fill="none"
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".6"
      />
      <ellipse cx="122" cy="90" rx="6" ry="9" fill="#fde8d0" />
      <ellipse cx="198" cy="90" rx="6" ry="9" fill="#fde8d0" />
      <path
        d="M138,128 Q120,140 122,160 Q124,175 138,175 Q152,175 154,160"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle
        cx="154"
        cy="163"
        r="8"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
      />
      <circle cx="154" cy="163" r="4" fill="#3b82f6" opacity=".6" />
      <rect x="165" y="155" width="42" height="52" rx="6" fill="#f1f5f9" />
      <rect x="175" y="150" width="22" height="9" rx="4" fill="#cbd5e1" />
      <line
        x1="171"
        y1="172"
        x2="201"
        y2="172"
        stroke="#94a3b8"
        strokeWidth="2"
      />
      <line
        x1="171"
        y1="182"
        x2="196"
        y2="182"
        stroke="#94a3b8"
        strokeWidth="2"
      />
      <line
        x1="171"
        y1="192"
        x2="199"
        y2="192"
        stroke="#94a3b8"
        strokeWidth="2"
      />
      <line
        x1="171"
        y1="162"
        x2="192"
        y2="162"
        stroke="#3b82f6"
        strokeWidth="2"
      />
      <rect x="138" y="148" width="24" height="16" rx="4" fill="#dbeafe" />
      <text
        x="142"
        y="159"
        fontFamily="sans-serif"
        fontSize="7"
        fill="#1d4ed8"
        fontWeight="700"
      >
        Dr.
      </text>
    </svg>
    {/* Floating badge: ECG */}
    <svg
      viewBox="0 0 110 44"
      xmlns="http://www.w3.org/2000/svg"
      className="float-2 absolute top-4 right-2 w-28"
      aria-hidden="true"
    >
      <rect width="110" height="44" rx="12" fill="white" opacity=".95" />
      <rect
        width="110"
        height="44"
        rx="12"
        fill="none"
        stroke="#bfdbfe"
        strokeWidth="1"
      />
      <text
        x="10"
        y="14"
        fontFamily="sans-serif"
        fontSize="7"
        fill="#64748b"
        fontWeight="600"
      >
        HEART RATE
      </text>
      <polyline
        points="8,30 18,30 24,20 28,36 32,24 36,30 46,30 50,22 54,34 58,26 62,30 76,30"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="82"
        y="32"
        fontFamily="sans-serif"
        fontSize="11"
        fill="#1d4ed8"
        fontWeight="800"
      >
        78
      </text>
      <text x="97" y="32" fontFamily="sans-serif" fontSize="7" fill="#64748b">
        bpm
      </text>
    </svg>
    {/* Floating badge: Verified */}
    <svg
      viewBox="0 0 120 40"
      xmlns="http://www.w3.org/2000/svg"
      className="float-3 absolute bottom-8 left-0 w-28"
      aria-hidden="true"
    >
      <rect width="120" height="40" rx="12" fill="white" opacity=".95" />
      <rect
        width="120"
        height="40"
        rx="12"
        fill="none"
        stroke="#bbf7d0"
        strokeWidth="1"
      />
      <circle cx="20" cy="20" r="10" fill="#dcfce7" />
      <path
        d="M14,20 l4,4 8-8"
        stroke="#16a34a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <text
        x="36"
        y="15"
        fontFamily="sans-serif"
        fontSize="7.5"
        fill="#15803d"
        fontWeight="700"
      >
        VERIFIED
      </text>
      <text x="36" y="28" fontFamily="sans-serif" fontSize="7" fill="#64748b">
        Board Certified
      </text>
    </svg>
    {/* Floating badge: Available */}
    <svg
      viewBox="0 0 100 38"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute top-14 left-2 w-24"
      style={{ animationDuration: '4.2s', animationDelay: '.4s' }}
      aria-hidden="true"
    >
      <rect width="100" height="38" rx="11" fill="white" opacity=".92" />
      <rect
        width="100"
        height="38"
        rx="11"
        fill="none"
        stroke="#e0f2fe"
        strokeWidth="1"
      />
      <circle cx="16" cy="19" r="5" fill="#22c55e" className="pulse-dot" />
      <text
        x="27"
        y="16"
        fontFamily="sans-serif"
        fontSize="7.5"
        fill="#0f172a"
        fontWeight="700"
      >
        AVAILABLE
      </text>
      <text x="27" y="28" fontFamily="sans-serif" fontSize="6.5" fill="#64748b">
        Today
      </text>
    </svg>
  </div>
);

/* ================================================================
   SKELETON LOADERS
   ================================================================ */
const SkeletonCardDesktop = () => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="shimmer-bg h-44 w-full rounded-2xl mb-4" />
    <div className="shimmer-bg h-4 w-3/4 rounded-full mb-2" />
    <div className="shimmer-bg h-3 w-1/2 rounded-full mb-4" />
    <div className="shimmer-bg h-3 w-full rounded-full mb-2" />
    <div className="shimmer-bg h-9 w-full rounded-xl mt-4" />
  </div>
);

const SkeletonCardMobile = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm flex items-center gap-3">
    <div className="shimmer-bg h-14 w-14 rounded-2xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="shimmer-bg h-4 w-32 rounded-full" />
      <div className="shimmer-bg h-3 w-24 rounded-full" />
      <div className="shimmer-bg h-3 w-20 rounded-full" />
    </div>
    <div className="shimmer-bg h-9 w-20 rounded-xl flex-shrink-0" />
  </div>
);

/* ================================================================
   DESKTOP DOCTOR CARD (grid layout, md+)
   ================================================================ */
const DoctorCardDesktop = ({ doctor, index }) => {
  const name = doctor?.userId?.fullName || 'Doctor';
  const photo = doctor?.userId?.profilePicture;
  const dept = doctor?.department?.name || 'General';
  const spec = doctor?.specialization || '';
  const exp = doctor?.experience;
  const fee = doctor?.consultationFee;
  const qual = doctor?.qualification || '';
  const stars = doctor?.averageRating || 0;
  const reviews = doctor?.totalReviews || 0;

  return (
    <div
      className="doc-card rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col"
      style={{ animationDelay: `${0.06 + (index % 8) * 0.07}s` }}
    >
      {/* Avatar zone */}
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 h-48 flex items-end px-5 pt-5 pb-0">
        <div className="absolute top-3 right-3 h-16 w-16 rounded-full bg-blue-100/50 blur-xl" />
        <div className="absolute top-8 left-5 h-10 w-10 rounded-full bg-indigo-100/60 blur-lg" />
        <span className="absolute top-3 left-3 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-blue-700 backdrop-blur-sm shadow-sm">
          {dept}
        </span>
        <div className="mx-auto mb-0 h-28 w-28 rounded-2xl overflow-hidden ring-2 ring-white shadow-lg absolute bottom-0 left-1/2 -translate-x-1/2 transition-all duration-300">
          <DoctorAvatar
            src={photo}
            name={name}
            index={index}
            className="h-full w-full"
          />
        </div>
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-green-700 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 pulse-dot" />
          Available
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-5 pt-14 pb-5">
        <h3 className="text-center text-lg font-bold text-slate-900 leading-tight">
          Dr. {name}
        </h3>
        <p className="mt-0.5 text-center text-sm font-medium text-blue-600">
          {spec || dept}
        </p>

        <div className="mt-2 flex items-center justify-center gap-1.5">
          <Stars rating={stars} />
          <span className="text-xs font-bold text-slate-700">
            {Number(stars).toFixed(1)}
          </span>
          <span className="text-xs text-slate-400">({reviews})</span>
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {exp && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {exp} yrs
            </span>
          )}
          {qual && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
              {qual}
            </span>
          )}
        </div>

        <div className="my-3 h-px bg-slate-100" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Consultation Fee</span>
          <span className="text-base font-extrabold text-blue-700">
            {fee ? `₹${fee}` : 'Free'}
          </span>
        </div>

        <Link
          to={`/doctors/${doctor._id}`}
          className="book-btn mt-4 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md"
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Book Appointment
        </Link>
      </div>
    </div>
  );
};

/* ================================================================
   MOBILE DOCTOR CARD (horizontal list, < md)
   ================================================================ */
const DoctorCardMobile = ({ doctor, index }) => {
  const name = doctor?.userId?.fullName || 'Doctor';
  const photo = doctor?.userId?.profilePicture;
  const dept = doctor?.department?.name || 'General';
  const spec = doctor?.specialization || '';
  const exp = doctor?.experience;
  const fee = doctor?.consultationFee;
  const stars = doctor?.averageRating || 0;
  const reviews = doctor?.totalReviews || 0;

  return (
    <div
      className="doc-card-mobile rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      style={{ animationDelay: `${0.04 + (index % 10) * 0.05}s` }}
    >
      <div className="flex items-center gap-3.5 p-3.5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="h-16 w-16 rounded-2xl overflow-hidden ring-2 ring-slate-100 shadow-sm">
            <DoctorAvatar
              src={photo}
              name={name}
              index={index}
              className="h-full w-full"
              textSize="text-xl"
            />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white pulse-dot" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
            Dr. {name}
          </h3>
          <p className="text-xs font-medium text-blue-600 truncate mt-0.5">
            {spec || dept}
          </p>

          {/* Rating + fee row */}
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Stars rating={stars} size="xs" />
              <span className="text-[11px] font-bold text-slate-600">
                {Number(stars).toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400">({reviews})</span>
            </div>
            {fee && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                ₹{fee}
              </span>
            )}
            {exp && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                {exp}y exp
              </span>
            )}
          </div>
        </div>

        {/* Book button */}
        <Link
          to={`/doctors/${doctor._id}`}
          className="flex-shrink-0 inline-flex flex-col items-center justify-center rounded-2xl bg-blue-600 px-3 py-2.5 text-white shadow-sm"
          style={{ minWidth: 56, transition: 'all .18s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
        >
          <svg
            className="h-4 w-4 mb-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-[10px] font-bold leading-none">Book</span>
        </Link>
      </div>
    </div>
  );
};

/* ================================================================
   EMPTY STATE
   ================================================================ */
const EmptyState = ({ query }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center px-4">
    <svg
      viewBox="0 0 120 100"
      xmlns="http://www.w3.org/2000/svg"
      className="float-2 mb-5 w-24 sm:w-32"
      aria-hidden="true"
    >
      <ellipse cx="60" cy="85" rx="48" ry="12" fill="#e2e8f0" />
      <rect x="28" y="20" width="64" height="62" rx="14" fill="#f1f5f9" />
      <rect
        x="28"
        y="20"
        width="64"
        height="22"
        rx="14"
        fill="#3b82f6"
        opacity=".2"
      />
      <circle
        cx="60"
        cy="50"
        r="16"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="2"
      />
      <path
        d="M53,50 h14 M60,43 v14"
        stroke="#94a3b8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
    <h3 className="text-lg font-bold text-slate-800 sm:text-xl">
      No doctors found
    </h3>
    <p className="mt-2 max-w-xs text-sm text-slate-500">
      {query
        ? `No results for "${query}". Try a different search.`
        : 'No doctors available right now.'}
    </p>
  </div>
);

/* ================================================================
   HERO STATS (mobile compact version)
   ================================================================ */
const heroStats = [
  { label: 'Specialists', value: '200+' },
  { label: 'Departments', value: '24' },
  { label: 'Patients', value: '15k+' },
  { label: 'Rating', value: '4.9★' },
];

/* ================================================================
   MAIN PAGE
   ================================================================ */
const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActive] = useState('All');
  const [departments, setDepts] = useState(['All']);

  const fetchDoctors = async () => {
    try {
      const res = await getAllDoctors();
      const list = res.data.doctors || [];
      setDoctors(list);
      const depts = [
        'All',
        ...new Set(list.map((d) => d?.department?.name).filter(Boolean)),
      ];
      setDepts(depts);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filtered = doctors.filter((d) => {
    const name = d?.userId?.fullName?.toLowerCase() || '';
    const spec = d?.specialization?.toLowerCase() || '';
    const dept = d?.department?.name?.toLowerCase() || '';
    const q = search.toLowerCase();
    const matchQ =
      !q || name.includes(q) || spec.includes(q) || dept.includes(q);
    const matchF =
      activeFilter === 'All' || d?.department?.name === activeFilter;
    return matchQ && matchF;
  });

  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="doc-root min-h-screen bg-[#f0f5fb]">
        <div className="mx-auto max-w-7xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          {/* ============================================================
              HERO — Mobile: compact pill + search only
                     Desktop: full gradient banner with illustration
              ============================================================ */}

          {/* ── MOBILE HERO (< md) ── */}
          <div className="md:hidden anim-fade-up">
            {/* Compact gradient card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-5 py-5 shadow-xl">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white opacity-5" />

              {/* Top row: badge + live dot */}
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-100 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 pulse-dot" />
                  Find Doctors
                </span>
                <span className="text-xs text-blue-200 font-medium">
                  {!loading && `${filtered.length} available`}
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-2xl font-extrabold text-white leading-tight mb-1">
                Book a Specialist
                <br />
                <span className="text-blue-200">Near You</span>
              </h1>
              <p className="text-xs text-blue-100/75 mb-4 leading-relaxed">
                Certified doctors · Instant booking · Digital prescriptions
              </p>

              {/* Search bar */}
              <div className="flex items-center gap-2 rounded-2xl bg-white/15 p-1.5 backdrop-blur-md ring-1 ring-white/20">
                <svg
                  className="ml-2 h-4 w-4 flex-shrink-0 text-blue-200"
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
                <input
                  type="text"
                  placeholder="Search name, specialty…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input flex-1 bg-transparent py-2 pr-2 text-sm text-white placeholder-blue-200/65 focus:outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="rounded-xl bg-white/20 px-2.5 py-1 text-xs font-semibold text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Mini stats row */}
              <div className="mt-4 grid grid-cols-4 gap-1.5">
                {heroStats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl text-center py-2"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <p className="text-sm font-extrabold text-white leading-none">
                      {s.value}
                    </p>
                    <p className="text-[9px] text-blue-200/80 mt-0.5 leading-none">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── DESKTOP HERO (md+) ── */}
          <div className="hidden md:block anim-fade-up">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 shadow-2xl">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white opacity-5" />
              <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-indigo-400 opacity-10 blur-3xl" />
              {/* Spinning ring */}
              <div className="pointer-events-none absolute top-4 right-4 h-20 w-20 hidden lg:block opacity-20">
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
                    r="24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                </svg>
              </div>

              <div className="relative flex items-center gap-6 px-8 py-10 md:px-12 lg:gap-8">
                {/* Text */}
                <div className="flex-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-widest text-blue-100 uppercase backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 pulse-dot" />
                    Find Your Doctor
                  </span>
                  <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white lg:text-5xl">
                    Expert Care,
                    <br />
                    <span className="text-blue-200">
                      Right When You Need It
                    </span>
                  </h1>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-blue-100/85 sm:text-base">
                    Browse certified specialists and book your consultation in
                    under 60 seconds.
                  </p>
                  {/* Desktop search */}
                  <div className="mt-6 flex max-w-lg items-center gap-2 rounded-2xl bg-white/15 p-1.5 backdrop-blur-md ring-1 ring-white/20">
                    <svg
                      className="ml-3 h-4 w-4 flex-shrink-0 text-blue-200"
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
                    <input
                      type="text"
                      placeholder="Search by name, specialty, department…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="search-input flex-1 bg-transparent py-2 pr-2 text-sm text-white placeholder-blue-200/70 focus:outline-none"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="rounded-xl bg-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Illustration */}
                <div className="hidden md:block md:h-56 md:w-56 lg:h-72 lg:w-80 flex-shrink-0 relative">
                  <HeroIllustration />
                </div>
              </div>

              {/* Stats strip */}
              <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="grid grid-cols-4 divide-x divide-white/10">
                  {[
                    {
                      label: 'Specialists',
                      value: '200+',
                      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
                    },
                    {
                      label: 'Departments',
                      value: '24',
                      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
                    },
                    {
                      label: 'Patients Helped',
                      value: '15k+',
                      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
                    },
                    {
                      label: 'Avg. Rating',
                      value: '4.9★',
                      icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
                    },
                  ].map((st) => (
                    <div
                      key={st.label}
                      className="stat-strip flex items-center gap-3 px-4 py-4 sm:px-6"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
                        <svg
                          className="h-4 w-4 text-blue-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={st.icon}
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-extrabold text-white">
                          {st.value}
                        </p>
                        <p className="text-[11px] text-blue-200/80">
                          {st.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================
              FILTER CHIPS — scrollable on mobile
              ============================================================ */}
          <div className="anim-fade-up d2">
            {/* Mobile: horizontally scrollable, no wrap */}
            <div
              className="flex gap-2 overflow-x-auto pb-1 md:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              <style>{`.mob-chips::-webkit-scrollbar{display:none}`}</style>
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActive(dept)}
                  className={`filter-chip flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize whitespace-nowrap
                    ${activeFilter === dept ? 'chip-active' : 'border-slate-200 bg-white text-slate-600 shadow-sm'}`}
                >
                  {dept}
                </button>
              ))}
            </div>
            {/* Desktop: wrap */}
            <div className="hidden md:flex flex-wrap gap-2">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActive(dept)}
                  className={`filter-chip rounded-full border px-4 py-1.5 text-sm font-semibold transition-all
                    ${activeFilter === dept ? 'chip-active' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600 shadow-sm'}`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* ============================================================
              RESULTS COUNT
              ============================================================ */}
          {!loading && (
            <div className="anim-fade-up d3 flex items-center gap-3">
              <p className="text-xs text-slate-500 sm:text-sm">
                <span className="font-bold text-slate-800">
                  {filtered.length}
                </span>{' '}
                doctor{filtered.length !== 1 ? 's' : ''}
                {activeFilter !== 'All' && (
                  <span>
                    {' '}
                    in{' '}
                    <span className="font-semibold text-blue-600">
                      {activeFilter}
                    </span>
                  </span>
                )}
                {search && (
                  <span>
                    {' '}
                    · "
                    <span className="font-semibold text-blue-600">
                      {search}
                    </span>
                    "
                  </span>
                )}
              </p>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          )}

          {/* ============================================================
              DOCTOR LIST
              — Mobile: vertical list of horizontal cards
              — Desktop: 2/3/4 column grid
              ============================================================ */}

          {/* MOBILE LIST */}
          <div className="md:hidden space-y-2.5">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCardMobile key={i} />
              ))
            ) : filtered.length === 0 ? (
              <EmptyState query={search} />
            ) : (
              filtered.map((doctor, i) => (
                <DoctorCardMobile key={doctor._id} doctor={doctor} index={i} />
              ))
            )}
          </div>

          {/* DESKTOP GRID */}
          <div className="hidden md:grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCardDesktop key={i} />
              ))
            ) : filtered.length === 0 ? (
              <EmptyState query={search} />
            ) : (
              filtered.map((doctor, i) => (
                <DoctorCardDesktop key={doctor._id} doctor={doctor} index={i} />
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorsPage;
