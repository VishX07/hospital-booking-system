/*
 * DoctorSettingsPage.jsx — AlphaCare Design System (Teal Theme)
 * Sections:
 *  1. Styles & Keyframes
 *  2. DoctorAvatar Sub-Component
 *  3. SectionCard Sub-Component
 *  4. FormField Sub-Component
 *  5. SaveButton Sub-Component
 *  6. Hero Illustration SVG
 *  7. DoctorSettingsPage Main Component
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import ROUTES from '../../constants/routes';
import useAuthStore from '../../store/auth.store.js';
import { updateDoctorProfile } from '../../api/doctor.api.js';
import { updateProfile, updateProfilePhoto } from '../../api/auth.api.js';

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
    background: rgba(255,255,255,0.13);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.22);
  }
  .btn-act {
    transition: transform .18s ease, box-shadow .18s ease;
    box-shadow: 0 4px 14px rgba(13,148,136,.30);
  }
  .btn-act:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(13,148,136,.38);
  }
  .btn-dark {
    transition: transform .18s ease, box-shadow .18s ease;
  }
  .btn-dark:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(15,23,42,.2);
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
  .section-card {
    background: white;
    border-radius: 1.5rem;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
`;

/* === 2. DOCTOR AVATAR SUB-COMPONENT === */
const PALETTE = [
  { bg: '#ccfbf1', text: '#0f766e' },
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#e0e7ff', text: '#4338ca' },
  { bg: '#ede9fe', text: '#6d28d9' },
  { bg: '#ffedd5', text: '#c2410c' },
];

const DoctorAvatar = ({ src, name, size = 'lg' }) => {
  const [err, setErr] = useState(false);
  const palette = PALETTE[0];
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'Dr';
  const cls = size === 'xl' ? 'h-20 w-20 text-2xl' : 'h-14 w-14 text-base';

  if (!src || err) {
    return (
      <div
        className={`${cls} rounded-full flex items-center justify-center font-bold flex-shrink-0 ring-4 ring-white`}
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
      className={`${cls} rounded-full object-cover flex-shrink-0 ring-4 ring-white`}
    />
  );
};

/* === 3. SECTION CARD SUB-COMPONENT === */
const SectionCard = ({ title, subtitle, icon, children, delay = 'd1' }) => (
  <div className={`section-card anim-fade-up ${delay} overflow-hidden`}>
    {/* Tinted top strip */}
    <div
      className="h-1 w-full"
      style={{
        background: 'linear-gradient(to right, #14b8a655, transparent)',
      }}
    />
    <div className="p-5 md:p-6">
      {(title || icon) && (
        <div className="mb-5 flex items-start gap-3">
          {icon && (
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              {icon}
            </div>
          )}
          <div>
            {title && (
              <h2 className="sora text-base font-bold text-slate-800">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  </div>
);

/* === 4. FORM FIELD SUB-COMPONENT === */
const FormField = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wide">
      {label}
    </label>
    {children}
  </div>
);

/* === 5. SAVE BUTTON SUB-COMPONENT === */
const SaveButton = ({ loading, label, loadingLabel, onClick }) => (
  <div className="mt-5 flex justify-end">
    <button
      onClick={onClick}
      disabled={loading}
      className="btn-act inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
      )}
      {loading ? loadingLabel : label}
    </button>
  </div>
);

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
        <linearGradient id="settGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="avatarTeal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#99f6e4" />
          <stop offset="100%" stopColor="#a5f3fc" />
        </linearGradient>
      </defs>
      {/* Spinning outer ring */}
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

      {/* Settings panel card */}
      <rect
        x="40"
        y="36"
        width="140"
        height="148"
        rx="18"
        fill="white"
        fillOpacity="0.95"
      />
      <rect
        x="40"
        y="36"
        width="140"
        height="40"
        rx="18"
        fill="url(#settGrad)"
      />
      <rect x="40" y="56" width="140" height="20" fill="url(#settGrad)" />
      <text
        x="60"
        y="62"
        fill="white"
        fontSize="10"
        fontWeight="700"
        fontFamily="Sora"
      >
        Doctor Settings
      </text>

      {/* Avatar */}
      <circle
        cx="110"
        cy="100"
        r="18"
        fill="url(#avatarTeal)"
        stroke="white"
        strokeWidth="2"
      />
      <circle cx="110" cy="96" r="7" fill="#5eead4" />
      <path
        d="M95 114c0-8.28 6.72-10 15-10s15 1.72 15 10"
        stroke="#5eead4"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Setting rows */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x="60"
            y={128 + i * 16}
            width="100"
            height="8"
            rx="4"
            fill="#f0fdfa"
          />
          <rect
            x="60"
            y={128 + i * 16}
            width={40 + i * 18}
            height="8"
            rx="4"
            fill="#99f6e4"
          />
        </g>
      ))}

      {/* Gear icon */}
      <circle cx="172" cy="60" r="13" fill="#f0fdfa" />
      <circle
        cx="172"
        cy="60"
        r="5"
        stroke="#0d9488"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M172 51v3M172 66v3M163 60h3M178 60h3"
        stroke="#0d9488"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>

    {/* Badge 1 — Verified */}
    <svg
      viewBox="0 0 88 34"
      className="float-2 absolute"
      style={{ top: '5%', right: '-6%', width: 86 }}
    >
      <rect
        width="88"
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
        Status
      </text>
      <text x="24" y="25" fill="#0d9488" fontSize="8" fontWeight="600">
        Verified
      </text>
    </svg>

    {/* Badge 2 — Profile */}
    <svg
      viewBox="0 0 86 32"
      className="float-3 absolute"
      style={{ bottom: '16%', left: '-8%', width: 82 }}
    >
      <rect
        width="86"
        height="32"
        rx="9"
        fill="white"
        fillOpacity="0.93"
        stroke="#a5f3fc"
        strokeWidth="1"
      />
      <text x="10" y="13" fill="#0891b2" fontSize="7" fontWeight="600">
        Profile
      </text>
      <text
        x="10"
        y="25"
        fill="#0284c7"
        fontSize="9"
        fontWeight="800"
        fontFamily="Sora"
      >
        Updated
      </text>
    </svg>

    {/* Badge 3 — Rating */}
    <svg
      viewBox="0 0 78 30"
      className="float-1 absolute"
      style={{ bottom: '2%', right: '-2%', width: 74, animationDelay: '1.2s' }}
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
      <text x="10" y="12" fill="#0f766e" fontSize="7" fontWeight="600">
        Avg Rating
      </text>
      <text
        x="10"
        y="24"
        fill="#0d9488"
        fontSize="10"
        fontWeight="800"
        fontFamily="Sora"
      >
        ★ 4.8
      </text>
    </svg>
  </div>
);

