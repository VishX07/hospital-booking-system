/**
 * ============================================================
 *  PatientSettingsPage.jsx
 *
 *  Sections:
 *   1. Styles & Keyframes
 *   2. Avatar with fallback
 *   3. Profile Illustration (hero SVG)
 *   4. Progress Ring
 *   5. Stat Pills
 *   6. Photo Upload Card
 *   7. Personal Info Form
 *   8. Security Card
 *   9. Main Page Component
 * ============================================================
 */

import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import useAuthStore from '../../store/auth.store.js';
import { updateProfile, updateProfilePhoto } from '../../api/auth.api.js';
import ROUTES from '../../constants/routes.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';

/* ================================================================
   1. STYLES & KEYFRAMES
   ================================================================ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .ps-root { font-family:'DM Sans',sans-serif; }
  .ps-root h1,.ps-root h2,.ps-root h3 { font-family:'Sora',sans-serif; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
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
  @keyframes pulseDot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.4; transform:scale(1.6); }
  }
  @keyframes spinSlow { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes shimmer {
    0%   { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  @keyframes ringFill {
    from { stroke-dashoffset: 207; }
  }
  @keyframes checkDraw {
    from { stroke-dashoffset:24; }
    to   { stroke-dashoffset:0; }
  }
  @keyframes spinBtn {
    to { transform:rotate(360deg); }
  }

  .anim-fade-up { animation:fadeUp .55s ease both; }
  .d1{animation-delay:.06s} .d2{animation-delay:.12s} .d3{animation-delay:.18s}
  .d4{animation-delay:.24s} .d5{animation-delay:.30s} .d6{animation-delay:.36s}

  .float-1 { animation:float1 5.5s ease-in-out infinite; }
  .float-2 { animation:float2 4.8s ease-in-out infinite .7s; }
  .float-3 { animation:float3 6.2s ease-in-out infinite 1.3s; }
  .pulse-dot { animation:pulseDot 2s ease-in-out infinite; }
  .spin-slow  { animation:spinSlow 22s linear infinite; }
  .ring-anim  { animation:ringFill 1.2s cubic-bezier(.4,0,.2,1) .3s both; }
  .check-draw {
    stroke-dasharray:24;
    stroke-dashoffset:24;
    animation:checkDraw .45s ease forwards .2s;
  }

  /* Glass panel */
  .glass-panel {
    background:rgba(255,255,255,0.6);
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
    border:1px solid rgba(255,255,255,0.75);
  }

  /* Info card */
  .info-card {
    transition:transform .22s ease, box-shadow .22s ease;
  }
  .info-card:hover {
    transform:translateY(-3px);
    box-shadow:0 12px 36px rgba(29,78,216,.09);
  }

  /* Input focus */
  .rx-input {
    transition:all .18s ease;
  }
  .rx-input:focus {
    outline:none;
    border-color:#3b82f6;
    box-shadow:0 0 0 3px rgba(59,130,246,.15);
    background:white;
  }
  .rx-input:disabled {
    background:#f8fafc;
    color:#94a3b8;
    cursor:not-allowed;
  }

  /* Buttons */
  .btn-act { transition:all .2s cubic-bezier(.34,1.3,.64,1); }
  .btn-act:hover:not(:disabled) { transform:translateY(-2px); }
  .btn-act:disabled { opacity:.6; cursor:not-allowed; }

  /* Upload zone */
  .upload-zone {
    transition:all .2s ease;
    border:2px dashed #bfdbfe;
    background:#f8fafc;
    border-radius:16px;
    cursor:pointer;
  }
  .upload-zone:hover {
    border-color:#3b82f6;
    background:#eff6ff;
    transform:scale(1.01);
  }
  .upload-zone.drag-over {
    border-color:#2563eb;
    background:#dbeafe;
  }

  /* Field pill hover */
  .field-pill { transition:background .16s ease; }
  .field-pill:hover { background:#f8faff; }

  /* Spinner */
  .btn-spinner {
    width:15px; height:15px;
    border:2px solid rgba(255,255,255,.3);
    border-top-color:white;
    border-radius:50%;
    animation:spinBtn .7s linear infinite;
    display:inline-block;
    flex-shrink:0;
  }

  /* Shimmer */
  .shimmer-bg {
    background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
    background-size:200% 100%;
    animation:shimmer 1.4s infinite;
  }
`;

/* ================================================================
   2. AVATAR WITH FALLBACK
   ================================================================ */
const PALETTES = [
  { bg: '#eff6ff', fg: '#1d4ed8', border: '#bfdbfe' },
  { bg: '#eef2ff', fg: '#4338ca', border: '#c7d2fe' },
  { bg: '#f0fdfa', fg: '#0f766e', border: '#99f6e4' },
  { bg: '#fdf4ff', fg: '#7e22ce', border: '#e9d5ff' },
];
const UserAvatar = ({ src, name = '', size = 'lg', className = '' }) => {
  const [err, setErr] = useState(false);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  const p = PALETTES[name.length % PALETTES.length];
  const text =
    size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-base';
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
      className={`flex items-center justify-center font-bold select-none ${text} ${className}`}
      style={{ background: p.bg, color: p.fg, border: `2px solid ${p.border}` }}
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
   3. HERO ILLUSTRATION
   Profile / settings themed SVG with floating badges.
   ================================================================ */
const ProfileIllustration = ({ completion }) => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    {/* Main SVG */}
    <svg
      viewBox="0 0 280 240"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ps-cardGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity=".9" />
          <stop offset="100%" stopColor="#3730a3" />
        </linearGradient>
      </defs>

      {/* Outer ring */}
      <circle
        cx="140"
        cy="120"
        r="112"
        fill="none"
        stroke="rgba(255,255,255,.06)"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        className="spin-slow"
      />

      {/* Profile card */}
      <rect
        x="60"
        y="28"
        width="160"
        height="185"
        rx="20"
        fill="white"
        opacity=".96"
      />
      <rect
        x="60"
        y="28"
        width="160"
        height="65"
        rx="20"
        fill="url(#ps-cardGrad)"
      />
      <rect x="60" y="73" width="160" height="20" fill="url(#ps-cardGrad)" />

      {/* Avatar circle */}
      <circle
        cx="140"
        cy="93"
        r="30"
        fill="white"
        stroke="rgba(255,255,255,.6)"
        strokeWidth="3"
      />
      <circle cx="140" cy="85" r="13" fill="#bfdbfe" />
      <ellipse cx="140" cy="108" rx="18" ry="11" fill="#bfdbfe" />

      {/* Name lines */}
      <rect x="100" y="128" width="80" height="8" rx="4" fill="#e2e8f0" />
      <rect x="110" y="141" width="60" height="6" rx="3" fill="#f1f5f9" />

      {/* Profile fields */}
      {[158, 174, 190].map((y, i) => (
        <g key={i}>
          <rect
            x="74"
            y={y}
            width="132"
            height="11"
            rx="5"
            fill={i === 0 ? '#eff6ff' : '#f8fafc'}
            stroke={i === 0 ? '#bfdbfe' : '#e2e8f0'}
            strokeWidth="1"
          />
          <rect
            x="80"
            y={y + 3}
            width={i === 0 ? 55 : 45}
            height="5"
            rx="2.5"
            fill={i === 0 ? '#93c5fd' : '#e2e8f0'}
          />
          <rect
            x={80 + (i === 0 ? 60 : 50)}
            y={y + 3}
            width={i === 0 ? 40 : 35}
            height="5"
            rx="2.5"
            fill={i === 0 ? '#dbeafe' : '#f1f5f9'}
          />
        </g>
      ))}

      {/* Verified check */}
      <circle
        cx="200"
        cy="205"
        r="18"
        fill="#dcfce7"
        stroke="#86efac"
        strokeWidth="1.5"
      />
      <path
        d="M191,205 l6,6 11-12"
        stroke="#16a34a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Stethoscope top-right */}
      <circle
        cx="248"
        cy="65"
        r="22"
        fill="rgba(255,255,255,.09)"
        stroke="rgba(255,255,255,.18)"
        strokeWidth="1"
      />
      <path
        d="M238,58 Q240,48 248,48 Q256,48 258,58"
        fill="none"
        stroke="rgba(255,255,255,.65)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="238"
        y1="58"
        x2="238"
        y2="71"
        stroke="rgba(255,255,255,.65)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle
        cx="238"
        cy="75"
        r="5"
        fill="none"
        stroke="rgba(255,255,255,.65)"
        strokeWidth="2.5"
      />
      <circle cx="238" cy="75" r="2.2" fill="rgba(255,255,255,.4)" />

      {/* Pills bottom-left */}
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

      {/* Cross decoration */}
      <rect
        x="32"
        y="38"
        width="9"
        height="26"
        rx="4"
        fill="rgba(255,255,255,.28)"
      />
      <rect
        x="23"
        y="47"
        width="27"
        height="9"
        rx="4"
        fill="rgba(255,255,255,.28)"
      />
    </svg>

    {/* Badge: Profile % */}
    <svg
      viewBox="0 0 112 42"
      xmlns="http://www.w3.org/2000/svg"
      className="float-2 absolute top-2 right-0 w-28"
      aria-hidden="true"
    >
      <rect width="112" height="42" rx="12" fill="white" opacity=".95" />
      <rect
        width="112"
        height="42"
        rx="12"
        fill="none"
        stroke="#bfdbfe"
        strokeWidth="1"
      />
      <circle cx="18" cy="21" r="9" fill="#eff6ff" />
      <circle cx="18" cy="21" r="4" fill="#3b82f6" className="pulse-dot" />
      <text
        x="33"
        y="17"
        fontFamily="sans-serif"
        fontSize="7"
        fill="#64748b"
        fontWeight="600"
      >
        PROFILE
      </text>
      <text
        x="33"
        y="31"
        fontFamily="sans-serif"
        fontSize="13"
        fill="#1d4ed8"
        fontWeight="800"
      >
        {completion}%
      </text>
    </svg>

    {/* Badge: Verified */}
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
        VERIFIED
      </text>
      <text x="32" y="28" fontFamily="sans-serif" fontSize="7" fill="#64748b">
        Patient Account
      </text>
    </svg>

    {/* Badge: Secure */}
    <svg
      viewBox="0 0 96 34"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute top-14 left-0 w-24"
      style={{ animationDelay: '1s' }}
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
      <circle cx="14" cy="17" r="4.5" fill="#3b82f6" className="pulse-dot" />
      <text
        x="24"
        y="13"
        fontFamily="sans-serif"
        fontSize="7"
        fill="#0f172a"
        fontWeight="700"
      >
        SECURED
      </text>
      <text x="24" y="24" fontFamily="sans-serif" fontSize="6.5" fill="#64748b">
        AlphaCare
      </text>
    </svg>
  </div>
);

/* ================================================================
   4. PROGRESS RING (SVG circular progress)
   ================================================================ */
const ProgressRing = ({ pct }) => {
  const r = 30;
  const circ = 2 * Math.PI * r;
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      aria-label={`${pct}% complete`}
    >
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,.15)"
        strokeWidth="5"
      />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,.85)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        transform="rotate(-90 36 36)"
        className="ring-anim"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
      />
      <text
        x="36"
        y="33"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="800"
        fontFamily="Sora,sans-serif"
      >
        {pct}%
      </text>
      <text
        x="36"
        y="46"
        textAnchor="middle"
        fill="rgba(255,255,255,.6)"
        fontSize="7.5"
        fontFamily="DM Sans,sans-serif"
      >
        done
      </text>
    </svg>
  );
};

/* ================================================================
   5. SECTION HEADING
   ================================================================ */
const SHead = ({ icon, title, sub, color = 'blue' }) => (
  <div className="mb-5 flex items-center gap-3">
    <span
      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-${color}-50 text-${color}-600`}
    >
      {icon}
    </span>
    <div>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {sub && <p className="text-sm text-slate-500">{sub}</p>}
    </div>
  </div>
);

