import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import {
  getMyPrescriptions,
  downloadPrescription,
} from '../../api/prescription.api.js';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .rx-root { font-family: 'DM Sans', sans-serif; }
  .rx-root h1,.rx-root h2,.rx-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes float1 {
    0%,100% { transform:translateY(0) rotate(-1deg); }
    50%      { transform:translateY(-10px) rotate(1deg); }
  }
  @keyframes float2 {
    0%,100% { transform:translateY(0) rotate(1deg); }
    50%      { transform:translateY(-7px) rotate(-1deg); }
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.5; transform:scale(1.4); }
  }
  @keyframes spin-slow { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes shimmer {
    0%   { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  @keyframes dl-pop {
    0%   { transform:scale(1); }
    40%  { transform:scale(.93); }
    70%  { transform:scale(1.07); }
    100% { transform:scale(1); }
  }

  .anim-fade-up { animation:fadeUp .52s ease both; }
  .d1{animation-delay:.06s} .d2{animation-delay:.12s} .d3{animation-delay:.18s}
  .d4{animation-delay:.24s} .d5{animation-delay:.30s} .d6{animation-delay:.36s}

  .float-1 { animation:float1 5.2s ease-in-out infinite; }
  .float-2 { animation:float2 4.6s ease-in-out infinite .8s; }
  .float-3 { animation:float2 5.8s ease-in-out infinite 1.5s; }
  .pulse-dot { animation:pulse-dot 2s ease-in-out infinite; }
  .spin-slow  { animation:spin-slow 22s linear infinite; }

  .rx-card {
    transition: transform .24s ease, box-shadow .24s ease;
  }
  .rx-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 18px 44px rgba(21,101,192,.1);
  }

  .view-btn {
    transition: all .18s ease;
  }
  .view-btn:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
    transform: translateY(-1px);
  }

  .dl-btn {
    transition: all .2s cubic-bezier(.34,1.3,.64,1);
  }
  .dl-btn:hover {
    background: #1d4ed8;
    box-shadow: 0 8px 24px rgba(29,78,216,.35);
    transform: translateY(-2px);
  }
  .dl-btn:active { animation: dl-pop .3s ease; }

  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,.15);
    background: white;
  }

  .shimmer-bg {
    background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  .med-tag {
    transition: background .15s ease;
  }
  .med-tag:hover { background: #dbeafe; }
`;

/* ─── Default avatar ──────────────────────────────────────────────────────── */
const avatarPalettes = [
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
  const p = avatarPalettes[idx % avatarPalettes.length];
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

/* ─── Hero illustration ───────────────────────────────────────────────────── */
const RxIllustration = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <svg
      viewBox="0 0 280 230"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rxGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity=".9" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
      </defs>

      {/* Outer rings */}
      <circle
        cx="140"
        cy="115"
        r="105"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        className="spin-slow"
      />
      <circle
        cx="140"
        cy="115"
        r="80"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(0,180,216,0.1)"
        strokeWidth="1"
      />

      {/* Main prescription clipboard */}
      <rect
        x="70"
        y="30"
        width="140"
        height="175"
        rx="16"
        fill="white"
        opacity=".95"
      />
      {/* Clipboard top */}
      <rect x="70" y="30" width="140" height="28" rx="16" fill="url(#rxGrad)" />
      <rect x="70" y="44" width="140" height="14" fill="url(#rxGrad)" />
      {/* Clip holder */}
      <rect
        x="112"
        y="22"
        width="56"
        height="18"
        rx="9"
        fill="#1e3a8a"
        opacity=".9"
      />
      <rect
        x="120"
        y="27"
        width="40"
        height="8"
        rx="4"
        fill="#3b82f6"
        opacity=".7"
      />

      {/* Rx symbol */}
      <text
        x="100"
        y="52"
        fontFamily="serif"
        fontSize="14"
        fill="white"
        fontWeight="700"
        opacity=".9"
      >
        ℞
      </text>
      <text
        x="120"
        y="52"
        fontFamily="sans-serif"
        fontSize="8"
        fill="rgba(255,255,255,.7)"
        fontWeight="600"
      >
        PRESCRIPTION
      </text>

      {/* Content lines */}
      {[68, 86, 104, 122, 140, 156].map((y, i) => (
        <rect
          key={i}
          x="85"
          y={y}
          width={i % 3 === 2 ? 70 : 110}
          height="7"
          rx="3.5"
          fill={i === 0 ? '#bfdbfe' : i === 1 ? '#e0e7ff' : '#f1f5f9'}
        />
      ))}

      {/* Medicine boxes */}
      <rect
        x="85"
        y="165"
        width="50"
        height="25"
        rx="6"
        fill="#eff6ff"
        stroke="#bfdbfe"
        strokeWidth="1"
      />
      <text
        x="90"
        y="175"
        fontFamily="sans-serif"
        fontSize="6.5"
        fill="#1d4ed8"
        fontWeight="700"
      >
        AMOXICILLIN
      </text>
      <text x="90" y="184" fontFamily="sans-serif" fontSize="6" fill="#64748b">
        500mg · 3×/day
      </text>

      <rect
        x="143"
        y="165"
        width="52"
        height="25"
        rx="6"
        fill="#f0fdf4"
        stroke="#bbf7d0"
        strokeWidth="1"
      />
      <text
        x="148"
        y="175"
        fontFamily="sans-serif"
        fontSize="6.5"
        fill="#15803d"
        fontWeight="700"
      >
        PARACETAMOL
      </text>
      <text x="148" y="184" fontFamily="sans-serif" fontSize="6" fill="#64748b">
        650mg · 2×/day
      </text>

      {/* Stamp / verified mark bottom-right */}
      <circle
        cx="192"
        cy="195"
        r="18"
        fill="#dcfce7"
        stroke="#86efac"
        strokeWidth="1.5"
      />
      <path
        d="M183,195 l6,6 12-12"
        stroke="#16a34a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Stethoscope top-right */}
      <circle
        cx="230"
        cy="60"
        r="22"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
      />
      <path
        d="M219,53 Q221,42 230,42 Q239,42 241,53"
        fill="none"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="219"
        y1="53"
        x2="219"
        y2="66"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle
        cx="219"
        cy="70"
        r="5.5"
        fill="none"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="2.5"
      />
      <circle cx="219" cy="70" r="2.5" fill="rgba(255,255,255,0.4)" />

      {/* Pills bottom-left */}
      <rect
        x="30"
        y="160"
        width="28"
        height="13"
        rx="6.5"
        fill="rgba(255,255,255,0.25)"
      />
      <line
        x1="44"
        y1="160"
        x2="44"
        y2="173"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.5"
      />
      <rect
        x="30"
        y="178"
        width="28"
        height="13"
        rx="6.5"
        fill="rgba(255,255,255,0.18)"
      />
      <line
        x1="44"
        y1="178"
        x2="44"
        y2="191"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />

      {/* Medical cross */}
      <rect
        x="36"
        y="28"
        width="10"
        height="28"
        rx="4"
        fill="rgba(255,255,255,0.28)"
      />
      <rect
        x="25"
        y="39"
        width="32"
        height="10"
        rx="4"
        fill="rgba(255,255,255,0.28)"
      />
    </svg>

    {/* Floating badge — Total */}
    <svg
      viewBox="0 0 110 40"
      xmlns="http://www.w3.org/2000/svg"
      className="float-2 absolute top-4 right-0 w-28"
      aria-hidden="true"
    >
      <rect width="110" height="40" rx="11" fill="white" opacity=".95" />
      <rect
        width="110"
        height="40"
        rx="11"
        fill="none"
        stroke="#bfdbfe"
        strokeWidth="1"
      />
      <text
        x="12"
        y="15"
        fontFamily="sans-serif"
        fontSize="7"
        fill="#64748b"
        fontWeight="600"
      >
        PRESCRIPTIONS
      </text>
      <text
        x="12"
        y="31"
        fontFamily="sans-serif"
        fontSize="16"
        fill="#1d4ed8"
        fontWeight="800"
      >
        Active
      </text>
    </svg>

    {/* Floating badge — Verified */}
    <svg
      viewBox="0 0 112 38"
      xmlns="http://www.w3.org/2000/svg"
      className="float-3 absolute bottom-10 left-0 w-28"
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
        VERIFIED RX
      </text>
      <text x="32" y="28" fontFamily="sans-serif" fontSize="7" fill="#64748b">
        Doctor Signed
      </text>
    </svg>
  </div>
);

/* ─── Skeleton card ───────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-4 mb-5">
      <div className="shimmer-bg h-14 w-14 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="shimmer-bg h-4 w-3/4 rounded-full" />
        <div className="shimmer-bg h-3 w-1/2 rounded-full" />
      </div>
    </div>
    <div className="space-y-2 mb-5">
      <div className="shimmer-bg h-3 w-full rounded-full" />
      <div className="shimmer-bg h-3 w-4/5 rounded-full" />
      <div className="shimmer-bg h-3 w-2/3 rounded-full" />
    </div>
    <div className="flex gap-3">
      <div className="shimmer-bg h-10 flex-1 rounded-2xl" />
      <div className="shimmer-bg h-10 flex-1 rounded-2xl" />
    </div>
  </div>
);

/* ─── Prescription card ───────────────────────────────────────────────────── */
const PrescriptionCard = ({ prescription, index, onDownload }) => {
  const docName = prescription?.doctorId?.userId?.fullName || 'Doctor';
  const docDept = prescription?.doctorId?.department?.name || '';
  const docPhoto = prescription?.doctorId?.userId?.profilePicture;
  const diagnosis = prescription?.diagnosis || '—';
  const medCount = prescription?.medicines?.length || 0;
  const apptDate = prescription?.appointmentId?.appointmentDate
    ? new Date(prescription.appointmentId.appointmentDate).toLocaleDateString(
        'en-US',
        { day: 'numeric', month: 'short', year: 'numeric' },
      )
    : '—';
  const followUp = prescription?.followUpDate
    ? new Date(prescription.followUpDate).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  return (
    <div
      className={`rx-card anim-fade-up d${(index % 6) + 1} rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden`}
    >
      {/* Card header — doctor info */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl ring-2 ring-white shadow-sm">
            <DoctorAvatar
              src={docPhoto}
              name={docName}
              idx={index}
              className="h-full w-full rounded-2xl"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900 truncate">Dr. {docName}</h3>
            <p className="text-sm text-slate-500 truncate">{docDept}</p>
          </div>
          {/* Verified chip */}
          <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 border border-green-100">
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
        </div>
      </div>

      {/* Card body */}
      <div className="px-5 py-4 space-y-3">
        {/* Diagnosis */}
        <div className="rounded-2xl bg-blue-50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">
            Diagnosis
          </p>
          <p className="text-sm font-semibold text-blue-900 leading-snug">
            {diagnosis}
          </p>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: 'Medicines',
              val: medCount,
              icon: 'M9 12h6m-6 4h6M9 8h6m2.25-4.5H6.75A2.25 2.25 0 004.5 5.75v12.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V5.75a2.25 2.25 0 00-2.25-2.25z',
            },
            {
              label: 'Appt Date',
              val: apptDate,
              icon: 'M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6.75V19.5A1.5 1.5 0 004.5 21z',
            },
            {
              label: 'Follow Up',
              val: followUp,
              icon: 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z',
            },
          ].map((f) => (
            <div
              key={f.label}
              className="rounded-xl bg-slate-50 px-2.5 py-2.5 text-center"
            >
              <svg
                className="h-4 w-4 text-blue-400 mx-auto mb-1"
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
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {f.val}
              </p>
            </div>
          ))}
        </div>

        {/* Medicine tags if available */}
        {prescription?.medicines?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {prescription.medicines.slice(0, 3).map((med, i) => (
              <span
                key={i}
                className="med-tag rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 cursor-default"
              >
                💊 {med.name}
              </span>
            ))}
            {prescription.medicines.length > 3 && (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                +{prescription.medicines.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card footer — actions */}
      <div className="flex gap-3 border-t border-slate-100 px-5 py-4">
        <Link
          to={`/patient/prescriptions/${prescription.appointmentId._id}`}
          className="view-btn flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700"
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
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          View
        </Link>
        <button
          onClick={() => onDownload(prescription._id)}
          className="dl-btn flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm"
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
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          Download
        </button>
      </div>
    </div>
  );
};

/* ─── Empty state ─────────────────────────────────────────────────────────── */
const EmptyState = () => (
  <div className="col-span-2 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
      <svg
        className="h-10 w-10 text-blue-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6M9 8h6m2.25-4.5H6.75A2.25 2.25 0 004.5 5.75v12.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V5.75a2.25 2.25 0 00-2.25-2.25z"
        />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-slate-800">No Prescriptions Yet</h3>
    <p className="mt-2 max-w-xs text-sm text-slate-500">
      Your prescriptions will appear here after your doctor completes a
      consultation.
    </p>
    <Link
      to="/doctors"
      className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
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

/* ─── Main Page ───────────────────────────────────────────────────────────── */
const PatientPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    try {
      const response = await getMyPrescriptions();
      setPrescriptions(response.data.prescriptions || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to load prescriptions',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleDownload = async (prescriptionId) => {
    try {
      const response = await downloadPrescription(prescriptionId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download prescription');
    }
  };

  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="rx-root min-h-screen bg-[#f0f5fb] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* ── HERO ────────────────────────────────────────────────────────── */}
          <div className="anim-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 shadow-xl">
            {/* grid texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white opacity-5" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-indigo-300 opacity-10 blur-3xl" />

            {/* Spinning ring */}
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

            <div className="relative flex flex-col gap-6 px-5 py-8 sm:px-8 sm:py-10 md:flex-row md:items-center md:justify-between md:px-10">
              {' '}
              {/* Text */}
              <div className="flex-1">
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
                      d="M9 12h6m-6 4h6M9 8h6m2.25-4.5H6.75A2.25 2.25 0 004.5 5.75v12.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V5.75a2.25 2.25 0 00-2.25-2.25z"
                    />
                  </svg>
                  My Prescriptions
                </div>

                <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                  Your Medical
                  <br />
                  <span className="text-blue-200">Prescriptions</span>
                </h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-100/85">
                  All prescriptions from your consultations, stored securely.
                  View details or download a PDF any time.
                </p>

                {/* Stats row */}
                {!loading && prescriptions.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {[
                      { label: 'Total', val: prescriptions.length },
                      {
                        label: 'Medicines',
                        val: prescriptions.reduce(
                          (s, p) => s + (p?.medicines?.length || 0),
                          0,
                        ),
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                          {s.label}
                        </p>
                        <p className="mt-0.5 text-2xl font-extrabold text-white">
                          {s.val}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Illustration */}
              <div className="hidden md:block md:h-52 md:w-56 lg:h-72 lg:w-80 flex-shrink-0 relative">
                {' '}
                <RxIllustration />
              </div>
            </div>
          </div>

          {/* ── SECTION HEADER ──────────────────────────────────────────────── */}
          {!loading && prescriptions.length > 0 && (
            <div className="anim-fade-up d2 flex items-center gap-3">
              <div className="flex items-center gap-2.5">
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
                      d="M9 12h6m-6 4h6M9 8h6m2.25-4.5H6.75A2.25 2.25 0 004.5 5.75v12.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V5.75a2.25 2.25 0 00-2.25-2.25z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  All Prescriptions
                </h2>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                  {prescriptions.length}
                </span>
              </div>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          )}

          {/* ── CONTENT ─────────────────────────────────────────────────────── */}
          <div className="grid gap-5 lg:grid-cols-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : prescriptions.length === 0 ? (
              <EmptyState />
            ) : (
              prescriptions.map((rx, i) => (
                <PrescriptionCard
                  key={rx._id}
                  prescription={rx}
                  index={i}
                  onDownload={handleDownload}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientPrescriptionsPage;