/* === 7. DOCTOR SETTINGS PAGE MAIN COMPONENT === */
const DoctorSettingsPage = () => {
  const navigate = useNavigate();
  const { user, doctorProfile } = useAuthStore();

  const [photoLoading, setPhotoLoading] = useState(false);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [professionalLoading, setProfessionalLoading] = useState(false);
  const [consultationLoading, setConsultationLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);

  const [personalData, setPersonalData] = useState({
    gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth?.split('T')[0] || '',
  });

  const [professionalData, setProfessionalData] = useState({
    specialization: doctorProfile?.specialization || '',
    qualification: doctorProfile?.qualification || '',
    experience: doctorProfile?.experience || '',
  });

  const [consultationData, setConsultationData] = useState({
    consultationMode: doctorProfile?.consultationMode || 'both',
    consultationFee: doctorProfile?.consultationFee || '',
  });

  const [bio, setBio] = useState(doctorProfile?.bio || '');

  const handlePhotoChange = async (e) => {
    try {
      setPhotoLoading(true);
      const formData = new FormData();
      formData.append('profilePicture', e.target.files[0]);
      await updateProfilePhoto(formData);
      toast.success('Profile photo updated');
      window.location.reload();
    } catch {
      toast.error('Failed to update photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handlePersonalSave = async () => {
    try {
      setPersonalLoading(true);
      await updateProfile(personalData);
      toast.success('Personal information updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setPersonalLoading(false);
    }
  };

  const handleProfessionalSave = async () => {
    try {
      setProfessionalLoading(true);
      await updateDoctorProfile(professionalData);
      toast.success('Professional information updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setProfessionalLoading(false);
    }
  };

  const handleConsultationSave = async () => {
    try {
      setConsultationLoading(true);
      await updateDoctorProfile(consultationData);
      toast.success('Consultation settings updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setConsultationLoading(false);
    }
  };

  const handleBioSave = async () => {
    try {
      setBioLoading(true);
      await updateDoctorProfile({ bio });
      toast.success('Bio updated');
    } catch {
      toast.error('Failed to update bio');
    } finally {
      setBioLoading(false);
    }
  };

  const approvalStatus = doctorProfile?.approvalStatus;
  const statusStyles = {
    approved: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      dot: '#16a34a',
      label: 'Approved',
    },
    pending: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      dot: '#d97706',
      label: 'Pending Review',
    },
    reject: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      dot: '#dc2626',
      label: 'Rejected',
    },
  };
  const statusStyle = statusStyles[approvalStatus] || statusStyles.pending;

  return (
    <DashboardLayout>
      <style>{styles}</style>
      <div
        className="min-h-screen p-4 md:p-6"
        style={{ background: '#f0f5fb' }}
      >
        <div className="mx-auto max-w-7xl space-y-4">
          {/* === HERO SECTION === */}
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
            {/* Spinning ring — desktop only */}
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

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5 p-5 md:p-8">
              {/* Left */}
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
                  Doctor Portal
                </div>

                {/* Identity */}
                <div className="flex items-center gap-4">
                  <DoctorAvatar
                    src={user?.profilePicture}
                    name={user?.fullName}
                    size="xl"
                  />
                  <div>
                    <h1 className="sora text-xl md:text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                      {user?.fullName}
                    </h1>
                    <p
                      className="mt-1 text-sm text-teal-100"
                      style={{ opacity: 0.85 }}
                    >
                      {doctorProfile?.specialization || 'Doctor'} ·{' '}
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Stat glass chips */}
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {[
                    {
                      label: 'Experience',
                      value: doctorProfile?.experience
                        ? `${doctorProfile.experience} yrs`
                        : '—',
                    },
                    {
                      label: 'Rating',
                      value: doctorProfile?.averageRating
                        ? `★ ${doctorProfile.averageRating}`
                        : '—',
                    },
                    {
                      label: 'Reviews',
                      value: doctorProfile?.totalReviews ?? 0,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="stat-glass rounded-2xl px-3.5 py-2 text-center min-w-[72px]"
                    >
                      <p className="sora text-base font-bold text-white">
                        {s.value}
                      </p>
                      <p className="text-xs text-teal-200 font-medium">
                        {s.label}
                      </p>
                    </div>
                  ))}

                  {/* Change Photo button — inside hero on mobile */}
                  <label
                    className="btn-act inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white/20 border border-white/25 px-4 py-2 text-sm font-semibold text-white"
                    style={{ alignSelf: 'center' }}
                  >
                    {photoLoading ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
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
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Change Photo
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Right illustration — hidden on xs */}
              <div className="hidden sm:block h-48 w-52 md:h-56 md:w-60 lg:h-64 lg:w-72 flex-shrink-0 relative">
                <HeroIllustration />
              </div>
            </div>
          </div>

          {/* === PERSONAL INFORMATION === */}
          <SectionCard
            title="Personal Information"
            subtitle="Update your personal details"
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Gender">
                <select
                  value={personalData.gender}
                  onChange={(e) =>
                    setPersonalData((p) => ({ ...p, gender: e.target.value }))
                  }
                  className="rx-input"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </FormField>
              <FormField label="Date of Birth">
                <input
                  type="date"
                  value={personalData.dateOfBirth}
                  onChange={(e) =>
                    setPersonalData((p) => ({
                      ...p,
                      dateOfBirth: e.target.value,
                    }))
                  }
                  className="rx-input"
                />
              </FormField>
            </div>
            <SaveButton
              loading={personalLoading}
              label="Save Personal Info"
              loadingLabel="Saving…"
              onClick={handlePersonalSave}
            />
          </SectionCard>

          {/* === PROFESSIONAL INFORMATION === */}
          <SectionCard
            title="Professional Information"
            subtitle="Update your professional details"
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Department">
                <input
                  value={doctorProfile?.department?.name || ''}
                  disabled
                  className="rx-input"
                />
              </FormField>
              <FormField label="Specialization">
                <input
                  value={professionalData.specialization}
                  onChange={(e) =>
                    setProfessionalData((p) => ({
                      ...p,
                      specialization: e.target.value,
                    }))
                  }
                  className="rx-input"
                  placeholder="e.g. Cardiology"
                />
              </FormField>
              <FormField label="Qualification">
                <input
                  value={professionalData.qualification}
                  onChange={(e) =>
                    setProfessionalData((p) => ({
                      ...p,
                      qualification: e.target.value,
                    }))
                  }
                  className="rx-input"
                  placeholder="e.g. MBBS, MD"
                />
              </FormField>
              <FormField label="Experience (Years)">
                <input
                  type="number"
                  value={professionalData.experience}
                  onChange={(e) =>
                    setProfessionalData((p) => ({
                      ...p,
                      experience: e.target.value,
                    }))
                  }
                  className="rx-input"
                  placeholder="e.g. 5"
                />
              </FormField>
            </div>
            <SaveButton
              loading={professionalLoading}
              label="Save Professional Info"
              loadingLabel="Saving…"
              onClick={handleProfessionalSave}
            />
          </SectionCard>

          {/* === CONSULTATION SETTINGS === */}
          <SectionCard
            title="Consultation Settings"
            subtitle="Set your availability and pricing"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Consultation Mode">
                <select
                  value={consultationData.consultationMode}
                  onChange={(e) =>
                    setConsultationData((p) => ({
                      ...p,
                      consultationMode: e.target.value,
                    }))
                  }
                  className="rx-input"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="both">Both</option>
                </select>
              </FormField>
              <FormField label="Consultation Fee (₹)">
                <input
                  type="number"
                  value={consultationData.consultationFee}
                  onChange={(e) =>
                    setConsultationData((p) => ({
                      ...p,
                      consultationFee: e.target.value,
                    }))
                  }
                  className="rx-input"
                  placeholder="e.g. 500"
                />
              </FormField>
            </div>
            <SaveButton
              loading={consultationLoading}
              label="Save Consultation Settings"
              loadingLabel="Saving…"
              onClick={handleConsultationSave}
            />
          </SectionCard>

          {/* === PROFESSIONAL BIO === */}
          <SectionCard
            title="Professional Bio"
            subtitle="Tell patients about yourself"
            delay="d4"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            }
          >
            <textarea
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio about your expertise and approach to patient care…"
              className="rx-input resize-none"
            />
            <SaveButton
              loading={bioLoading}
              label="Save Bio"
              loadingLabel="Saving…"
              onClick={handleBioSave}
            />
          </SectionCard>

          {/* === BOTTOM ROW: Verification + Security + Stats === */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 anim-fade-up d5">
            {/* Verification Status */}
            <div className="section-card overflow-hidden">
              <div
                className="h-1 w-full"
                style={{
                  background:
                    'linear-gradient(to right, #14b8a655, transparent)',
                }}
              />
              <div className="p-5">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h2 className="sora text-sm font-bold text-slate-800">
                    Verification
                  </h2>
                </div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: statusStyle.dot }}
                  />
                  {statusStyle.label}
                </span>
                {approvalStatus === 'reject' && (
                  <div className="mt-3 rounded-2xl bg-red-50 p-3">
                    <p className="text-xs font-semibold text-red-700">
                      Rejection Reason
                    </p>
                    <p className="mt-1 text-xs text-red-600">
                      {doctorProfile?.rejectionReason || 'No reason provided'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Security */}
            <div className="section-card overflow-hidden">
              <div
                className="h-1 w-full"
                style={{
                  background:
                    'linear-gradient(to right, #14b8a655, transparent)',
                }}
              />
              <div className="p-5 flex flex-col h-full">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="sora text-sm font-bold text-slate-800">
                      Account Security
                    </h2>
                    <p className="text-xs text-slate-500">
                      Manage your password
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(ROUTES.CHANGE_PASSWORD)}
                  className="btn-dark mt-auto w-full rounded-2xl bg-slate-800 py-2.5 text-sm font-semibold text-white"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="section-card overflow-hidden sm:col-span-2 lg:col-span-1">
              <div
                className="h-1 w-full"
                style={{
                  background:
                    'linear-gradient(to right, #14b8a655, transparent)',
                }}
              />
              <div className="p-5">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                  <h2 className="sora text-sm font-bold text-slate-800">
                    Statistics
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-teal-50 p-3 text-center">
                    <p className="text-xs text-slate-500 font-medium">
                      Avg Rating
                    </p>
                    <p className="sora mt-1 text-2xl font-bold text-teal-700">
                      {doctorProfile?.averageRating || 0}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-cyan-50 p-3 text-center">
                    <p className="text-xs text-slate-500 font-medium">
                      Reviews
                    </p>
                    <p className="sora mt-1 text-2xl font-bold text-cyan-700">
                      {doctorProfile?.totalReviews || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorSettingsPage;