/* ================================================================
   9. MAIN PAGE COMPONENT
   ================================================================ */
const PatientSettingsPage = () => {
  const { user, fetchCurrentUser } = useAuthStore();

  /* ── Profile completion ── */
  const fields = [
    user?.fullName,
    user?.email,
    user?.phoneNumber,
    user?.gender,
    user?.dateOfBirth,
    user?.profilePicture,
  ];
  const completedFields = fields.filter(Boolean).length;
  const profileCompletion = Math.round((completedFields / fields.length) * 100);
  const isIncomplete = !user?.gender || !user?.dateOfBirth;

  /* ── State ── */
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    if (user)
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth?.split('T')[0] || '',
      });
  }, [user]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* ── Update profile ── */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile({
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        ...(formData.phoneNumber && {
          phoneNumber: formData.phoneNumber,
          fullName: formData.fullName,
        }),
      });
      await fetchCurrentUser();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  /* ── Upload photo ── */
  const handlePhotoUpload = async () => {
    if (!selectedFile) return toast.error('Please select a photo first');
    try {
      setPhotoLoading(true);
      const fd = new FormData();
      fd.append('profilePicture', selectedFile);
      await updateProfilePhoto(fd);
      await fetchCurrentUser();
      toast.success('Profile photo updated!');
      setSelectedFile(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('image/')) setSelectedFile(f);
  };

  /* ─────────────────────────────────────────────────────────── */
  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="ps-root min-h-screen bg-[#f0f5fb] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
          {/* ============================================================
              HERO SECTION
              ============================================================ */}
          <div className="anim-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 shadow-2xl">
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
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-44 w-44 rounded-full bg-indigo-300 opacity-10 blur-3xl" />
            {/* Spinning ring — desktop */}
            <div className="pointer-events-none absolute top-4 left-4 hidden h-16 w-16 opacity-20 lg:block">
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

            <div className="relative flex items-center gap-5 px-5 py-6 sm:px-8 sm:py-8 md:gap-8">
              {/* Left — avatar + info */}
              <div className="flex flex-1 items-center gap-4 min-w-0">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl ring-3 ring-white/40 shadow-xl sm:h-20 sm:w-20 md:h-24 md:w-24">
                    <UserAvatar
                      src={user?.profilePicture}
                      name={user?.fullName || ''}
                      size="lg"
                      className="h-full w-full rounded-2xl"
                    />
                  </div>
                  {/* Verified dot */}
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg ring-2 ring-white">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                        className="check-draw"
                      />
                    </svg>
                  </span>
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  {/* Eyebrow */}
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest text-blue-100 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 pulse-dot" />
                    Patient Portal
                  </div>
                  <h1 className="text-xl font-extrabold text-white leading-tight truncate sm:text-2xl md:text-3xl">
                    {user?.fullName || 'My Profile'}
                  </h1>
                  <p className="mt-0.5 text-xs text-blue-100/75 truncate sm:text-sm">
                    {user?.email}
                  </p>

                  {/* Status chips — hidden on xs to save space */}
                  <div className="mt-2 hidden sm:flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm capitalize">
                      {user?.role || 'Patient'}
                    </span>
                    {user?.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/25 px-2.5 py-0.5 text-xs font-bold text-emerald-300 backdrop-blur-sm">
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
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Verified
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold backdrop-blur-sm ${isIncomplete ? 'bg-amber-400/25 text-amber-300' : 'bg-emerald-500/25 text-emerald-300'}`}
                    >
                      {profileCompletion}% complete
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress ring — hidden on small mobile */}
              <div className="hidden sm:block flex-shrink-0">
                <ProgressRing pct={profileCompletion} />
              </div>

              {/* Illustration — desktop only */}
              <div className="hidden md:block h-44 w-52 flex-shrink-0 lg:h-52 lg:w-60 relative">
                <ProfileIllustration completion={profileCompletion} />
              </div>
            </div>

            {/* Mobile: progress bar strip at bottom of hero */}
            <div className="sm:hidden border-t border-white/10 bg-white/5 px-5 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-blue-200">
                  Profile Completion
                </span>
                <span className="text-xs font-bold text-white">
                  {profileCompletion}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
          </div>

          {/* ============================================================
              INCOMPLETE ALERT
              ============================================================ */}
          {isIncomplete && (
            <div className="anim-fade-up d1 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 sm:rounded-3xl sm:px-5 sm:py-4">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <svg
                  className="h-5 w-5"
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
                <p className="text-sm font-bold text-amber-800">
                  Profile Incomplete
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Missing:{' '}
                  {[
                    !user?.gender && 'Gender',
                    !user?.dateOfBirth && 'Date of Birth',
                  ]
                    .filter(Boolean)
                    .join(' · ')}{' '}
                  — fill in below to complete your profile.
                </p>
              </div>
            </div>
          )}

          {/* ============================================================
              STAT PILLS
              2 cols on mobile, 3 on sm+
              ============================================================ */}
          <div className="anim-fade-up d2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              {
                label: 'Role',
                value: user?.role || 'Patient',
                iconBg: 'bg-blue-50',
                iconColor: 'text-blue-600',
                numColor: 'text-blue-700',
                icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0',
              },
              {
                label: 'Status',
                value: user?.isVerified ? 'Verified' : 'Unverified',
                iconBg: 'bg-emerald-50',
                iconColor: 'text-emerald-600',
                numColor: 'text-emerald-700',
                icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
              },
              {
                label: 'Gender',
                value: user?.gender
                  ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                  : 'Not Set',
                iconBg: 'bg-purple-50',
                iconColor: 'text-purple-600',
                numColor: 'text-purple-700',
                icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z',
              },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`info-card anim-fade-up d${i + 2} rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl ${i === 2 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                {/* Horizontal on mobile, vertical on sm+ */}
                <div className="flex items-center gap-3 sm:block">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${s.iconBg} sm:mb-3`}
                  >
                    <svg
                      className={`h-4 w-4 ${s.iconColor}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={s.icon}
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {s.label}
                    </p>
                    <p
                      className={`text-sm font-extrabold capitalize mt-0.5 ${s.numColor} sm:text-base`}
                    >
                      {s.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ============================================================
              MAIN CONTENT — single column (sidebar on xl if needed)
              ============================================================ */}
          <div className="space-y-4 sm:space-y-5">
            {/* === PROFILE PHOTO === */}
            <section className="info-card anim-fade-up d3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <SHead
                title="Profile Photo"
                sub="Upload a clear headshot"
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                    />
                  </svg>
                }
              />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Current avatar */}
                <div className="relative flex-shrink-0 self-center sm:self-start">
                  <div className="h-20 w-20 overflow-hidden rounded-2xl ring-2 ring-blue-100 shadow sm:h-24 sm:w-24">
                    <UserAvatar
                      src={user?.profilePicture}
                      name={user?.fullName || ''}
                      size="lg"
                      className="h-full w-full rounded-2xl"
                    />
                  </div>
                  {selectedFile && (
                    <div className="absolute inset-0 rounded-2xl bg-blue-600/15 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-blue-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Upload zone */}
                <div className="flex-1">
                  <div
                    className={`upload-zone ${dragOver ? 'drag-over' : ''} p-4 text-center`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <svg
                      className="h-8 w-8 text-blue-300 mx-auto mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <p className="text-sm font-bold text-blue-600">
                      {selectedFile
                        ? selectedFile.name
                        : 'Click or drag to upload'}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={handlePhotoUpload}
                      disabled={photoLoading}
                      className="btn-act flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-60"
                      style={{ boxShadow: '0 4px 14px rgba(37,99,235,.28)' }}
                    >
                      {photoLoading ? (
                        <>
                          <span className="btn-spinner" />
                          Uploading…
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
                              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                            />
                          </svg>
                          Upload Photo
                        </>
                      )}
                    </button>
                    {selectedFile && (
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="btn-act inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        ✕ Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* === PERSONAL INFO FORM === */}
            <section className="info-card anim-fade-up d4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <SHead
                title="Personal Information"
                sub="Update your profile details"
                color="green"
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
                    />
                  </svg>
                }
              />

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* Grid: 1 col mobile, 2 col sm+ */}
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {/* Email — locked */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                      <svg
                        className="h-4 w-4 text-slate-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                      <span className="text-sm text-slate-400 truncate">
                        {user?.email}
                      </span>
                      <span className="ml-auto flex-shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        Locked
                      </span>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Full Name
                    </label>
                    <input
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="rx-input w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="rx-input w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Gender{' '}
                      {!user?.gender && (
                        <span className="text-amber-500 ml-1">Required</span>
                      )}
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required={isIncomplete && !user?.gender}
                      className="rx-input w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 appearance-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* DOB — full width */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Date of Birth{' '}
                      {!user?.dateOfBirth && (
                        <span className="text-amber-500 ml-1">Required</span>
                      )}
                    </label>
                    <input
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="rx-input w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 sm:max-w-xs"
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-400">
                    Name and email changes require support.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-act inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                    style={{ boxShadow: '0 4px 14px rgba(37,99,235,.28)' }}
                  >
                    {loading ? (
                      <>
                        <span className="btn-spinner" />
                        Saving…
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
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* === SECURITY === */}
            <section className="info-card anim-fade-up d5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <SHead
                title="Security"
                sub="Keep your account protected"
                color="amber"
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                }
              />

              <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm sm:text-base">
                    Password
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update your password regularly for better security.
                  </p>
                </div>
                <Link
                  to={ROUTES.CHANGE_PASSWORD}
                  className="btn-act inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-700 flex-shrink-0"
                  style={{
                    textDecoration: 'none',
                    transition: 'all .18s ease',
                  }}
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
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                  Change Password
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientSettingsPage;
