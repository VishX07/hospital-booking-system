/*
 * PatientDetailsPage.jsx — AlphaCare Design System
 * Sections:
 *  1. Styles & Keyframes
 *  2. PatientAvatar Sub-Component
 *  3. SkeletonLoader Sub-Component
 *  4. StatCard Sub-Component
 *  5. PrescriptionCard Sub-Component
 *  6. Hero Illustration SVG
 *  7. PatientDetailsPage Main Component
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { getPatientDetails } from '../../api/doctor.api';
import { getPatientPrescriptionHistory } from '../../api/prescription.api';

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
  @keyframes modalIn {
    from { opacity: 0; transform: scale(.95) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(16px) scale(.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
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
  .stat-glass {
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
  }
  .rx-card {
    transition: transform .22s ease, box-shadow .22s ease;
  }
  .rx-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 36px rgba(37,99,235,.12);
  }
  .btn-act {
    transition: transform .18s ease, box-shadow .18s ease;
    box-shadow: 0 4px 14px rgba(37,99,235,.28);
  }
  .btn-act:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(37,99,235,.36);
  }
  .contact-btn {
    transition: transform .16s ease, background .16s ease, box-shadow .16s ease;
  }
  .contact-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37,99,235,.2);
  }
`;

/* === 2. PATIENT AVATAR SUB-COMPONENT === */
const PALETTE = [
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#e0e7ff', text: '#4338ca' },
  { bg: '#ccfbf1', text: '#0f766e' },
  { bg: '#ede9fe', text: '#6d28d9' },
  { bg: '#ffedd5', text: '#c2410c' },
];

const PatientAvatar = ({ src, name, size = 'lg' }) => {
  const [err, setErr] = useState(false);
  const palette = PALETTE[0];
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'P';
  const dim =
    size === 'xl'
      ? { cls: 'h-20 w-20 md:h-24 md:w-24', text: 'text-2xl' }
      : { cls: 'h-16 w-16', text: 'text-lg' };

  if (!src || err) {
    return (
      <div
        className={`${dim.cls} ${dim.text} rounded-full flex items-center justify-center font-bold flex-shrink-0 ring-4 ring-white`}
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
      onError={() => setErr(true)}
      className={`${dim.cls} rounded-full object-cover flex-shrink-0 ring-4 ring-white`}
    />
  );
};

/* === 3. SKELETON LOADER SUB-COMPONENT === */
const SkeletonLoader = () => (
  <DashboardLayout>
    <style>{styles}</style>
    <div
      className="space-y-5 p-4 md:p-6"
      style={{ background: '#f0f5fb', minHeight: '100vh' }}
    >
      <div className="shimmer-bg h-52 md:h-60 rounded-3xl" />
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="shimmer-bg h-24 rounded-3xl" />
        ))}
      </div>
      <div className="shimmer-bg h-8 w-48 rounded-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="shimmer-bg h-40 rounded-3xl" />
        ))}
      </div>
    </div>
  </DashboardLayout>
);

/* === 4. STAT CARD SUB-COMPONENT === */
const StatCard = ({ label, value, icon, delay }) => (
  <div
    className={`anim-fade-up ${delay} rounded-3xl bg-white border border-slate-200 shadow-sm p-5`}
  >
    <div className="flex items-start justify-between">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-teal-600">
        {icon}
      </div>
    </div>
    <p className="sora mt-3 text-3xl font-bold text-slate-900">
      {value ?? '—'}
    </p>
  </div>
);

