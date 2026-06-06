/*
 * MyPatientsPage.jsx — AlphaCare Design System
 * Sections:
 *  1. Styles & Keyframes
 *  2. PatientAvatar Sub-Component
 *  3. SkeletonCard Sub-Component
 *  4. EmptyState Sub-Component
 *  5. PatientCard Sub-Component
 *  6. Hero Illustration SVG
 *  7. MyPatientsPage Main Component
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { getMyPatients } from '../../api/doctor.api.js';

/* === 1. STYLES & KEYFRAMES === */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  * { font-family: 'DM Sans', sans-serif; }
  h1, h2, h3, h4, .sora { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float1 {
    0%,100% { transform: translateY(0) rotate(-1.5deg); }
    50%     { transform: translateY(-12px) rotate(1.5deg); }
  }
  @keyframes float2 {
    0%,100% { transform: translateY(0) rotate(1deg); }
    50%     { transform: translateY(-8px) rotate(-1deg); }
  }
  @keyframes float3 {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-6px); }
  }
  @keyframes pulseDot {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: .4; transform: scale(1.6); }
  }
  @keyframes spinSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(16px) scale(.98); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }

  .float-1  { animation: float1 5.5s ease-in-out infinite; }
  .float-2  { animation: float2 4.8s ease-in-out infinite .7s; }
  .float-3  { animation: float3 6.2s ease-in-out infinite 1.3s; }
  .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
  .spin-slow { animation: spinSlow 22s linear infinite; }
  .anim-fade-up { animation: fadeUp .55s ease both; }
  .d1 { animation-delay: .06s; } .d2 { animation-delay: .12s; }
  .d3 { animation-delay: .18s; } .d4 { animation-delay: .24s; }
  .d5 { animation-delay: .30s; }

  .glass-panel {
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.75);
  }
  .shimmer-bg {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }
  .patient-card {
    transition: transform .22s ease, box-shadow .22s ease;
  }
  .patient-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 36px rgba(37,99,235,.13);
  }
  .btn-act {
    transition: transform .18s ease, box-shadow .18s ease;
    box-shadow: 0 4px 14px rgba(37,99,235,.28);
  }
  .btn-act:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(37,99,235,.36);
  }
  .search-input:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(59,130,246,.15);
    background: white;
    outline: none;
  }
  .stat-glass {
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
  }
