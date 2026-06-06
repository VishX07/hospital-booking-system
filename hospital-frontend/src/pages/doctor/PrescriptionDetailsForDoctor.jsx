/**
 * ============================================================
 *  PrescriptionDetailsForDoctor.jsx
 *
 *  Sections:
 *   1. Styles & Keyframes
 *   2. Utility helpers & Avatar fallback
 *   3. Hero Illustration (prescription/medical scene)
 *   4. Info Field component
 *   5. Section Card wrapper
 *   6. Medicine Card (view + edit mode)
 *   7. Skeleton loader
 *   8. Main Page Component
 * ============================================================
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  getPrescriptionById,
  downloadPrescription,
  updatePrescription,
} from '../../api/prescription.api';

/* ================================================================
   1. STYLES & KEYFRAMES
   ================================================================ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .rx-doc-root { font-family:'DM Sans',sans-serif; }
  .rx-doc-root h1,.rx-doc-root h2,.rx-doc-root h3 { font-family:'Sora',sans-serif; }

  /* ── Keyframes ── */
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
  @keyframes cardIn {
    from { opacity:0; transform:translateY(14px) scale(.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes medRowIn {
    from { opacity:0; transform:translateX(-10px); }
    to   { opacity:1; transform:translateX(0); }
  }

  /* ── Utilities ── */
  .anim-fade-up { animation:fadeUp .55s ease both; }
  .d1{animation-delay:.06s} .d2{animation-delay:.12s} .d3{animation-delay:.18s}
  .d4{animation-delay:.24s} .d5{animation-delay:.30s}

  .float-1 { animation:float1 5.5s ease-in-out infinite; }
  .float-2 { animation:float2 4.8s ease-in-out infinite .7s; }
  .float-3 { animation:float3 6.2s ease-in-out infinite 1.3s; }
  .pulse-dot { animation:pulseDot 2s ease-in-out infinite; }
  .spin-slow  { animation:spinSlow 22s linear infinite; }

  /* ── Glass panel ── */
  .glass-panel {
    background:rgba(255,255,255,0.55);
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
    border:1px solid rgba(255,255,255,0.75);
  }

  /* ── Shimmer skeleton ── */
  .shimmer-bg {
    background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
    background-size:200% 100%;
    animation:shimmer 1.4s infinite;
  }

  /* ── Section cards ── */
  .info-card {
    transition:transform .22s ease, box-shadow .22s ease;
  }
  .info-card:hover {
    transform:translateY(-3px);
    box-shadow:0 12px 36px rgba(13,148,136,.09);
  }
  .card-entry { animation:cardIn .5s ease both; }

  /* ── Medicine row ── */
  .med-row { animation:medRowIn .35s ease both; }
  .med-row-hover {
    transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease;
  }
  .med-row-hover:hover {
    transform:translateX(3px);
    box-shadow:0 4px 18px rgba(13,148,136,.1);
    border-color:#99f6e4;
  }

  /* ── Field pill hover ── */
  .field-pill { transition:background .16s ease; }
  .field-pill:hover { background:#f0fdfa; }

  /* ── Inputs ── */
  .rx-input {
    transition:all .18s ease;
  }
  .rx-input:focus {
    outline:none;
    border-color:#14b8a6;
    box-shadow:0 0 0 3px rgba(20,184,166,.15);
    background:white;
  }

  /* ── Buttons ── */
  .btn-act { transition:all .2s cubic-bezier(.34,1.3,.64,1); }
  .btn-act:hover:not(:disabled) { transform:translateY(-2px); }
  .btn-teal {
    background:linear-gradient(135deg,#0d9488,#0891b2);
    box-shadow:0 4px 14px rgba(13,148,136,.3);
  }
  .btn-teal:hover:not(:disabled) {
    box-shadow:0 8px 24px rgba(13,148,136,.4);
  }

  /* ── Back button ── */
  .btn-back {
    transition:all .18s ease;
  }
  .btn-back:hover {
    transform:translateX(-3px);
    color:#0d9488;
  }

  /* ── Edit mode input ring ── */
  .edit-ring {
    border:2px solid #99f6e4;
    background:#f0fdfa;
  }
  .edit-ring:focus {
    border-color:#14b8a6;
    box-shadow:0 0 0 3px rgba(20,184,166,.15);
    background:white;
    outline:none;
  }
`;

/* ================================================================
   2. UTILITY HELPERS & AVATAR FALLBACK
   ================================================================ */
const AVATAR_PALETTES = [
  { bg: '#f0fdfa', fg: '#0f766e', border: '#99f6e4' },
  { bg: '#ecfeff', fg: '#0e7490', border: '#a5f3fc' },
  { bg: '#eff6ff', fg: '#1d4ed8', border: '#bfdbfe' },
  { bg: '#fdf4ff', fg: '#7e22ce', border: '#e9d5ff' },
  { bg: '#fff7ed', fg: '#c2410c', border: '#fed7aa' },
];

/* Avatar with graceful image-error fallback */
const Avatar = ({ src, name = '', idx = 0, className = '' }) => {
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
      className={`flex items-center justify-center font-bold text-2xl select-none ${className}`}
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
   Prescription clipboard scene with floating badge overlays.
   ================================================================ */
const RxIllustration = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    {/* ── Main SVG ── */}
    <svg
      viewBox="0 0 300 250"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rxd-hdr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d9488" stopOpacity=".95" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="rxd-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

      {/* Outer ring */}
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
      <circle
        cx="150"
        cy="125"
        r="88"
        fill="rgba(255,255,255,.03)"
        stroke="rgba(45,212,191,.1)"
        strokeWidth="1"
      />

      {/* Main clipboard */}
      <rect
        x="60"
        y="28"
        width="180"
        height="190"
        rx="18"
        fill="white"
        opacity=".95"
      />
      <rect
        x="60"
        y="28"
        width="180"
        height="38"
        rx="18"
        fill="url(#rxd-hdr)"
      />
      <rect x="60" y="52" width="180" height="14" fill="url(#rxd-hdr)" />
      {/* Clip holder */}
      <rect
        x="108"
        y="18"
        width="84"
        height="22"
        rx="11"
        fill="#134e4a"
        opacity=".85"
      />
      <rect
        x="116"
        y="23"
        width="68"
        height="12"
        rx="6"
        fill="#14b8a6"
        opacity=".6"
      />
      {/* Rx symbol + label */}
      <text
        x="88"
        y="52"
        fontFamily="serif"
        fontSize="16"
        fill="white"
        fontWeight="800"
        opacity=".85"
      >
        ℞
      </text>
      <text
        x="108"
        y="52"
        fontFamily="sans-serif"
        fontSize="8.5"
        fill="rgba(255,255,255,.8)"
        fontWeight="700"
      >
        PRESCRIPTION
      </text>

      {/* Content rows */}
      {/* Patient name row */}
      <rect
        x="74"
        y="76"
        width="152"
        height="28"
        rx="8"
        fill="#f0fdfa"
        stroke="#99f6e4"
        strokeWidth="1"
      />
      <circle cx="88" cy="90" r="8" fill="#14b8a6" opacity=".25" />
      <circle cx="88" cy="90" r="4" fill="#0d9488" />
      <rect x="102" y="83" width="80" height="5.5" rx="2.5" fill="#5eead4" />
      <rect x="102" y="92" width="55" height="4.5" rx="2" fill="#ccfbf1" />

      {/* Diagnosis row */}
      <rect
        x="74"
        y="112"
        width="152"
        height="28"
        rx="8"
        fill="#ecfeff"
        stroke="#a5f3fc"
        strokeWidth="1"
      />
      <circle cx="88" cy="126" r="8" fill="#0891b2" opacity=".2" />
      <circle cx="88" cy="126" r="4" fill="#0891b2" />
      <rect x="102" y="119" width="70" height="5.5" rx="2.5" fill="#7dd3fc" />
      <rect x="102" y="128" width="48" height="4.5" rx="2" fill="#bae6fd" />

      {/* Medicine rows */}
      {[148, 170, 192].map((y, i) => (
        <g key={i}>
          <rect
            x="74"
            y={y}
            width="152"
            height="18"
            rx="6"
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <rect
            x="82"
            y={y + 6}
            width={60 + i * 10}
            height="5"
            rx="2.5"
            fill="#e2e8f0"
          />
          <rect
            x={82 + 65 + i * 10}
            y={y + 6}
            width="30"
            height="5"
            rx="2.5"
            fill="#f1f5f9"
          />
        </g>
      ))}

      {/* Verified stamp bottom-right */}
      <circle
        cx="210"
        cy="212"
        r="20"
        fill="#f0fdfa"
        stroke="#5eead4"
        strokeWidth="1.5"
      />
      <path
        d="M200,212 l7,7 13-14"
        stroke="#0d9488"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Stethoscope decoration top-right */}
      <circle
        cx="252"
        cy="66"
        r="24"
        fill="rgba(255,255,255,.08)"
        stroke="rgba(255,255,255,.18)"
        strokeWidth="1"
      />
      <path
        d="M241,59 Q243,48 252,48 Q261,48 263,59"
        fill="none"
        stroke="rgba(255,255,255,.65)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="241"
        y1="59"
        x2="241"
        y2="73"
        stroke="rgba(255,255,255,.65)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle
        cx="241"
        cy="77"
        r="5.5"
        fill="none"
        stroke="rgba(255,255,255,.65)"
        strokeWidth="2.5"
      />
      <circle cx="241" cy="77" r="2.5" fill="rgba(255,255,255,.4)" />

      {/* Pills bottom-left */}
      <rect
        x="26"
        y="172"
        width="26"
        height="12"
        rx="6"
        fill="rgba(255,255,255,.25)"
      />
      <line
        x1="39"
        y1="172"
        x2="39"
        y2="184"
        stroke="rgba(255,255,255,.45)"
        strokeWidth="1.5"
      />
      <rect
        x="26"
        y="189"
        width="26"
        height="12"
        rx="6"
        fill="rgba(255,255,255,.18)"
      />
      <line
        x1="39"
        y1="189"
        x2="39"
        y2="201"
        stroke="rgba(255,255,255,.35)"
        strokeWidth="1.5"
      />

      {/* Medical cross */}
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

    {/* ── Floating badge: Edit mode ── */}
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
        stroke="#99f6e4"
        strokeWidth="1"
      />
      <circle cx="18" cy="20" r="9" fill="#f0fdfa" />
      <circle cx="18" cy="20" r="4" fill="#14b8a6" className="pulse-dot" />
      <text
        x="33"
        y="15"
        fontFamily="sans-serif"
        fontSize="7"
        fill="#64748b"
        fontWeight="600"
      >
        PRESCRIPTION
      </text>
      <text
        x="33"
        y="29"
        fontFamily="sans-serif"
        fontSize="11"
        fill="#0d9488"
        fontWeight="800"
      >
        Active
      </text>
    </svg>

    {/* ── Floating badge: Doctor signed ── */}
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
        stroke="#a5f3fc"
        strokeWidth="1"
      />
      <circle cx="18" cy="19" r="9" fill="#ecfeff" />
      <path
        d="M13,19 l4,4 7-7"
        stroke="#0891b2"
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
        fill="#0e7490"
        fontWeight="700"
      >
        DOCTOR SIGNED
      </text>
      <text x="32" y="28" fontFamily="sans-serif" fontSize="7" fill="#64748b">
        Verified Rx
      </text>
    </svg>

    {/* ── Floating badge: Medicines ── */}
    <svg
      viewBox="0 0 92 34"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute top-14 left-0 w-24"
      style={{ animationDelay: '1s' }}
      aria-hidden="true"
    >
      <rect width="92" height="34" rx="10" fill="white" opacity=".9" />
      <rect
        width="92"
        height="34"
        rx="10"
        fill="none"
        stroke="#ccfbf1"
        strokeWidth="1"
      />
      <circle cx="14" cy="17" r="5" fill="#14b8a6" className="pulse-dot" />
      <text
        x="25"
        y="13"
        fontFamily="sans-serif"
        fontSize="7"
        fill="#0f172a"
        fontWeight="700"
      >
        MEDICINES
      </text>
      <text x="25" y="25" fontFamily="sans-serif" fontSize="6.5" fill="#64748b">
        Editable List
      </text>
    </svg>
  </div>
);

/* ================================================================
   4. INFO FIELD — reusable label + value pill
   ================================================================ */
const InfoField = ({ label, value, span = false }) => (
  <div
    className={`field-pill rounded-2xl bg-slate-50 p-4 ${span ? 'sm:col-span-2' : ''}`}
  >
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
      {label}
    </p>
    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
      {value || '—'}
    </p>
  </div>
);

/* ================================================================
   5. SECTION CARD WRAPPER
   ================================================================ */
const SCard = ({ children, className = '', delay = '' }) => (
  <section
    className={`info-card card-entry rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className} ${delay}`}
  >
    {children}
  </section>
);

/* ================================================================
   6. SECTION HEADING
   ================================================================ */
const SHead = ({ icon, title, sub, action }) => (
  <div className="mb-6 flex items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
        {icon}
      </span>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {sub && <p className="text-sm text-slate-500">{sub}</p>}
      </div>
    </div>
    {action}
  </div>
);

/* ================================================================
   7. SKELETON LOADER
   ================================================================ */
const SkeletonPage = () => (
  <div className="space-y-6">
    <div className="shimmer-bg h-64 w-full rounded-3xl" />
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-slate-200 bg-white p-6"
          >
            <div className="shimmer-bg h-5 w-40 rounded-full mb-5" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="shimmer-bg h-16 rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-slate-200 bg-white p-6"
          >
            <div className="shimmer-bg h-5 w-32 rounded-full mb-4" />
            <div className="shimmer-bg h-24 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ================================================================
   8. MAIN PAGE COMPONENT
   ================================================================ */
const PrescriptionDetailsForDoctor = () => {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();

  /* ── State ── */
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ── Editable fields ── */
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [medicines, setMedicines] = useState([]);

  /* ── Fetch prescription ── */
  const fetchPrescription = async () => {
    try {
      setLoading(true);
      const res = await getPrescriptionById(prescriptionId);
      const data = res.data.prescription;
      setPrescription(data);
      setDiagnosis(data.diagnosis || '');
      setNotes(data.notes || '');
      setFollowUpDate(data.followUpDate ? data.followUpDate.split('T')[0] : '');
      setMedicines(data.medicines || []);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to load prescription',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescription();
  }, [prescriptionId]);

  /* ── Download ── */
  const handleDownload = async () => {
    try {
      const res = await downloadPrescription(prescriptionId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `prescription-${prescriptionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download prescription');
    }
  };

  /* ── Medicine helpers ── */
  const addMedicine = () =>
    setMedicines((prev) => [
      ...prev,
      { name: '', dosage: '', frequency: '', duration: '' },
    ]);
  const removeMedicine = (i) =>
    setMedicines((prev) => prev.filter((_, idx) => idx !== i));
  const updateMedicine = (i, field, value) => {
    const updated = [...medicines];
    updated[i][field] = value;
    setMedicines(updated);
  };

  /* ── Save ── */
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await updatePrescription(prescription._id, {
        diagnosis,
        medicines,
        notes,
        followUpDate,
      });
      setPrescription(res.data.prescription);
      setIsEditing(false);
      toast.success('Prescription updated successfully');
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to update prescription',
      );
    } finally {
      setSaving(false);
    }
  };

  /* ── Cancel edit ── */
  const handleCancelEdit = () => {
    setDiagnosis(prescription.diagnosis || '');
    setNotes(prescription.notes || '');
    setFollowUpDate(
      prescription.followUpDate ? prescription.followUpDate.split('T')[0] : '',
    );
    setMedicines(prescription.medicines || []);
    setIsEditing(false);
  };

  /* ── Loading state ── */
  if (loading)
    return (
      <DashboardLayout>
        <div className="rx-doc-root min-h-screen bg-[#f0f5fb] px-4 py-8 sm:px-6 lg:px-8">
          <style>{styles}</style>
          <div className="mx-auto max-w-7xl">
            <SkeletonPage />
          </div>
        </div>
      </DashboardLayout>
    );

  /* ── Not found ── */
  if (!prescription)
    return (
      <DashboardLayout>
        <div className="rx-doc-root min-h-screen bg-[#f0f5fb] p-8 flex items-center justify-center">
          <style>{styles}</style>
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm max-w-md w-full">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-50 text-teal-500">
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
              Prescription Not Found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              The requested prescription could not be found.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="btn-act mt-6 inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );

  const patient = prescription.patientId;
  const doctor = prescription.doctorId;
  const shortId = prescription._id?.slice(-8).toUpperCase();

  /* ─────────────────────────────────────────────────────────── */
  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="rx-doc-root min-h-screen bg-[#f0f5fb] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* ============================================================
              HERO SECTION
              ============================================================ */}
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
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-cyan-300 opacity-10 blur-3xl" />
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

            <div className="relative flex flex-col gap-8 px-8 py-10 md:flex-row md:items-center md:px-10">
              {/* Left — text */}
              <div className="flex-1">
                {/* Eyebrow */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-100 backdrop-blur-sm">
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
                  Prescription Details
                </div>

                <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                  Patient Prescription
                  <br />
                  <span className="text-teal-200">Ref #{shortId}</span>
                </h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-teal-100/80">
                  Review, edit and manage this prescription. All changes are
                  saved to the patient record.
                </p>

                {/* Stat pills */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    { label: 'Medicines', val: medicines.length },
                    {
                      label: 'Created',
                      val: new Date(prescription.createdAt).toLocaleDateString(
                        'en-US',
                        { day: 'numeric', month: 'short' },
                      ),
                    },
                    {
                      label: 'Follow Up',
                      val: followUpDate
                        ? new Date(followUpDate).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : 'None',
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl px-4 py-3"
                      style={{
                        background: 'rgba(255,255,255,0.13)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.22)',
                      }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-teal-200 leading-none">
                        {s.label}
                      </p>
                      <p className="text-lg font-extrabold text-white mt-0.5 leading-none">
                        {s.val}
                      </p>
                    </div>
                  ))}
                  {/* Edit mode indicator */}
                  {isEditing && (
                    <div
                      className="rounded-2xl px-4 py-3 flex items-center gap-2"
                      style={{
                        background: 'rgba(251,191,36,0.2)',
                        border: '1px solid rgba(251,191,36,0.35)',
                      }}
                    >
                      <span className="h-2 w-2 rounded-full bg-amber-400 pulse-dot" />
                      <span className="text-sm font-bold text-amber-300">
                        Edit Mode
                      </span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {/* Back */}
                  <button
                    onClick={() => navigate(-1)}
                    className="btn-act btn-back inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm border border-white/20"
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
                        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                      />
                    </svg>
                    Back
                  </button>

                  {/* Download */}
                  <button
                    onClick={handleDownload}
                    className="btn-act inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-teal-700 shadow-md"
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
                    Download PDF
                  </button>

                  {/* Edit / Save / Cancel */}
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-act inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm border border-white/25"
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
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                        />
                      </svg>
                      Edit Prescription
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-act inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
                      <button
                        onClick={handleCancelEdit}
                        className="btn-act inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm border border-white/20"
                      >
                        Discard
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Illustration */}
              <div className="mx-auto h-52 w-60 flex-shrink-0 md:mx-0 md:h-60 md:w-64 lg:h-64 lg:w-72 relative">
                <RxIllustration />
              </div>
            </div>
          </div>

          {/* ============================================================
              BODY — Two-column layout on xl, single on mobile
              ============================================================ */}
          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            {/* ── LEFT COLUMN ── */}
            <div className="space-y-6">
              {/* === PATIENT INFORMATION === */}
              <SCard delay="d1">
                <SHead
                  title="Patient Information"
                  sub="Personal and contact details"
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
                <div className="flex flex-col gap-5 sm:flex-row">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="h-24 w-24 overflow-hidden rounded-2xl ring-2 ring-teal-100 shadow">
                      <Avatar
                        src={patient?.profilePicture}
                        name={patient?.fullName}
                        idx={0}
                        className="h-full w-full rounded-2xl"
                      />
                    </div>
                  </div>
                  {/* Fields */}
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <InfoField label="Full Name" value={patient?.fullName} />
                    <InfoField label="Gender" value={patient?.gender} />
                    <InfoField label="Email" value={patient?.email} />
                    <InfoField label="Phone" value={patient?.phoneNumber} />
                    <InfoField
                      label="Date of Birth"
                      value={
                        patient?.dateOfBirth
                          ? new Date(patient.dateOfBirth).toLocaleDateString(
                              'en-US',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              },
                            )
                          : '—'
                      }
                      span
                    />
                  </div>
                </div>
              </SCard>

              {/* === DIAGNOSIS === */}
              <SCard delay="d2">
                <SHead
                  title="Diagnosis"
                  sub={
                    isEditing
                      ? 'Edit the patient diagnosis below'
                      : 'Primary diagnosis from consultation'
                  }
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
                {isEditing ? (
                  <textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    rows={4}
                    placeholder="Enter diagnosis details…"
                    className="rx-input edit-ring w-full resize-none rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition"
                  />
                ) : (
                  <div className="rounded-2xl bg-teal-50 border border-teal-100 px-4 py-4">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {diagnosis || '—'}
                    </p>
                  </div>
                )}
              </SCard>

              {/* === MEDICINES === */}
              <SCard delay="d3">
                <SHead
                  title="Medicines"
                  sub={`${medicines.length} medicine${medicines.length !== 1 ? 's' : ''} prescribed`}
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
                  action={
                    isEditing && (
                      <button
                        onClick={addMedicine}
                        className="btn-act inline-flex items-center gap-1.5 rounded-2xl bg-teal-50 border border-teal-200 px-3 py-2 text-sm font-bold text-teal-700 hover:bg-teal-100"
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
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                        Add
                      </button>
                    )
                  }
                />

                {medicines.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-10 text-center">
                    <svg
                      className="mb-3 h-10 w-10 text-slate-300"
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
                    <p className="text-sm text-slate-500">
                      No medicines added yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {medicines.map((med, i) => (
                      <div
                        key={i}
                        className={`med-row med-row-hover rounded-2xl border border-slate-200 overflow-hidden`}
                        style={{ animationDelay: `${0.05 + i * 0.06}s` }}
                      >
                        {isEditing ? (
                          /* ── Edit mode: input grid ── */
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                                Medicine #{i + 1}
                              </span>
                              <button
                                onClick={() => removeMedicine(i)}
                                className="btn-act flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100"
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
                              </button>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {[
                                {
                                  ph: 'Medicine Name',
                                  field: 'name',
                                  val: med.name,
                                },
                                {
                                  ph: 'Dosage (e.g. 500mg)',
                                  field: 'dosage',
                                  val: med.dosage,
                                },
                                {
                                  ph: 'Frequency',
                                  field: 'frequency',
                                  val: med.frequency,
                                },
                                {
                                  ph: 'Duration',
                                  field: 'duration',
                                  val: med.duration,
                                },
                              ].map((f) => (
                                <input
                                  key={f.field}
                                  value={f.val}
                                  onChange={(e) =>
                                    updateMedicine(i, f.field, e.target.value)
                                  }
                                  placeholder={f.ph}
                                  className="edit-ring w-full rounded-2xl px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 transition"
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          /* ── View mode ── */
                          <div className="flex items-center gap-0 sm:gap-4 p-4">
                            {/* Number badge */}
                            <div className="hidden sm:flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-bold text-sm">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 text-sm">
                                {med.name || '—'}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {[med.dosage, med.frequency, med.duration]
                                  .filter(Boolean)
                                  .map((v, vi) => (
                                    <span
                                      key={vi}
                                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600"
                                    >
                                      {v}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </SCard>

              {/* === NOTES === */}
              <SCard delay="d4">
                <SHead
                  title="Doctor's Notes"
                  sub="Additional clinical notes"
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
                {isEditing ? (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Enter any additional notes…"
                    className="rx-input edit-ring w-full resize-none rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition"
                  />
                ) : (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {notes || 'No additional notes.'}
                    </p>
                  </div>
                )}
              </SCard>
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <aside className="space-y-6 xl:sticky xl:top-24 xl:h-fit">
              {/* === DOCTOR INFORMATION === */}
              <SCard
                delay="d2"
                className="shadow-[0_12px_40px_rgba(13,148,136,.08)]"
              >
                <SHead
                  title="Doctor"
                  sub="Prescribing physician"
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
                <div className="space-y-2">
                  {[
                    { label: 'Qualification', value: doctor?.qualification },
                    { label: 'Specialization', value: doctor?.specialization },
                    {
                      label: 'Experience',
                      value: doctor?.experience
                        ? `${doctor.experience} years`
                        : '—',
                    },
                  ].map((f) => (
                    <InfoField key={f.label} label={f.label} value={f.value} />
                  ))}
                </div>
              </SCard>

              {/* === FOLLOW UP DATE === */}
              <SCard delay="d3">
                <SHead
                  title="Follow Up"
                  sub="Next scheduled visit"
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
                {isEditing ? (
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="edit-ring rx-input w-full rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition"
                  />
                ) : (
                  <div
                    className={`rounded-2xl px-4 py-4 ${followUpDate ? 'bg-teal-50 border border-teal-100' : 'bg-slate-50 border border-slate-100'}`}
                  >
                    {followUpDate ? (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-1">
                          Scheduled
                        </p>
                        <p className="text-base font-bold text-teal-800">
                          {new Date(followUpDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-400 font-medium">
                        No follow-up date set.
                      </p>
                    )}
                  </div>
                )}
              </SCard>

              {/* === PRESCRIPTION META === */}
              <SCard delay="d4">
                <SHead
                  title="Prescription Info"
                  sub="Record metadata"
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
                <div className="space-y-2">
                  <InfoField label="Reference ID" value={`#${shortId}`} />
                  <InfoField
                    label="Created"
                    value={new Date(prescription.createdAt).toLocaleDateString(
                      'en-US',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  />
                </div>

                {/* Download CTA */}
                <button
                  onClick={handleDownload}
                  className="btn-act btn-teal mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white"
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
                  Download PDF
                </button>
              </SCard>
            </aside>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrescriptionDetailsForDoctor;
