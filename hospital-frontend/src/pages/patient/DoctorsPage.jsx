import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { getAllDoctors } from '../../api/doctor.api.js';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .doc-root { font-family: 'DM Sans', sans-serif; }
  .doc-root h1,.doc-root h2,.doc-root h3,.doc-root h4 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes float1 {
    0%,100% { transform: translateY(0px) rotate(-1.5deg) scale(1); }
    50%      { transform: translateY(-12px) rotate(1.5deg) scale(1.02); }
  }
  @keyframes float2 {
    0%,100% { transform: translateY(0px) rotate(1deg); }
    50%      { transform: translateY(-8px) rotate(-1deg); }
  }
  @keyframes float3 {
    0%,100% { transform: translateY(0px) rotate(-0.5deg); }
    50%      { transform: translateY(-10px) rotate(0.5deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.6; transform:scale(1.3); }
  }
  @keyframes cardIn {
    from { opacity:0; transform:translateY(24px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  .anim-fade-up  { animation: fadeUp 0.55s ease both; }
  .anim-fade-in  { animation: fadeIn 0.45s ease both; }
  .d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}
  .d4{animation-delay:.24s}.d5{animation-delay:.30s}.d6{animation-delay:.36s}

  .float-1 { animation: float1 5.5s ease-in-out infinite; }
  .float-2 { animation: float2 4.8s ease-in-out infinite .8s; }
  .float-3 { animation: float3 6.2s ease-in-out infinite 1.4s; }
  .spin-slow { animation: spin-slow 18s linear infinite; }
  .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }

  .doc-card {
    transition: transform 0.25s cubic-bezier(.34,1.3,.64,1), box-shadow 0.25s ease;
  }
  .doc-card:hover {
    transform: translateY(-7px) scale(1.01);
    box-shadow: 0 20px 50px rgba(30,64,175,0.13);
  }
  .doc-card:hover .card-avatar-ring {
    box-shadow: 0 0 0 4px rgba(59,130,246,0.25);
  }
  .doc-card:hover .book-btn {
    background: #1d4ed8;
    box-shadow: 0 8px 24px rgba(59,130,246,0.35);
    transform: translateY(-1px);
  }
  .book-btn {
    transition: background .18s ease, box-shadow .18s ease, transform .18s ease;
  }

  .search-input:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.18);
  }

  .filter-chip {
    transition: all .18s ease;
  }
  .filter-chip:hover {
    transform: translateY(-1px);
  }
  .filter-chip.active {
    background: #1d4ed8;
    color: white;
    border-color: #1d4ed8;
    box-shadow: 0 4px 14px rgba(29,78,216,0.3);
  }

  .shimmer-bg {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .stat-strip {
    transition: transform .22s ease, box-shadow .22s ease;
  }
  .stat-strip:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 28px rgba(0,0,0,0.08);
  }

  .card-anim {
    animation: cardIn 0.5s ease both;
  }
