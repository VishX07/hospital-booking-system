/**
 * ============================================================
 *  PrescriptionDetailsPage.jsx — Patient Prescription View
 *
 *  Sections:
 *   1. Styles & Keyframes
 *   2. Illustration SVG
 *   3. Utility Helpers (Field, Card, SectionHead)
 *   4. Skeleton Loader
 *   5. Medicine Card
 *   6. Main Page Component
 * ============================================================
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPrescriptionsByAppointmentId } from '../../api/appointment.api';
import { downloadPrescription } from '../../api/prescription.api';
import DashboardLayout from '../../components/layout/DashboardLayout';

/* ================================================================
   1. STYLES & KEYFRAMES
   ================================================================ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

  .rx-root { font-family: 'DM Sans', sans-serif; }
  .rx-root h1,.rx-root h2,.rx-root h3,.rx-root h4 { font-family: 'Sora', sans-serif; }

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
  @keyframes spinSlow {
    from { transform:rotate(0); }
    to   { transform:rotate(360deg); }
  }
  @keyframes shimmer {
    0%   { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  @keyframes cardIn {
    from { opacity:0; transform:translateY(16px) scale(.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  .float-1 { animation: float1 5.5s ease-in-out infinite; }
  .float-2 { animation: float2 4.8s ease-in-out infinite .7s; }
  .float-3 { animation: float3 6.2s ease-in-out infinite 1.3s; }
  .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
  .spin-slow  { animation: spinSlow 22s linear infinite; }
  .anim-fade-up { animation: fadeUp .55s ease both; }
  .d1{animation-delay:.06s} .d2{animation-delay:.12s} .d3{animation-delay:.18s}
  .d4{animation-delay:.24s} .d5{animation-delay:.30s}

  .glass-panel {
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.75);
  }
  .shimmer-bg {
    background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  .rx-card {
    transition: transform .22s cubic-bezier(.34,1.2,.64,1), box-shadow .22s ease;
  }
  .rx-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(15,23,42,.09);
  }

  .med-card {
    transition: transform .2s ease, box-shadow .2s ease;
  }
  .med-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 28px rgba(15,23,42,.08);
  }

  .btn-act {
    transition: all .18s ease;
  }
  .btn-act:hover { transform: translateY(-2px); }
  .btn-act:active { transform: translateY(0); }

  .pill-field {
    transition: background .15s ease;
  }
  .pill-field:hover { background: #f1f5f9; }

  .rx-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,.15);
    background: white;
  }
`;

/* ================================================================
   2. PRESCRIPTION ILLUSTRATION SVG
   ================================================================ */
