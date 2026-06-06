/*
 * CreateDoctorProfilePage.jsx — AlphaCare Design System (Teal Theme)
 * Sections:
 *  1. Styles & Keyframes
 *  2. PendingScreen Sub-Component
 *  3. RejectedScreen Sub-Component
 *  4. FormField Sub-Component
 *  5. Hero Illustration SVG
 *  6. CreateDoctorProfilePage Main Component
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import ROUTES from '../../constants/routes.js';
import useAuthStore from '../../store/auth.store.js';
import { getDepartments } from '../../api/department.api.js';
import { createDoctorProfile } from '../../api/doctor.api.js';

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
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes statusPulse {
    0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
    50%     { transform: scale(1.04); box-shadow: 0 0 0 12px rgba(245,158,11,0); }
  }
  @keyframes statusPulseRed {
    0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
    50%     { transform: scale(1.04); box-shadow: 0 0 0 12px rgba(239,68,68,0); }
  }
  @keyframes orbitRing {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .float-1  { animation: float1 5.5s ease-in-out infinite; }
  .float-2  { animation: float2 4.8s ease-in-out infinite .7s; }
  .float-3  { animation: float3 6.2s ease-in-out infinite 1.3s; }
  .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
  .spin-slow { animation: spinSlow 22s linear infinite; }
  .anim-fade-up { animation: fadeUp .55s ease both; }
  .d1 { animation-delay: .06s; } .d2 { animation-delay: .12s; }
  .d3 { animation-delay: .18s; } .d4 { animation-delay: .24s; }

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
    background: rgba(255,255,255,0.13);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.22);
  }
  .rx-input {
    width: 100%;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    color: #1e293b;
    transition: border-color .18s, box-shadow .18s, background .18s;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
  }
  .rx-input:focus {
    border-color: #2dd4bf;
    box-shadow: 0 0 0 3px rgba(45,212,191,.15);
    background: white;
  }
  .rx-input:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }
  .btn-act {
    transition: transform .18s ease, box-shadow .18s ease;
    box-shadow: 0 4px 14px rgba(13,148,136,.32);
  }
  .btn-act:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(13,148,136,.4);
  }
  .btn-act:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
  .form-section {
    background: white;
    border-radius: 1.5rem;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
    background: linear-gradient(135deg, #f0fdfa, #f8fffe);
  }
  .section-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #ccfbf1, #cffafe);
    color: #0f766e;
    flex-shrink: 0;
  }
  .upload-zone {
    border: 2px dashed #99f6e4;
    border-radius: 1rem;
    padding: 24px;
    text-align: center;
    background: #f0fdfa;
    cursor: pointer;
    transition: border-color .2s, background .2s;
  }
  .upload-zone:hover {
    border-color: #0d9488;
    background: #ccfbf1;
  }
  .upload-zone.has-file {
    border-color: #0d9488;
    background: #f0fdfa;
  }
  .status-pending-pulse {
    animation: statusPulse 2.5s ease-in-out infinite;
  }
  .status-red-pulse {
    animation: statusPulseRed 2.5s ease-in-out infinite;
  }
  .step-dot {
    transition: background .3s, transform .3s;
  }
`;

/* === 2. PENDING SCREEN SUB-COMPONENT === */
const PendingScreen = () => (
  <DashboardLayout>
    <style>{styles}</style>
    <div
      className="flex min-h-screen items-center justify-center p-4 md:p-6"
      style={{ background: '#f0f5fb' }}
    >
      <div className="w-full max-w-lg anim-fade-up">
        <div className="rounded-3xl bg-white border border-amber-200 shadow-sm overflow-hidden">
          {/* Top amber strip */}
          <div
            className="h-1.5 w-full"
            style={{
              background:
                'linear-gradient(to right, #f59e0b, #fbbf24, transparent)',
            }}
          />

          <div className="p-8 md:p-10 text-center">
            {/* Animated icon */}
            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
              <div className="status-pending-pulse absolute inset-0 rounded-full bg-amber-100" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                <svg
                  className="h-10 w-10 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="sora text-2xl font-extrabold text-slate-800">
              Under Review
            </h1>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              Your doctor profile has been submitted and is awaiting admin
              approval. We'll notify you once it's reviewed.
            </p>

            {/* Status badge */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-5 py-2 text-sm font-bold text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500 pulse-dot" />
              Pending Approval
            </div>

            {/* Steps */}
            <div className="mt-8 flex items-center justify-center gap-2">
              {['Submitted', 'Under Review', 'Decision'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="step-dot h-3 w-3 rounded-full"
                      style={{ background: i < 2 ? '#f59e0b' : '#e2e8f0' }}
                    />
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {step}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className="mb-4 h-0.5 w-8 rounded-full"
                      style={{ background: i < 1 ? '#f59e0b' : '#e2e8f0' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

/* === 3. REJECTED SCREEN SUB-COMPONENT === */
const RejectedScreen = ({ doctorProfile }) => (
  <DashboardLayout>
    <style>{styles}</style>
    <div
      className="flex min-h-screen items-center justify-center p-4 md:p-6"
      style={{ background: '#f0f5fb' }}
    >
      <div className="w-full max-w-lg anim-fade-up">
        <div className="rounded-3xl bg-white border border-red-200 shadow-sm overflow-hidden">
          <div
            className="h-1.5 w-full"
            style={{
              background:
                'linear-gradient(to right, #ef4444, #f87171, transparent)',
            }}
          />

          <div className="p-8 md:p-10">
            <div className="text-center">
              <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                <div className="status-red-pulse absolute inset-0 rounded-full bg-red-100" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-10 w-10 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="sora text-2xl font-extrabold text-slate-800">
                Profile Rejected
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Your application was not approved. See the reason below.
              </p>
            </div>

            {/* Reason box */}
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-700">
                    Rejection Reason
                  </p>
                  <p className="mt-1 text-sm text-red-600 leading-relaxed">
                    {doctorProfile?.rejectionReason ||
                      'No specific reason was provided.'}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
              Please contact the administrator for further clarification or to
              resubmit your application.
            </p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

/* === 4. FORM FIELD SUB-COMPONENT === */
const FormField = ({ label, required, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
      {label}
      {required && <span className="ml-1 text-red-400">*</span>}
    </label>
    {children}
  </div>
);

/* === 5. HERO ILLUSTRATION SVG === */
const HeroIllustration = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <svg
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute inset-0 w-full h-full"
    >
      <defs>
        <linearGradient id="cpGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="cpBadge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#99f6e4" />
          <stop offset="100%" stopColor="#a5f3fc" />
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

      {/* Clipboard / Form */}
      <rect
        x="48"
        y="32"
        width="124"
        height="156"
        rx="16"
        fill="white"
        fillOpacity="0.95"
      />
      <rect x="48" y="32" width="124" height="38" rx="16" fill="url(#cpGrad)" />
      <rect x="48" y="52" width="124" height="18" fill="url(#cpGrad)" />

      {/* Clipboard top clip */}
      <rect
        x="90"
        y="26"
        width="40"
        height="16"
        rx="8"
        fill="url(#cpGrad)"
        stroke="white"
        strokeWidth="2"
      />

      <text
        x="68"
        y="58"
        fill="white"
        fontSize="9"
        fontWeight="700"
        fontFamily="Sora"
      >
        Doctor Profile
      </text>

      {/* Form lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect
            x="64"
            y={82 + i * 22}
            width="40"
            height="5"
            rx="2.5"
            fill="#e2e8f0"
          />
          <rect
            x="64"
            y={91 + i * 22}
            width={55 + (i % 3) * 12}
            height="6"
            rx="3"
            fill={i % 2 === 0 ? '#99f6e4' : '#f1f5f9'}
          />
        </g>
      ))}

      {/* Checkmark badge */}
      <circle
        cx="148"
        cy="164"
        r="18"
        fill="#ccfbf1"
        stroke="#5eead4"
        strokeWidth="1.5"
      />
      <path
        d="M141 164l4.5 4.5 8-8"
        stroke="#0d9488"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Stethoscope */}
      <circle cx="58" cy="60" r="10" fill="rgba(255,255,255,0.15)" />
      <path
        d="M54 55 q0 7 4 7 q4 0 4-7"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <line
        x1="58"
        y1="62"
        x2="58"
        y2="67"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="58" cy="69" r="2.5" fill="white" />
    </svg>

    {/* Badge 1 — Verification */}
    <svg
      viewBox="0 0 94 34"
      className="float-2 absolute"
      style={{ top: '5%', right: '-8%', width: 92 }}
    >
      <rect
        width="94"
        height="34"
        rx="10"
        fill="white"
        fillOpacity="0.93"
        stroke="#99f6e4"
        strokeWidth="1"
      />
      <circle cx="14" cy="17" r="5" fill="#ccfbf1" />
      <circle cx="14" cy="17" r="3" fill="#0d9488" className="pulse-dot" />
      <text
        x="24"
        y="14"
        fill="#0f766e"
        fontSize="7"
        fontWeight="700"
        fontFamily="Sora"
      >
        Verification
      </text>
      <text x="24" y="25" fill="#0d9488" fontSize="8" fontWeight="600">
        Required
      </text>
    </svg>

    {/* Badge 2 — Profile */}
    <svg
      viewBox="0 0 88 32"
      className="float-3 absolute"
      style={{ bottom: '18%', left: '-10%', width: 86 }}
    >
      <rect
        width="88"
        height="32"
        rx="9"
        fill="white"
        fillOpacity="0.93"
        stroke="#a5f3fc"
        strokeWidth="1"
      />
      <text x="10" y="13" fill="#0891b2" fontSize="7" fontWeight="600">
        Step 1 of 1
      </text>
      <text
        x="10"
        y="25"
        fill="#0284c7"
        fontSize="9"
        fontWeight="800"
        fontFamily="Sora"
      >
        Complete
      </text>
    </svg>

    {/* Badge 3 — Approved */}
    <svg
      viewBox="0 0 80 30"
      className="float-1 absolute"
      style={{ bottom: '2%', right: '-4%', width: 76, animationDelay: '1.2s' }}
    >
      <rect
        width="80"
        height="30"
        rx="8"
        fill="white"
        fillOpacity="0.93"
        stroke="#99f6e4"
        strokeWidth="1"
      />
      <path
        d="M9 15l3 3 6-6"
        stroke="#0d9488"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x="22" y="12" fill="#0f766e" fontSize="7" fontWeight="600">
        Get
      </text>
      <text
        x="22"
        y="23"
        fill="#0d9488"
        fontSize="9"
        fontWeight="800"
        fontFamily="Sora"
      >
        Approved
      </text>
    </svg>
  </div>
);

/* === 6. CREATE DOCTOR PROFILE PAGE MAIN COMPONENT === */
const CreateDoctorProfilePage = () => {
  const navigate = useNavigate();
  const { user, doctorProfile } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [licenseDocument, setLicenseDocument] = useState(null);

  const [formData, setFormData] = useState({
    department: '',
    specialization: '',
    qualification: '',
    experience: '',
    bio: '',
    consultationMode: 'both',
    consultationFee: '',
  });

  useEffect(() => {
    if (doctorProfile?.approvalStatus === 'approved') {
      navigate(ROUTES.DOCTOR_DASHBOARD);
    }
  }, [doctorProfile, navigate]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getDepartments();
        setDepartments(response.data.departments);
      } catch {
        toast.error('Failed to load departments');
      } finally {
        setDepartmentsLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!licenseDocument) {
      toast.error('Please upload your license document');
      return;
    }
    try {
      setLoading(true);
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        payload.append(key, value),
      );
      payload.append('licenseDocument', licenseDocument);
      await createDoctorProfile(payload);
      toast.success('Profile submitted successfully');
      window.location.reload();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  /* Status screens */
  if (doctorProfile?.approvalStatus === 'pending') return <PendingScreen />;
  if (doctorProfile?.approvalStatus === 'rejected')
    return <RejectedScreen doctorProfile={doctorProfile} />;

  return (
    <DashboardLayout>
      <style>{styles}</style>
      <div
        className="min-h-screen p-4 md:p-6"
        style={{ background: '#f0f5fb' }}
      >
        <div className="mx-auto max-w-7xl space-y-5">
          {/* === HERO === */}
          <div
            className="relative overflow-hidden rounded-3xl anim-fade-up"
            style={{
              background:
                'linear-gradient(135deg, #0f766e 0%, #0d9488 45%, #0891b2 100%)',
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
              className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            />
            {/* Spinning ring desktop */}
            <div className="pointer-events-none absolute top-4 left-4 hidden md:block">
              <svg
                width="72"
                height="72"
                viewBox="0 0 72 72"
                className="spin-slow opacity-20"
              >
                <circle
                  cx="36"
                  cy="36"
                  r="32"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeDasharray="6 5"
                  fill="none"
                />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 md:p-8">
              <div className="flex-1">
                {/* Eyebrow */}
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-3"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: '#99f6e4',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-200 pulse-dot" />
                  Doctor Onboarding
                </div>

                <h1 className="sora text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  Complete Your{' '}
                  <span className="text-teal-200">Doctor Profile</span>
                </h1>
                <p
                  className="mt-2 text-sm text-teal-100 max-w-md"
                  style={{ opacity: 0.88 }}
                >
                  Submit your professional credentials for verification. Our
                  admin team reviews all applications within 24–48 hours.
                </p>

                {/* Mini stat chips */}
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {[
                    { label: 'One-time setup', icon: '✓' },
                    { label: '24–48h review', icon: '⏱' },
                    { label: 'Secure & private', icon: '🔒' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="stat-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-teal-100"
                    >
                      <span>{s.icon}</span>
                      {s.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Illustration — hidden on xs */}
              <div className="hidden sm:block h-48 w-52 md:h-56 md:w-60 lg:h-64 lg:w-72 flex-shrink-0 relative">
                <HeroIllustration />
              </div>
            </div>
          </div>

          {/* === FORM === */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Section 1 — Professional Details */}
            <div className="form-section anim-fade-up d1">
              <div className="section-header">
                <div className="section-icon">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="sora text-sm font-bold text-slate-800">
                    Professional Details
                  </h2>
                  <p className="text-xs text-slate-500">
                    Your qualifications and specialization
                  </p>
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <FormField label="Department" required>
                  {departmentsLoading ? (
                    <div className="shimmer-bg h-11 rounded-2xl" />
                  ) : (
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="rx-input"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  )}
                </FormField>

                <FormField label="Specialization" required>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g. Cardiology"
                    className="rx-input"
                    required
                  />
                </FormField>

                <FormField label="Qualification" required>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g. MBBS, MD"
                    className="rx-input"
                    required
                  />
                </FormField>

                <FormField label="Experience (Years)" required>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    min="0"
                    className="rx-input"
                    required
                  />
                </FormField>
              </div>
            </div>

            {/* Section 2 — Consultation Settings */}
            <div className="form-section anim-fade-up d2">
              <div className="section-header">
                <div className="section-icon">
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
                      d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="sora text-sm font-bold text-slate-800">
                    Consultation Settings
                  </h2>
                  <p className="text-xs text-slate-500">
                    How and how much you charge per consultation
                  </p>
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <FormField label="Consultation Mode">
                  <select
                    name="consultationMode"
                    value={formData.consultationMode}
                    onChange={handleChange}
                    className="rx-input"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="both">Both (Online + Offline)</option>
                  </select>
                </FormField>

                <FormField label="Consultation Fee (₹)" required>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    min="0"
                    className="rx-input"
                    required
                  />
                </FormField>
              </div>
            </div>

            {/* Section 3 — Bio */}
            <div className="form-section anim-fade-up d3">
              <div className="section-header">
                <div className="section-icon">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="sora text-sm font-bold text-slate-800">
                    Professional Bio
                  </h2>
                  <p className="text-xs text-slate-500">
                    Introduce yourself to patients
                  </p>
                </div>
              </div>

              <div className="p-5">
                <textarea
                  rows={5}
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Write a short bio about your expertise, approach, and what patients can expect…"
                  className="rx-input resize-none"
                  required
                />
                <p className="mt-1.5 text-right text-xs text-slate-400">
                  {formData.bio.length} characters
                </p>
              </div>
            </div>

            {/* Section 4 — License Upload */}
            <div className="form-section anim-fade-up d4">
              <div className="section-header">
                <div className="section-icon">
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
                      d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="sora text-sm font-bold text-slate-800">
                    Medical License Document
                  </h2>
                  <p className="text-xs text-slate-500">
                    PDF or image — required for verification
                  </p>
                </div>
              </div>

              <div className="p-5">
                <label
                  className={`upload-zone block ${licenseDocument ? 'has-file' : ''}`}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setLicenseDocument(e.target.files[0])}
                    className="hidden"
                    required
                  />
                  {licenseDocument ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-teal-700">
                        {licenseDocument.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(licenseDocument.size / 1024).toFixed(1)} KB · Click to
                        change
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-500">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        Click to upload license document
                      </p>
                      <p className="text-xs text-slate-400">
                        PDF, JPG, PNG up to 10MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="anim-fade-up d4 pb-4">
              <button
                type="submit"
                disabled={loading || departmentsLoading}
                className="btn-act w-full rounded-2xl bg-teal-600 py-4 text-base font-bold text-white"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-3">
                    <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Submitting Profile…
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2">
                    Submit For Approval
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </span>
                )}
              </button>
              <p className="mt-3 text-center text-xs text-slate-400">
                By submitting, you confirm that all information provided is
                accurate and authentic.
              </p>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateDoctorProfilePage;