/* === 5. PRESCRIPTION CARD SUB-COMPONENT === */
const PrescriptionCard = ({ prescription, index, onView }) => {
  const delayMs = index * 0.07;
  const followUp = prescription.followUpDate
    ? new Date(prescription.followUpDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <div
      className="rx-card anim-fade-up rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden"
      style={{ animationDelay: `${delayMs}s` }}
    >
      {/* Top accent strip */}
      <div
        className="h-1.5 w-full"
        style={{
          background: 'linear-gradient(to right, #2563eb55, transparent)',
        }}
      />

      <div className="p-5">
        {/* Diagnosis */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="sora text-base font-bold text-slate-900 leading-snug">
            {prescription.diagnosis || 'Diagnosis not specified'}
          </h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 flex-shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 pulse-dot" />
            Rx
          </span>
        </div>

        {/* Specialization */}
        {prescription.doctorId?.specialization && (
          <p className="mt-1.5 text-xs text-slate-500 font-medium">
            {prescription.doctorId.specialization}
          </p>
        )}

        {/* Meta chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            <svg
              className="h-3.5 w-3.5 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            {prescription.medicines?.length ?? 0} Medicine
            {(prescription.medicines?.length ?? 0) !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            <svg
              className="h-3.5 w-3.5 text-teal-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Follow-up: {followUp}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={() => onView(prescription._id)}
          className="btn-act mt-4 w-full rounded-2xl bg-teal-600 py-2.5 text-sm font-semibold text-white"
        >
          View Prescription
        </button>
      </div>
    </div>
  );
};

/* === 6. HERO ILLUSTRATION SVG === */
const HeroIllustration = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <svg
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute inset-0 w-full h-full"
    >
      <defs>
        <linearGradient id="pdGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="avatarBg" x1="0" y1="0" x2="1" y2="1">
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

      {/* Profile card */}
      <rect
        x="42"
        y="38"
        width="136"
        height="144"
        rx="18"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Card header */}
      <rect x="42" y="38" width="136" height="40" rx="18" fill="url(#pdGrad)" />
      <rect x="42" y="58" width="136" height="20" fill="url(#pdGrad)" />
      <text
        x="62"
        y="63"
        fill="white"
        fontSize="10"
        fontWeight="700"
        fontFamily="Sora"
      >
        Patient Profile
      </text>

      {/* Avatar circle */}
      <circle
        cx="110"
        cy="100"
        r="20"
        fill="url(#avatarBg)"
        stroke="white"
        strokeWidth="2.5"
      />
      <circle cx="110" cy="95" r="8" fill="#93c5fd" />
      <path
        d="M92 116c0-9.94 8.06-14 18-14s18 4.06 18 14"
        stroke="#93c5fd"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Info rows */}
      <rect x="62" y="128" width="96" height="6" rx="3" fill="#e2e8f0" />
      <rect x="70" y="139" width="80" height="5" rx="2.5" fill="#f1f5f9" />
      <rect x="74" y="150" width="72" height="5" rx="2.5" fill="#f1f5f9" />

      {/* Action dots */}
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={90 + i * 20}
          cy="170"
          r="6"
          fill={['#dbeafe', '#dcfce7', '#fef9c3'][i]}
          stroke={['#93c5fd', '#86efac', '#fde047'][i]}
          strokeWidth="1.2"
        />
      ))}

      {/* Medical cross */}
      <circle cx="172" cy="60" r="12" fill="#eff6ff" />
      <path
        d="M168 60h8M172 56v8"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>

    {/* Badge 1 — Last Visit */}
    <svg
      viewBox="0 0 92 34"
      className="float-2 absolute"
      style={{ top: '6%', right: '-6%', width: 90 }}
    >
      <rect
        width="92"
        height="34"
        rx="10"
        fill="white"
        fillOpacity="0.93"
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
        Last Visit
      </text>
      <text x="24" y="25" fill="#2563eb" fontSize="8" fontWeight="600">
        Recent
      </text>
    </svg>

    {/* Badge 2 — Prescriptions */}
    <svg
      viewBox="0 0 88 32"
      className="float-3 absolute"
      style={{ bottom: '16%', left: '-8%', width: 86 }}
    >
      <rect
        width="88"
        height="32"
        rx="9"
        fill="white"
        fillOpacity="0.93"
        stroke="#c7d2fe"
        strokeWidth="1"
      />
      <text x="10" y="13" fill="#6d28d9" fontSize="7" fontWeight="600">
        Prescriptions
      </text>
      <text
        x="10"
        y="25"
        fill="#4338ca"
        fontSize="10"
        fontWeight="800"
        fontFamily="Sora"
      >
        History
      </text>
    </svg>

    {/* Badge 3 — Status */}
    <svg
      viewBox="0 0 78 30"
      className="float-1 absolute"
      style={{ bottom: '2%', right: '-2%', width: 76, animationDelay: '1.2s' }}
    >
      <rect
        width="78"
        height="30"
        rx="8"
        fill="white"
        fillOpacity="0.93"
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
        Status
      </text>
      <text
        x="22"
        y="23"
        fill="#0d9488"
        fontSize="9"
        fontWeight="800"
        fontFamily="Sora"
      >
        Active
      </text>
    </svg>
  </div>
);