`;

/* ─── Default Avatar SVG ──────────────────────────────────────────────────── */
const DefaultAvatar = ({ name = '', color = 'blue' }) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const palettes = {
    blue: { bg: '#eff6ff', text: '#1d4ed8', ring: '#bfdbfe' },
    indigo: { bg: '#eef2ff', text: '#4338ca', ring: '#c7d2fe' },
    violet: { bg: '#f5f3ff', text: '#6d28d9', ring: '#ddd6fe' },
    teal: { bg: '#f0fdfa', text: '#0f766e', ring: '#99f6e4' },
    cyan: { bg: '#ecfeff', text: '#0e7490', ring: '#a5f3fc' },
  };
  const p = palettes[color] || palettes.blue;

  return (
    <div
      className="h-full w-full flex items-center justify-center rounded-2xl text-2xl font-bold select-none"
      style={{ background: p.bg, color: p.text, border: `2px solid ${p.ring}` }}
    >
      {initials || (
        <svg
          className="h-10 w-10 opacity-50"
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

/* ─── DoctorAvatar – handles broken/missing images ───────────────────────── */
const avatarColors = ['blue', 'indigo', 'violet', 'teal', 'cyan'];
const DoctorAvatar = ({ src, name, index, className = '' }) => {
  const [err, setErr] = useState(false);
  const color = avatarColors[index % avatarColors.length];
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {src && !err ? (
        <img
          src={src}
          alt={name}
          onError={() => setErr(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <DefaultAvatar name={name} color={color} />
      )}
    </div>
  );
};

/* ─── Hero Illustration — Doctor + health icons ───────────────────────────── */
const HeroIllustration = () => (
  <div className="relative w-full h-full">
    {/* Main doctor figure */}
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

      {/* Doctor coat */}
      <rect
        x="100"
        y="120"
        width="120"
        height="110"
        rx="16"
        fill="white"
        opacity=".92"
      />
      <rect
        x="100"
        y="120"
        width="55"
        height="110"
        rx="0"
        fill="white"
        opacity=".92"
      />
      {/* Lapels */}
      <path
        d="M148,120 L130,170 L160,160 L190,170 L172,120"
        fill="#e0e7ff"
        opacity=".9"
      />
      {/* Blue stripe / collar line */}
      <line
        x1="160"
        y1="160"
        x2="160"
        y2="230"
        stroke="#3b82f6"
        strokeWidth="3"
        opacity=".4"
      />

      {/* Head */}
      <circle cx="160" cy="90" r="38" fill="#fde8d0" />
      {/* Hair */}
      <path
        d="M122,80 Q125,50 160,48 Q195,50 198,80 Q185,62 160,62 Q135,62 122,80z"
        fill="#7c3aed"
        opacity=".8"
      />
      {/* Face features */}
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
      {/* Ears */}
      <ellipse cx="122" cy="90" rx="6" ry="9" fill="#fde8d0" />
      <ellipse cx="198" cy="90" rx="6" ry="9" fill="#fde8d0" />

      {/* Stethoscope */}
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

      {/* Clipboard in hand */}
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

      {/* Name tag */}
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

    {/* Floating badge 1 — ECG */}
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

    {/* Floating badge 2 — Verified */}
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

    {/* Floating badge 3 — Available */}
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

/* ─── Spinning DNA decoration ─────────────────────────────────────────────── */
const DNAOrb = () => (
  <svg
    viewBox="0 0 80 80"
    xmlns="http://www.w3.org/2000/svg"
    className="spin-slow w-full h-full opacity-20"
    aria-hidden="true"
  >
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
    <path
      d="M20,40 Q40,20 60,40 Q40,60 20,40z"
      fill="none"
      stroke="white"
      strokeWidth="2"
    />
    <circle cx="40" cy="40" r="5" fill="white" opacity=".4" />
  </svg>
);

/* ─── Stats data ──────────────────────────────────────────────────────────── */
const heroStats = [
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
];

/* ─── Skeleton card ───────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="shimmer-bg h-44 w-full rounded-2xl mb-4" />
    <div className="shimmer-bg h-4 w-3/4 rounded-full mb-2" />
    <div className="shimmer-bg h-3 w-1/2 rounded-full mb-4" />
    <div className="shimmer-bg h-3 w-full rounded-full mb-2" />
    <div className="shimmer-bg h-9 w-full rounded-xl mt-4" />
  </div>
);

/* ─── Doctor card ─────────────────────────────────────────────────────────── */
const DoctorCard = ({ doctor, index }) => {
  const name = doctor?.userId?.fullName || 'Doctor';
  const photo = doctor?.userId?.profilePicture;
  const dept = doctor?.department?.name || 'General';
  const spec = doctor?.specialization || '';
  const exp = doctor?.experience;
  const fee = doctor?.consultationFee;
  const qual = doctor?.qualification || '';

  //rating info

  const stars = doctor?.averageRating || 0;

  const ratingDisplay = Number(stars).toFixed(1);

  const reviewCount = doctor?.totalReviews || 0;

  return (
    <div
      className="doc-card card-anim rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col"
      style={{ animationDelay: `${0.06 + (index % 8) * 0.07}s` }}
    >
      {/* Avatar area */}
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 h-48 flex items-end px-5 pt-5 pb-0">
        {/* Decorative circles */}
        <div className="absolute top-3 right-3 h-16 w-16 rounded-full bg-blue-100/50 blur-xl" />
        <div className="absolute top-8 left-5 h-10 w-10 rounded-full bg-indigo-100/60 blur-lg" />

        {/* Dept badge top-left */}
        <span className="absolute top-3 left-3 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-blue-700 backdrop-blur-sm shadow-sm">
          {dept}
        </span>

        {/* Avatar */}
        <div className="card-avatar-ring mx-auto mb-0 h-28 w-28 rounded-2xl overflow-hidden ring-2 ring-white shadow-lg transition-all duration-300 absolute bottom-0 left-1/2 -translate-x-1/2">
          <DoctorAvatar
            src={photo}
            name={name}
            index={index}
            className="h-full w-full"
          />
        </div>

        {/* Available dot */}
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-green-700 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 pulse-dot" />
          Available
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-5 pt-14 pb-5">
        {/* Name */}
        <h3 className="text-center text-lg font-bold text-slate-900 leading-tight">
          Dr. {name}
        </h3>
        <p className="mt-0.5 text-center text-sm font-medium text-blue-600">
          {spec || dept}
        </p>

        {/* Rating */}
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg
                key={s}
                className={`h-3.5 w-3.5 ${s <= Math.round(stars) ? 'text-amber-400' : 'text-slate-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs font-bold text-slate-700">
            {ratingDisplay} ★
          </span>

          <span className="text-xs text-slate-400">{reviewCount} reviews</span>
        </div>

        {/* Meta chips */}
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {exp && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {exp} yrs exp.
            </span>
          )}
          {qual && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
              {qual}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="my-3 h-px bg-slate-100" />

        {/* Fee */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Consultation Fee</span>
          <span className="text-base font-extrabold text-blue-700">
            {fee ? `₹${fee}` : 'Free'}
          </span>
        </div>

        {/* CTA */}
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

/* ─── Empty state ─────────────────────────────────────────────────────────── */
const EmptyState = ({ query }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
    <svg
      viewBox="0 0 120 100"
      xmlns="http://www.w3.org/2000/svg"
      className="float-2 mb-6 w-32"
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
      <circle
        cx="78"
        cy="30"
        r="8"
        fill="#fef9c3"
        stroke="#fde047"
        strokeWidth="1.5"
      />
      <text
        x="75"
        y="33"
        fontFamily="sans-serif"
        fontSize="9"
        fill="#ca8a04"
        fontWeight="800"
      >
        ?
      </text>
    </svg>
    <h3 className="text-xl font-bold text-slate-800">No doctors found</h3>
    <p className="mt-2 max-w-xs text-sm text-slate-500">
      {query
        ? `No results for "${query}". Try a different name or specialty.`
        : 'No doctors are currently available. Please check back soon.'}
    </p>
  </div>
);

/* ─── Main Page ───────────────────────────────────────────────────────────── */
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

      <div className="doc-root min-h-screen bg-[#f0f5fb] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* ── HERO ──────────────────────────────────────────────────────── */}
          <div className="anim-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 shadow-2xl">
            {/* grid texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            {/* glow blobs */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white opacity-5" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-indigo-400 opacity-10 blur-3xl" />
            <div className="pointer-events-none absolute right-1/3 top-0 h-40 w-40 rounded-full bg-cyan-400 opacity-5 blur-2xl" />

            {/* Spinning DNA orb decoration */}
            <div className="pointer-events-none absolute top-4 right-4 h-20 w-20 hidden lg:block">
              <DNAOrb />
            </div>

            <div className="relative flex flex-col gap-8 px-8 py-10 md:flex-row md:items-center md:px-12">
              {/* Text */}
              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-widest text-blue-100 uppercase backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 pulse-dot" />
                  Find Your Doctor
                </span>

                <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                  Expert Care,
                  <br />
                  <span className="text-blue-200">Right When You Need It</span>
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-blue-100/85 sm:text-base">
                  Browse our network of certified specialists and book your
                  consultation in under 60 seconds. Your health deserves the
                  best.
                </p>

                {/* Search bar */}
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
              <div className="mx-auto h-56 w-64 flex-shrink-0 md:mx-0 md:h-64 md:w-72 lg:h-72 lg:w-80 relative">
                <HeroIllustration />
              </div>
            </div>

            {/* Stats strip */}
            <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="grid grid-cols-2 divide-x divide-white/10 sm:grid-cols-4">
                {heroStats.map((st) => (
                  <div
                    key={st.label}
                    className="stat-strip flex items-center gap-3 px-6 py-4"
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
                      <p className="text-[11px] text-blue-200/80">{st.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── FILTER CHIPS ──────────────────────────────────────────────── */}
          <div className="anim-fade-up d2 flex flex-wrap gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setActive(dept)}
                className={`filter-chip rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
                  activeFilter === dept
                    ? 'active'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600 shadow-sm'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Results count */}
          {!loading && (
            <div className="anim-fade-in d3 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing{' '}
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
                    matching{' '}
                    <span className="font-semibold text-blue-600">
                      "{search}"
                    </span>
                  </span>
                )}
              </p>
            </div>
          )}

          {/* ── DOCTOR GRID ───────────────────────────────────────────────── */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filtered.length === 0 ? (
              <EmptyState query={search} />
            ) : (
              filtered.map((doctor, i) => (
                <DoctorCard key={doctor._id} doctor={doctor} index={i} />
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorsPage;