`;

/* === 2. PATIENT AVATAR SUB-COMPONENT === */
const AVATAR_PALETTE = [
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#e0e7ff', text: '#4338ca' },
  { bg: '#ccfbf1', text: '#0f766e' },
  { bg: '#ede9fe', text: '#6d28d9' },
  { bg: '#ffedd5', text: '#c2410c' },
];

const PatientAvatar = ({ src, name, index, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'P';
  const sizeClass = size === 'lg' ? 'h-20 w-20 text-xl' : 'h-14 w-14 text-base';

  if (!src || imgError) {
    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
        style={{ background: palette.bg, color: palette.text }}
      >
        {initials}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setImgError(true)}
      className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
    />
  );
};

/* === 3. SKELETON CARD SUB-COMPONENT === */
const SkeletonCard = () => (
  <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
    <div className="flex items-start gap-4">
      <div className="shimmer-bg h-14 w-14 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="shimmer-bg h-4 w-2/3 rounded-full" />
        <div className="shimmer-bg h-3 w-1/3 rounded-full" />
        <div className="shimmer-bg h-3 w-1/4 rounded-full" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="shimmer-bg h-3 w-full rounded-full" />
      <div className="shimmer-bg h-3 w-3/4 rounded-full" />
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="shimmer-bg h-14 rounded-2xl" />
      <div className="shimmer-bg h-14 rounded-2xl" />
    </div>
    <div className="mt-4 shimmer-bg h-11 rounded-2xl" />
  </div>
);

/* === 4. EMPTY STATE SUB-COMPONENT === */
const EmptyState = ({ isFiltered }) => (
  <div className="rounded-3xl bg-white border border-dashed border-slate-300 p-10 text-center shadow-sm anim-fade-up">
    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center">
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="float-1 w-full h-full"
      >
        <circle
          cx="40"
          cy="40"
          r="38"
          fill="#eff6ff"
          stroke="#bfdbfe"
          strokeWidth="2"
        />
        <circle
          cx="40"
          cy="30"
          r="11"
          fill="#bfdbfe"
          stroke="#93c5fd"
          strokeWidth="1.5"
        />
        <path
          d="M18 62c0-12.15 9.85-22 22-22s22 9.85 22 22"
          stroke="#93c5fd"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="56" cy="56" r="10" fill="#2563eb" />
        <path
          d="M56 51v10M51 56h10"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
    <h3 className="sora text-lg font-bold text-slate-800">
      {isFiltered ? 'No Matching Patients' : 'No Patients Yet'}
    </h3>
    <p className="mt-1.5 text-sm text-slate-500 max-w-xs mx-auto">
      {isFiltered
        ? 'Try adjusting your search query.'
        : 'Patients you consult will appear here.'}
    </p>
  </div>
);

/* === 5. PATIENT CARD SUB-COMPONENT === */
const PatientCard = ({ patient, index, onView }) => {
  console.log('Rendering PatientCard for:', patient.fullName);
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    )
      age--;
    return age;
  };

  const genderColor =
    patient.gender === 'male'
      ? { bg: 'bg-blue-50', text: 'text-blue-700', dot: '#2563eb' }
      : patient.gender === 'female'
        ? { bg: 'bg-pink-50', text: 'text-pink-700', dot: '#db2777' }
        : { bg: 'bg-slate-50', text: 'text-slate-600', dot: '#64748b' };

  const delayClass = ['d1', 'd2', 'd3', 'd4', 'd5'][index % 5];

  return (
    <div
      className={`patient-card anim-fade-up ${delayClass} rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden`}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Status tint strip */}
      <div
        className={`h-1.5 w-full`}
        style={{
          background: `linear-gradient(to right, ${genderColor.dot}55, transparent)`,
        }}
      />

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start gap-4">
          <PatientAvatar
            src={patient.profilePicture}
            name={patient.fullName}
            index={index}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <h3 className="sora text-base font-bold text-slate-900 truncate">
              {patient.fullName}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${genderColor.bg} ${genderColor.text}`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: genderColor.dot }}
                />
                {patient.gender
                  ? patient.gender.charAt(0).toUpperCase() +
                    patient.gender.slice(1)
                  : 'Not Set'}
              </span>
              <span className="text-xs text-slate-500">
                Age {calculateAge(patient.dateOfBirth)}
              </span>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-4 space-y-1.5">
          <p className="flex items-center gap-2 text-sm text-slate-600 truncate">
            <svg
              className="h-4 w-4 flex-shrink-0 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="truncate">{patient.email || '—'}</span>
          </p>
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <svg
              className="h-4 w-4 flex-shrink-0 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {patient.phoneNumber || '—'}
          </p>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-xs text-slate-500 font-medium">Appointments</p>
            <p className="mt-1 text-lg font-bold text-slate-800 sora">
              {patient.totalAppointments ?? '—'}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-xs text-slate-500 font-medium">Last Visit</p>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {patient.lastVisit
                ? new Date(patient.lastVisit).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit',
                  })
                : '—'}
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onView(patient._id)}
          className="btn-act mt-4 w-full rounded-2xl bg-teal-600 py-2.5 text-sm font-semibold text-white"
        >
          View Patient
        </button>
      </div>
    </div>
  );
};