const PrescriptionIllustration = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    {/* Main SVG */}
    <svg
      viewBox="0 0 300 250"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rxHeader" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity=".95" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="rxPill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>

      {/* Outer decorative ring */}
      <circle
        cx="150"
        cy="125"
        r="118"
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        className="spin-slow"
      />

      {/* Prescription pad */}
      <rect
        x="60"
        y="28"
        width="180"
        height="195"
        rx="16"
        fill="white"
        opacity=".96"
      />

      {/* Pad header */}
      <rect
        x="60"
        y="28"
        width="180"
        height="44"
        rx="16"
        fill="url(#rxHeader)"
      />
      <rect x="60" y="54" width="180" height="18" fill="url(#rxHeader)" />

      {/* Rx symbol */}
      <text
        x="80"
        y="52"
        fontFamily="serif"
        fontSize="18"
        fill="white"
        fontWeight="800"
        opacity=".9"
      >
        Rx
      </text>

      {/* Hospital name */}
      <text
        x="104"
        y="44"
        fontFamily="sans-serif"
        fontSize="8"
        fill="white"
        fontWeight="700"
        opacity=".85"
      >
        ALPHACARE HOSPITAL
      </text>
      <text
        x="104"
        y="55"
        fontFamily="sans-serif"
        fontSize="6.5"
        fill="#bfdbfe"
      >
        Medical Prescription
      </text>

      {/* Divider */}
      <line x1="78" y1="84" x2="222" y2="84" stroke="#e2e8f0" strokeWidth="1" />

      {/* Patient row */}
      <text
        x="78"
        y="97"
        fontFamily="sans-serif"
        fontSize="6.5"
        fill="#94a3b8"
        fontWeight="600"
      >
        PATIENT
      </text>
      <rect x="78" y="101" width="90" height="7" rx="3.5" fill="#dbeafe" />

      {/* Date row */}
      <text
        x="182"
        y="97"
        fontFamily="sans-serif"
        fontSize="6.5"
        fill="#94a3b8"
        fontWeight="600"
      >
        DATE
      </text>
      <rect x="182" y="101" width="42" height="7" rx="3.5" fill="#e0e7ff" />

      {/* Medicine lines */}
      {[
        { y: 124, w: 120, label: 'Medicine 1', color: '#bfdbfe' },
        { y: 145, w: 96, label: 'Medicine 2', color: '#c7d2fe' },
        { y: 166, w: 108, label: 'Medicine 3', color: '#ddd6fe' },
      ].map((m, i) => (
        <g key={i}>
          <circle cx="85" cy={m.y - 1} r="4" fill={m.color} />
          <rect
            x="95"
            y={m.y - 5}
            width={m.w}
            height="7"
            rx="3.5"
            fill="#f1f5f9"
          />
          <rect
            x="95"
            y={m.y + 4}
            width={m.w * 0.6}
            height="5"
            rx="2.5"
            fill="#e2e8f0"
          />{' '}
        </g>
      ))}

      {/* Signature line */}
      <line
        x1="150"
        y1="205"
        x2="222"
        y2="205"
        stroke="#e2e8f0"
        strokeWidth="1.5"
      />
      <text x="163" y="215" fontFamily="sans-serif" fontSize="6" fill="#94a3b8">
        Doctor's Signature
      </text>

      {/* Stamp circle */}
      <circle
        cx="100"
        cy="207"
        r="16"
        fill="none"
        stroke="#bfdbfe"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />
      <text
        x="100"
        y="211"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="6"
        fill="#3b82f6"
        fontWeight="700"
      >
        VERIFIED
      </text>

      {/* Stethoscope decoration top-left */}
      <path
        d="M38,60 Q35,46 44,43 Q53,40 53,51"
        fill="none"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="38"
        y1="60"
        x2="38"
        y2="78"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle
        cx="38"
        cy="83"
        r="6"
        fill="none"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="3"
      />
      <circle cx="38" cy="83" r="2.5" fill="rgba(255,255,255,0.4)" />

      {/* Pills bottom right */}
      <rect
        x="248"
        y="168"
        width="32"
        height="14"
        rx="7"
        fill="rgba(255,255,255,0.22)"
      />
      <line
        x1="264"
        y1="168"
        x2="264"
        y2="182"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.5"
      />
      <rect
        x="248"
        y="186"
        width="32"
        height="14"
        rx="7"
        fill="rgba(255,255,255,0.15)"
      />
      <line
        x1="264"
        y1="186"
        x2="264"
        y2="200"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
      />

      {/* Medical cross top-right area */}
      <rect
        x="255"
        y="44"
        width="9"
        height="26"
        rx="4"
        fill="rgba(255,255,255,0.22)"
      />
      <rect
        x="247"
        y="52"
        width="25"
        height="9"
        rx="4"
        fill="rgba(255,255,255,0.22)"
      />
    </svg>

    {/* Floating badge 1 — Verified */}
    <svg
      viewBox="0 0 118 40"
      xmlns="http://www.w3.org/2000/svg"
      className="float-2 absolute top-2 right-0 w-28"
      aria-hidden="true"
    >
      <rect width="118" height="40" rx="12" fill="white" opacity=".95" />
      <rect
        width="118"
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
        y="16"
        fontFamily="sans-serif"
        fontSize="7.5"
        fill="#15803d"
        fontWeight="700"
      >
        VERIFIED
      </text>
      <text x="36" y="29" fontFamily="sans-serif" fontSize="7" fill="#64748b">
        Prescription
      </text>
    </svg>

    {/* Floating badge 2 — Medicines count */}
    <svg
      viewBox="0 0 110 40"
      xmlns="http://www.w3.org/2000/svg"
      className="float-3 absolute bottom-6 left-0 w-28"
      aria-hidden="true"
    >
      <rect width="110" height="40" rx="12" fill="white" opacity=".92" />
      <rect
        width="110"
        height="40"
        rx="12"
        fill="none"
        stroke="#bfdbfe"
        strokeWidth="1"
      />
      <circle cx="20" cy="20" r="10" fill="#eff6ff" />
      <text
        x="19"
        y="24"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="11"
        fill="#3b82f6"
        fontWeight="800"
      >
        💊
      </text>
      <text
        x="36"
        y="16"
        fontFamily="sans-serif"
        fontSize="7"
        fill="#64748b"
        fontWeight="600"
      >
        MEDICINES
      </text>
      <text
        x="36"
        y="29"
        fontFamily="sans-serif"
        fontSize="11"
        fill="#1d4ed8"
        fontWeight="800"
      >
        Rx Listed
      </text>
    </svg>

    {/* Floating badge 3 — Active dot */}
    <svg
      viewBox="0 0 100 34"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute top-14 left-1 w-24"
      style={{ animationDelay: '1s' }}
      aria-hidden="true"
    >
      <rect width="100" height="34" rx="10" fill="white" opacity=".9" />
      <rect
        width="100"
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
        ACTIVE
      </text>
      <text x="25" y="25" fontFamily="sans-serif" fontSize="6.5" fill="#64748b">
        Prescription
      </text>
    </svg>
  </div>
);

/* ================================================================
   3. UTILITY HELPERS
   ================================================================ */
const Card = ({ children, className = '', delay = '' }) => (
  <section
    className={`rx-card anim-fade-up ${delay} rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm ${className}`}
  >
    {children}
  </section>
);

const SectionHead = ({ icon, title, sub, color = 'blue' }) => (
  <div className="mb-5 flex items-center gap-3">
    <span
      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-${color}-50 text-${color}-600`}
    >
      {icon}
    </span>
    <div>
      <h2 className="text-base sm:text-lg font-bold text-slate-900">{title}</h2>
      {sub && <p className="text-xs sm:text-sm text-slate-500">{sub}</p>}
    </div>
  </div>
);

const Field = ({ label, value, span = false }) => (
  <div
    className={`pill-field rounded-2xl bg-slate-50 p-3.5 sm:p-4 ${span ? 'sm:col-span-2' : ''}`}
  >
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
      {label}
    </p>
    <p className="mt-1.5 text-sm font-semibold leading-relaxed text-slate-800">
      {value || '—'}
    </p>
  </div>
);

/* ================================================================
   4. SKELETON LOADER
   ================================================================ */
const SkeletonPage = () => (
  <DashboardLayout>
    <div className="rx-root min-h-screen bg-[#f0f5fb] px-4 py-8 sm:px-6 lg:px-8">
      <style>{styles}</style>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="shimmer-bg h-56 sm:h-64 rounded-3xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="shimmer-bg h-36 rounded-3xl" />
          <div className="shimmer-bg h-36 rounded-3xl" />
        </div>
        <div className="shimmer-bg h-28 rounded-3xl" />
        <div className="shimmer-bg h-48 rounded-3xl" />
      </div>
    </div>
  </DashboardLayout>
);

/* ================================================================
   5. MEDICINE CARD
   ================================================================ */
const MED_COLORS = [
  {
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: '#3b82f6',
    badge: '#dbeafe',
    badgeText: '#1d4ed8',
  },
  {
    bg: '#eef2ff',
    border: '#c7d2fe',
    icon: '#6366f1',
    badge: '#e0e7ff',
    badgeText: '#4338ca',
  },
  {
    bg: '#f0fdfa',
    border: '#99f6e4',
    icon: '#0d9488',
    badge: '#ccfbf1',
    badgeText: '#0f766e',
  },
  {
    bg: '#fdf4ff',
    border: '#e9d5ff',
    icon: '#9333ea',
    badge: '#f3e8ff',
    badgeText: '#7e22ce',
  },
  {
    bg: '#fff7ed',
    border: '#fed7aa',
    icon: '#ea580c',
    badge: '#ffedd5',
    badgeText: '#c2410c',
  },
];

const MedicineCard = ({ medicine, index }) => {
  const c = MED_COLORS[index % MED_COLORS.length];
  const chips = [
    medicine.dosage && { label: 'Dosage', val: medicine.dosage },
    medicine.frequency && { label: 'Frequency', val: medicine.frequency },
    medicine.duration && { label: 'Duration', val: medicine.duration },
  ].filter(Boolean);

  return (
    <div
      className="med-card rounded-2xl border p-4 sm:p-5"
      style={{ background: c.bg, borderColor: c.border }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ background: c.badge, color: c.icon }}
        >
          💊
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-bold text-slate-900 text-sm sm:text-base">
              {medicine.name}
            </p>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: c.badge, color: c.badgeText }}
            >
              #{index + 1}
            </span>
          </div>
          {chips.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <div
                  key={chip.label}
                  className="rounded-xl bg-white/70 border border-white px-3 py-1.5"
                >
                  <p
                    className="text-[9px] font-bold uppercase tracking-widest"
                    style={{ color: c.icon }}
                  >
                    {chip.label}
                  </p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {chip.val}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   6. MAIN PAGE COMPONENT
   ================================================================ */
const PrescriptionDetailsPage = () => {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchPrescription = async () => {
    try {
      const response = await getPrescriptionsByAppointmentId(id);
      setPrescription(response.data.prescription);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to load prescription',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await downloadPrescription(prescription._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${prescription._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download prescription');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  if (loading) return <SkeletonPage />;

  if (!prescription)
    return (
      <DashboardLayout>
        <style>{styles}</style>
        <div className="rx-root min-h-[70vh] bg-[#f0f5fb] p-6 flex items-center justify-center">
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center shadow-sm max-w-sm w-full">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-400">
              <svg
                className="h-8 w-8"
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
            <h2 className="text-xl font-bold text-slate-900">
              Prescription not found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              No prescription is linked to this appointment yet.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );

  const createdDate = new Date(prescription.createdAt).toLocaleDateString(
    'en-US',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  );
  const followUpDate = prescription.followUpDate
    ? new Date(prescription.followUpDate).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="rx-root min-h-screen bg-[#f0f5fb] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
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
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-indigo-300 opacity-10 blur-3xl" />
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

            <div className="relative flex flex-col gap-6 px-5 py-8 sm:px-8 sm:py-10 md:flex-row md:items-center md:justify-between md:px-10">
              {/* Left text */}
              <div className="flex-1">
                {/* Eyebrow pill */}
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
                  Prescription
                  <br />
                  <span className="text-blue-200">Details</span>
                </h1>
                <p className="mt-2 text-sm text-blue-100/85">
                  Issued by{' '}
                  <span className="font-semibold text-white">
                    Dr. {prescription?.doctorId?.userId?.fullName}
                  </span>
                  {prescription?.doctorId?.specialization
                    ? ` · ${prescription.doctorId.specialization}`
                    : ''}
                </p>

                {/* Meta chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    <svg
                      className="h-3 w-3"
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
                    {createdDate}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                    Active
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    💊 {prescription.medicines?.length || 0} Medicine
                    {prescription.medicines?.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Stat glass pills */}
                <div
                  className="mt-5 flex gap-2 overflow-x-auto pb-1"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {[
                    {
                      label: 'Medicines',
                      val: prescription.medicines?.length || 0,
                    },
                    {
                      label: 'Follow Up',
                      val: followUpDate
                        ? new Date(
                            prescription.followUpDate,
                          ).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : 'N/A',
                    },
                    { label: 'Status', val: 'Active' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex-shrink-0 rounded-xl px-3 py-2 text-center"
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-widest text-blue-200">
                        {s.label}
                      </p>
                      <p className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                        {s.val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Illustration — hidden on mobile */}
              <div className="hidden md:block md:h-56 md:w-60 lg:h-64 lg:w-72 flex-shrink-0">
                <PrescriptionIllustration />
              </div>
            </div>

            {/* Download CTA strip */}
            <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm px-5 sm:px-8 md:px-10 py-3 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-blue-200 font-medium">
                Prescription ID:{' '}
                <span className="text-white font-bold">
                  {prescription._id?.slice(-10).toUpperCase()}
                </span>
              </p>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-act inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-md transition hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                    Downloading…
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
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ============================================================
              DOCTOR + PATIENT INFO
              ============================================================ */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Doctor */}
            <Card delay="d1">
              <SectionHead
                title="Doctor"
                sub="Prescribing physician"
                color="blue"
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
                      d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0m-3.75-7.5h4.5m-2.25-2.25V15"
                    />
                  </svg>
                }
              />
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-blue-700 ring-2 ring-blue-50">
                  {prescription?.doctorId?.userId?.fullName?.charAt(0) || 'D'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">
                    Dr. {prescription?.doctorId?.userId?.fullName}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium truncate">
                    {prescription?.doctorId?.specialization || '—'}
                  </p>
                  {prescription?.doctorId?.department?.name && (
                    <p className="text-xs text-slate-500 truncate">
                      {prescription.doctorId.department.name}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Patient */}
            <Card delay="d2">
              <SectionHead
                title="Patient"
                sub="Prescription recipient"
                color="emerald"
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
                      d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
                    />
                  </svg>
                }
              />
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-xl font-bold text-emerald-700 ring-2 ring-emerald-50">
                  {prescription?.patientId?.fullName?.charAt(0) || 'P'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">
                    {prescription?.patientId?.fullName || '—'}
                  </h3>
                  {prescription?.patientId?.email && (
                    <p className="text-sm text-slate-500 truncate">
                      {prescription.patientId.email}
                    </p>
                  )}
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Patient
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* ============================================================
              DIAGNOSIS
              ============================================================ */}
          <Card delay="d2">
            <SectionHead
              title="Diagnosis"
              sub="Clinical assessment and findings"
              color="blue"
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
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                  />
                </svg>
              }
            />
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4 sm:p-5">
              <p className="text-sm sm:text-base leading-relaxed text-slate-700">
                {prescription.diagnosis || 'No diagnosis recorded.'}
              </p>
            </div>
          </Card>

          {/* ============================================================
              MEDICINES
              ============================================================ */}
          <Card delay="d3">
            <SectionHead
              title="Prescribed Medicines"
              sub={`${prescription.medicines?.length || 0} medicine${prescription.medicines?.length !== 1 ? 's' : ''} prescribed`}
              color="blue"
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
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                  />
                </svg>
              }
            />
            {prescription.medicines?.length > 0 ? (
              <div className="space-y-3">
                {prescription.medicines.map((medicine, index) => (
                  <MedicineCard key={index} medicine={medicine} index={index} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  No medicines listed.
                </p>
              </div>
            )}
          </Card>

          {/* ============================================================
              NOTES + FOLLOW UP
              ============================================================ */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Notes */}
            <Card delay="d4">
              <SectionHead
                title="Doctor's Notes"
                sub="Additional instructions"
                color="slate"
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
                      d="M9 12h6m-6 4h6M9 8h6m2.25-4.5H6.75A2.25 2.25 0 004.5 5.75v12.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V5.75a2.25 2.25 0 00-2.25-2.25z"
                    />
                  </svg>
                }
              />
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 min-h-[80px]">
                <p className="text-sm leading-relaxed text-slate-700">
                  {prescription.notes || 'No additional notes provided.'}
                </p>
              </div>
            </Card>

            {/* Follow Up */}
            <Card delay="d4">
              <SectionHead
                title="Follow-Up"
                sub="Next scheduled visit"
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
                      d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6.75V19.5A1.5 1.5 0 004.5 21z"
                    />
                  </svg>
                }
              />
              {followUpDate ? (
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1.5">
                    Scheduled Date
                  </p>
                  <p className="text-lg font-extrabold text-amber-900">
                    {followUpDate}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400 pulse-dot" />
                    <span className="text-xs font-semibold text-amber-700">
                      Follow-up reminder set
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-6 text-center">
                  <p className="text-sm text-slate-500">
                    No follow-up date scheduled.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* ============================================================
              PRESCRIPTION METADATA
              ============================================================ */}
          <Card delay="d5">
            <SectionHead
              title="Prescription Information"
              sub="Record details and metadata"
              color="blue"
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
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Prescription ID"
                value={prescription._id?.slice(-12).toUpperCase()}
              />
              <Field label="Date Issued" value={createdDate} />
              {prescription.updatedAt && (
                <Field
                  label="Last Updated"
                  value={new Date(prescription.updatedAt).toLocaleDateString(
                    'en-US',
                    {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    },
                  )}
                />
              )}
              <Field
                label="Total Medicines"
                value={`${prescription.medicines?.length || 0} prescribed`}
              />
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrescriptionDetailsPage;