/* === 7. PATIENT DETAILS PAGE MAIN COMPONENT === */
const PatientDetailsPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [stats, setStats] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const patientResponse = await getPatientDetails(patientId);
      const prescriptionResponse =
        await getPatientPrescriptionHistory(patientId);
      setPatient(patientResponse.data.patient);
      setStats(patientResponse.data.stats);
      setPrescriptions(prescriptionResponse.data.prescriptions || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load patient');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [patientId]);

  if (loading) return <SkeletonLoader />;

  const genderColor =
    patient?.gender === 'male'
      ? { bg: 'bg-blue-50', text: 'text-blue-700', dot: '#2563eb' }
      : patient?.gender === 'female'
        ? { bg: 'bg-pink-50', text: 'text-pink-700', dot: '#db2777' }
        : { bg: 'bg-slate-100', text: 'text-slate-600', dot: '#64748b' };

  const lastVisitFormatted = stats?.lastVisit
    ? new Date(stats.lastVisit).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

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
          {/* Spinning ring — desktop only */}
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
            {/* Left — Profile info */}
            <div className="flex-1">
              {/* Back button */}
              <button
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-blue-100 transition-colors hover:text-white"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Patients
              </button>

              {/* Patient identity row */}
              <div className="flex items-center gap-4">
                <PatientAvatar
                  src={patient?.profilePicture}
                  name={patient?.fullName}
                  size="xl"
                />
                <div>
                  <h1 className="sora text-2xl md:text-3xl font-extrabold text-white leading-tight">
                    {patient?.fullName}
                  </h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {patient?.gender && (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          background: 'rgba(255,255,255,0.18)',
                          color: 'white',
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-white"
                          style={{ opacity: 0.7 }}
                        />
                        {patient.gender.charAt(0).toUpperCase() +
                          patient.gender.slice(1)}
                      </span>
                    )}
                    {patient?.email && (
                      <span
                        className="text-xs text-blue-100"
                        style={{ opacity: 0.85 }}
                      >
                        {patient.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stat glass chips */}
              <div className="mt-5 flex flex-wrap gap-3">
                {[
                  {
                    label: 'Appointments',
                    value: stats?.totalAppointments ?? '—',
                  },
                  { label: 'Prescriptions', value: prescriptions.length },
                  {
                    label: 'Last Visit',
                    value: stats?.lastVisit
                      ? new Date(stats.lastVisit).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'N/A',
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="stat-glass rounded-2xl px-4 py-2.5 text-center min-w-[80px]"
                  >
                    <p className="sora text-lg font-bold text-white">
                      {s.value}
                    </p>
                    <p className="text-xs text-blue-200 font-medium">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Contact action buttons */}
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  {
                    label: 'WhatsApp',
                    color: '#22c55e',
                    hover: '#16a34a',
                    onClick: () =>
                      window.open(`https://wa.me/91${patient?.phoneNumber}`),
                    icon: (
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Call',
                    color: '#2563eb',
                    hover: '#1d4ed8',
                    onClick: () => {
                      window.location.href = `tel:${patient?.phoneNumber}`;
                    },
                    icon: (
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: 'Email',
                    color: '#7c3aed',
                    hover: '#6d28d9',
                    onClick: () => {
                      window.location.href = `mailto:${patient?.email}`;
                    },
                    icon: (
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
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    ),
                  },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.onClick}
                    className="contact-btn inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white"
                    style={{ background: btn.color }}
                  >
                    {btn.icon}
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right — Illustration (hidden on xs) */}
            <div className="hidden sm:block h-52 w-56 md:h-60 md:w-64 lg:h-72 lg:w-80 flex-shrink-0 relative">
              <HeroIllustration />
            </div>
          </div>
        </div>

        {/* === STATS SECTION === */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Appointments"
            value={stats?.totalAppointments}
            delay="d1"
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <StatCard
            label="Total Prescriptions"
            value={prescriptions.length}
            delay="d2"
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          />
          <StatCard
            label="Last Visit"
            value={lastVisitFormatted}
            delay="d3"
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>

        {/* === PRESCRIPTION HISTORY === */}
        <div className="anim-fade-up d3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="sora text-xl font-bold text-slate-900">
              Prescription History
            </h2>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {prescriptions.length} total
            </span>
          </div>

          {prescriptions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="float-1 w-full h-full"
                >
                  <circle
                    cx="32"
                    cy="32"
                    r="30"
                    fill="#eff6ff"
                    stroke="#bfdbfe"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="18"
                    y="14"
                    width="28"
                    height="36"
                    rx="5"
                    fill="#dbeafe"
                    stroke="#93c5fd"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M24 24h16M24 30h16M24 36h10"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="46" cy="46" r="8" fill="#2563eb" />
                  <path
                    d="M46 42v8M42 46h8"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="sora text-base font-bold text-slate-700">
                No Prescriptions Yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Prescriptions written for this patient will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {prescriptions.map((prescription, index) => (
                <PrescriptionCard
                  key={prescription._id}
                  prescription={prescription}
                  index={index}
                  onView={(id) => navigate(`/doctor/prescriptions/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDetailsPage;