/* === 6. HERO ILLUSTRATION SVG === */
const HeroIllustration = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    {/* Main floating SVG */}
    <svg
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute inset-0 w-full h-full"
    >
      <defs>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="avatarGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>
      </defs>

      {/* Spinning ring */}
      <circle
        cx="110"
        cy="110"
        r="100"
        stroke="white"
        strokeWidth="1"
        strokeOpacity="0.15"
        strokeDasharray="8 6"
        className="spin-slow"
        style={{ transformOrigin: '110px 110px' }}
      />

      {/* Patient card base */}
      <rect
        x="38"
        y="44"
        width="144"
        height="132"
        rx="18"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Card header */}
      <rect
        x="38"
        y="44"
        width="144"
        height="36"
        rx="18"
        fill="url(#cardGrad)"
      />
      <rect x="38" y="62" width="144" height="18" fill="url(#cardGrad)" />
      <text
        x="70"
        y="68"
        fill="white"
        fontSize="11"
        fontWeight="700"
        fontFamily="Sora"
      >
        My Patients
      </text>
      <circle cx="163" cy="62" r="10" fill="white" fillOpacity="0.2" />
      <path
        d="M159 62h8M163 58v8"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Patient rows */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(0, ${i * 28})`}>
          <circle cx="60" cy="102" r="10" fill="url(#avatarGrad)" />
          <rect x="76" y="96" width="50" height="6" rx="3" fill="#e2e8f0" />
          <rect x="76" y="106" width="32" height="4" rx="2" fill="#f1f5f9" />
          <rect x="150" y="98" width="20" height="8" rx="4" fill="#dbeafe" />
          <text x="152" y="105" fill="#2563eb" fontSize="6" fontWeight="600">
            Visit
          </text>
        </g>
      ))}

      {/* Stethoscope */}
      <circle cx="174" cy="156" r="12" fill="#eff6ff" />
      <path
        d="M169 151 q0 8 5 8 q5 0 5-8"
        stroke="#2563eb"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <line
        x1="174"
        y1="159"
        x2="174"
        y2="165"
        stroke="#2563eb"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="174" cy="167" r="3" fill="#2563eb" />
    </svg>

    {/* Badge 1 — Active patients */}
    <svg
      viewBox="0 0 90 34"
      className="float-2 absolute"
      style={{ top: '8%', right: '-8%', width: 88 }}
    >
      <rect
        width="90"
        height="34"
        rx="10"
        fill="white"
        fillOpacity="0.92"
        stroke="#bfdbfe"
        strokeWidth="1"
      />
      <circle cx="14" cy="17" r="5" fill="#dbeafe" />
      <circle cx="14" cy="17" r="3" fill="#2563eb" className="pulse-dot" />
      <text
        x="24"
        y="14"
        fill="#1e40af"
        fontSize="7"
        fontWeight="700"
        fontFamily="Sora"
      >
        Active
      </text>
      <text
        x="24"
        y="24"
        fill="#2563eb"
        fontSize="9"
        fontWeight="800"
        fontFamily="Sora"
      >
        Patients
      </text>
    </svg>

    {/* Badge 2 — New this week */}
    <svg
      viewBox="0 0 88 32"
      className="float-3 absolute"
      style={{ bottom: '14%', left: '-10%', width: 84 }}
    >
      <rect
        width="88"
        height="32"
        rx="9"
        fill="white"
        fillOpacity="0.92"
        stroke="#c7d2fe"
        strokeWidth="1"
      />
      <text x="10" y="13" fill="#6d28d9" fontSize="7" fontWeight="600">
        New this week
      </text>
      <text
        x="10"
        y="26"
        fill="#4338ca"
        fontSize="10"
        fontWeight="800"
        fontFamily="Sora"
      >
        +12
      </text>
    </svg>

    {/* Badge 3 — Follow-up */}
    <svg
      viewBox="0 0 82 30"
      className="float-1 absolute"
      style={{ bottom: '4%', right: '-4%', width: 78, animationDelay: '1s' }}
    >
      <rect
        width="82"
        height="30"
        rx="8"
        fill="white"
        fillOpacity="0.92"
        stroke="#99f6e4"
        strokeWidth="1"
      />
      <circle cx="12" cy="15" r="5" fill="#ccfbf1" />
      <path
        d="M9 15h6M12 12v6"
        stroke="#0f766e"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <text x="22" y="12" fill="#0f766e" fontSize="7" fontWeight="600">
        Follow-up
      </text>
      <text
        x="22"
        y="23"
        fill="#0d9488"
        fontSize="9"
        fontWeight="800"
        fontFamily="Sora"
      >
        Due: 5
      </text>
    </svg>
  </div>
);

/* === 7. MY PATIENTS PAGE MAIN COMPONENT === */
const MyPatientsPage = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getMyPatients();
      setPatients(response.data.patients || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const query = search.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.fullName?.toLowerCase().includes(query) ||
        patient.email?.toLowerCase().includes(query) ||
        patient.phoneNumber?.includes(query),
    );
  }, [patients, search]);

  const malePatients = patients.filter((p) => p.gender === 'male').length;
  const femalePatients = patients.filter((p) => p.gender === 'female').length;

  /* === LOADING STATE === */
  if (loading) {
    return (
      <DashboardLayout>
        <style>{styles}</style>
        <div
          className="space-y-5 p-4 md:p-6"
          style={{ background: '#f0f5fb', minHeight: '100vh' }}
        >
          {/* Skeleton hero */}
          <div className="shimmer-bg h-44 md:h-52 rounded-3xl" />
          {/* Skeleton stats */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shimmer-bg h-20 md:h-24 rounded-3xl" />
            ))}
          </div>
          {/* Skeleton search */}
          <div className="shimmer-bg h-14 rounded-3xl" />
          {/* Skeleton cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <style>{styles}</style>
      <div
        className="space-y-5 p-4 md:p-6"
        style={{ background: '#f0f5fb', minHeight: '100vh' }}
      >
        {/* === HERO SECTION === */}
        <div
          className="relative overflow-hidden rounded-3xl anim-fade-up"
          style={{
            background:
              'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #0891b2 100%)',
            minHeight: 200,
          }}
        >
          {/* Grid texture */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Glow orbs */}
          <div
            className="pointer-events-none absolute -top-10 -right-10 h-52 w-52 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          />

          {/* Spinning ring (desktop only) */}
          <div className="pointer-events-none absolute top-4 left-4 hidden md:block">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              className="spin-slow opacity-20"
            >
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="white"
                strokeWidth="1.5"
                strokeDasharray="6 5"
                fill="none"
              />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 p-5 md:p-8">
            {/* Left content */}
            <div className="flex-1">
              {/* Eyebrow badge */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-3"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#bfdbfe',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-200 pulse-dot" />
                Patient Portal
              </div>

              <h1 className="sora text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                My <span className="text-blue-200">Patients</span>
              </h1>
              <p
                className="mt-2 text-sm md:text-base text-blue-100"
                style={{ opacity: 0.85 }}
              >
                View and manage all patients you have consulted.
              </p>

              {/* Stat mini-cards */}
              <div className="mt-5 flex flex-wrap gap-3">
                {[
                  { label: 'Total', value: patients.length },
                  { label: 'Male', value: malePatients },
                  { label: 'Female', value: femalePatients },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="stat-glass rounded-2xl px-4 py-2.5 text-center min-w-[72px]"
                  >
                    <p className="sora text-xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-blue-200 font-medium">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right illustration (hidden on small mobile, shown sm+) */}
            <div className="hidden sm:block h-52 w-60 md:h-60 md:w-68 lg:h-72 lg:w-80 flex-shrink-0 relative">
              <HeroIllustration />
            </div>
          </div>
        </div>

        {/* === SEARCH BAR === */}
        <div className="anim-fade-up d2 glass-panel rounded-3xl p-3 md:p-4">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
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
            <input
              type="text"
              placeholder="Search by name, email or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm text-slate-700 placeholder-slate-400 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          {search && (
            <p className="mt-2 pl-1 text-xs text-slate-500">
              {filteredPatients.length} result
              {filteredPatients.length !== 1 ? 's' : ''} for &ldquo;{search}
              &rdquo;
            </p>
          )}
        </div>

        {/* === PATIENT CARDS GRID === */}
        {filteredPatients.length === 0 ? (
          <EmptyState isFiltered={!!search} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPatients.map((patient, index) => (
              <PatientCard
                key={patient._id}
                patient={patient}
                index={index}
                onView={(id) => navigate(`/doctor/patients/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyPatientsPage;
