/*
 * DoctorPrescriptionsPage.jsx — AlphaCare Design System
 * Sections:
 *  1. Styles
 *  2. PatientAvatar (avatar with fallback)
 *  3. PrescriptionIllustration (hero SVG)
 *  4. DoctorPrescriptionsPage
 *     4a. Loading Skeleton
 *     4b. Hero
 *     4c. Search & Filter Bar
 *     4d. Prescriptions Grid
 *     4e. Prescription Detail Modal
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout.jsx';

import { getMyPrescriptions } from '../../api/prescription.api.js';

/* === STYLES === */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

  .rx-root * { font-family: 'DM Sans', sans-serif; }
  .rx-root h1, .rx-root h2, .rx-root h3, .rx-root h4 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes float1 { 0%,100%{transform:translateY(0) rotate(-1.5deg)} 50%{transform:translateY(-12px) rotate(1.5deg)} }
  @keyframes float2 { 0%,100%{transform:translateY(0) rotate(1deg)} 50%{transform:translateY(-8px) rotate(-1deg)} }
  @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.6)} }
  @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes modalIn { from{opacity:0;transform:scale(.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes cardIn { from{opacity:0;transform:translateY(16px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }

  .float-1 { animation:float1 5.5s ease-in-out infinite; }
  .float-2 { animation:float2 4.8s ease-in-out infinite .7s; }
  .float-3 { animation:float3 6.2s ease-in-out infinite 1.3s; }
  .pulse-dot { animation:pulseDot 2s ease-in-out infinite; }
  .spin-slow { animation:spinSlow 22s linear infinite; }
  .anim-fade-up { animation:fadeUp .55s ease both; }
  .d1{animation-delay:.06s} .d2{animation-delay:.12s} .d3{animation-delay:.18s}
  .d4{animation-delay:.24s} .d5{animation-delay:.30s}
  .modal-panel { animation:modalIn .3s ease both; }
  .card-in { animation:cardIn .55s ease both; }

  .glass-panel {
    background:rgba(255,255,255,0.6);
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
    border:1px solid rgba(255,255,255,0.75);
  }
  .shimmer-bg {
    background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
    background-size:200% 100%;
    animation:shimmer 1.4s infinite;
  }
  .hero-glass {
    background:rgba(255,255,255,0.12);
    backdrop-filter:blur(10px);
    -webkit-backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,0.2);
  }
  .btn-act {
    transition: transform .18s ease, box-shadow .18s ease;
  }
  .btn-act:hover:not(:disabled) { transform:translateY(-2px); }
  .btn-act:disabled { opacity:0.6; cursor:not-allowed; }

  .rx-input {
    border-radius:1rem;
    border:1px solid #e2e8f0;
    background:#f8fafc;
    padding:0.75rem 1rem;
    width:100%;
    font-family:'DM Sans',sans-serif;
    transition: border-color .2s, box-shadow .2s, background .2s;
    outline:none;
  }
  .rx-input:focus {
    border-color:#2dd4bf;
    box-shadow:0 0 0 3px rgba(20,184,166,.15);
    background:white;
  }

  .info-tile {
    background:#f8fafc;
    border:1px solid #e2e8f0;
    border-radius:1rem;
    padding:0.65rem 0.9rem;
  }

  .rx-card {
    background:white;
    border:1px solid #e2e8f0;
    border-radius:1.5rem;
    box-shadow:0 1px 4px rgba(0,0,0,.05);
    transition: transform .22s ease, box-shadow .22s ease;
    cursor:pointer;
  }
  .rx-card:hover {
    transform:translateY(-5px);
    box-shadow:0 12px 32px rgba(15,118,110,.10);
  }

  .filter-chip {
    border-radius:9999px;
    border:1px solid #e2e8f0;
    padding:0.375rem 1rem;
    font-size:0.875rem;
    font-weight:600;
    cursor:pointer;
    transition: transform .15s ease, background .15s, border-color .15s, color .15s, box-shadow .15s;
    white-space:nowrap;
  }
  .filter-chip:hover { transform:translateY(-1px); border-color:#99f6e4; color:#0f766e; }
  .filter-chip.active {
    background:#0d9488;
    color:white;
    border-color:#0d9488;
    box-shadow:0 0 0 3px rgba(13,148,136,.2);
    transform:translateY(-1px);
  }
`;

/* === AVATAR === */
const palette = [
  { bg: '#ccfbf1', text: '#0f766e' },
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#e0e7ff', text: '#4338ca' },
  { bg: '#ede9fe', text: '#6d28d9' },
  { bg: '#ffedd5', text: '#c2410c' },
];

const PatientAvatar = ({ src, name, index = 0, size = 44 }) => {
  const [err, setErr] = useState(false);
  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';
  const { bg, text } = palette[index % palette.length];
  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        style={{
          width: size,
          height: size,
          borderRadius: '0.75rem',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '0.75rem',
        background: bg,
        color: text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Sora, sans-serif',
        fontWeight: 700,
        fontSize: size * 0.33,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

/* === HERO ILLUSTRATION === */
const PrescriptionIllustration = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <svg
      className="spin-slow absolute inset-0 w-full h-full opacity-20"
      viewBox="0 0 320 280"
      fill="none"
    >
      <circle
        cx="160"
        cy="140"
        r="128"
        stroke="white"
        strokeWidth="1.5"
        strokeDasharray="8 6"
      />
    </svg>

    <svg
      className="float-1 absolute inset-0 w-full h-full"
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="rxHead" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="medRow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ccfbf1" />
          <stop offset="100%" stopColor="#cffafe" />
        </linearGradient>
      </defs>
      {/* Rx card */}
      <rect
        x="68"
        y="28"
        width="192"
        height="228"
        rx="20"
        fill="white"
        opacity="0.95"
      />
      {/* Header */}
      <rect x="68" y="28" width="192" height="56" rx="20" fill="url(#rxHead)" />
      <rect x="68" y="60" width="192" height="24" fill="url(#rxHead)" />
      {/* Rx symbol */}
      <text
        x="98"
        y="64"
        fill="white"
        fontSize="22"
        fontWeight="800"
        fontFamily="Sora,sans-serif"
        opacity="0.9"
      >
        Rx
      </text>
      <text
        x="148"
        y="58"
        fill="white"
        fontSize="12"
        fontWeight="700"
        fontFamily="Sora,sans-serif"
      >
        My Prescriptions
      </text>
      <text
        x="148"
        y="74"
        fill="rgba(255,255,255,.7)"
        fontSize="9"
        fontFamily="DM Sans,sans-serif"
      >
        Doctor Records
      </text>
      {/* Divider */}
      <rect x="84" y="98" width="160" height="1" fill="#e2e8f0" />
      {/* Medicine rows */}
      {[
        ['Paracetamol', '500mg'],
        ['Amoxicillin', '250mg'],
        ['Ibuprofen', '400mg'],
        ['Cefixime', '200mg'],
      ].map(([name, dose], i) => (
        <g key={name}>
          <rect
            x="84"
            y={106 + i * 30}
            width="152"
            height="22"
            rx="6"
            fill={i % 2 === 0 ? 'url(#medRow)' : '#f8fafc'}
          />
          <circle
            cx="96"
            cy={117 + i * 30}
            r="4"
            fill={i % 2 === 0 ? '#0d9488' : '#94a3b8'}
          />
          <text
            x="106"
            y={120 + i * 30}
            fill="#0f172a"
            fontSize="9"
            fontWeight="600"
            fontFamily="DM Sans,sans-serif"
          >
            {name}
          </text>
          <text
            x="198"
            y={120 + i * 30}
            fill="#64748b"
            fontSize="8"
            fontFamily="DM Sans,sans-serif"
          >
            {dose}
          </text>
        </g>
      ))}
      {/* Follow up row */}
      <rect x="84" y="228" width="152" height="20" rx="6" fill="#f0fdfa" />
      <text
        x="96"
        y="241"
        fill="#0f766e"
        fontSize="8"
        fontWeight="700"
        fontFamily="DM Sans,sans-serif"
      >
        Follow-up: Jun 12, 2026
      </text>
      {/* Cross decoration */}
      <rect
        x="232"
        y="34"
        width="7"
        height="18"
        rx="2"
        fill="rgba(255,255,255,.4)"
      />
      <rect
        x="226"
        y="40"
        width="19"
        height="7"
        rx="2"
        fill="rgba(255,255,255,.4)"
      />
    </svg>

    {/* Badge 1 */}
    <svg
      className="float-2 absolute"
      style={{ top: '6%', right: '0%', width: 100, height: 34 }}
      viewBox="0 0 100 34"
      fill="none"
    >
      <rect width="100" height="34" rx="10" fill="white" opacity="0.95" />
      <circle cx="14" cy="17" r="5" fill="#14b8a6" className="pulse-dot" />
      <text
        x="24"
        y="21"
        fill="#0f172a"
        fontSize="10"
        fontWeight="700"
        fontFamily="Sora,sans-serif"
      >
        8 Records
      </text>
    </svg>

    {/* Badge 2 */}
    <svg
      className="float-3 absolute"
      style={{ bottom: '12%', left: '0%', width: 100, height: 34 }}
      viewBox="0 0 100 34"
      fill="none"
    >
      <rect width="100" height="34" rx="10" fill="#0f766e" opacity="0.92" />
      <text
        x="12"
        y="21"
        fill="white"
        fontSize="10"
        fontWeight="700"
        fontFamily="Sora,sans-serif"
      >
        Rx Issued ✓
      </text>
    </svg>

    {/* Badge 3 */}
    <svg
      className="float-1 absolute"
      style={{ bottom: '30%', right: '0%', width: 90, height: 34 }}
      viewBox="0 0 90 34"
      fill="none"
    >
      <rect width="90" height="34" rx="10" fill="white" opacity="0.95" />
      <text
        x="10"
        y="21"
        fill="#0f766e"
        fontSize="10"
        fontWeight="700"
        fontFamily="Sora,sans-serif"
      >
        Follow-up 📅
      </text>
    </svg>
  </div>
);

/* === MAIN COMPONENT === */
const DoctorPrescriptionsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [search, setSearch] = useState('');

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await getMyPrescriptions();
      setPrescriptions(res.data.prescriptions || []);
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

  const filtered = prescriptions.filter((rx) => {
    const q = search.toLowerCase();
    return (
      rx.patientId?.fullName?.toLowerCase().includes(q) ||
      rx.diagnosis?.toLowerCase().includes(q) ||
      rx.medicines?.some((m) => m.name?.toLowerCase().includes(q))
    );
  });

  /* === LOADING SKELETON === */
  if (loading) {
    return (
      <DashboardLayout>
        <style>{styles}</style>
        <div className="rx-root min-h-screen bg-[#f0f5fb] p-6 space-y-6">
          <div className="shimmer-bg rounded-3xl h-56" />
          <div className="shimmer-bg rounded-2xl h-14" />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white border border-slate-200 p-5 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="shimmer-bg w-11 h-11 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="shimmer-bg h-4 w-32 rounded-full" />
                    <div className="shimmer-bg h-3 w-20 rounded-full" />
                  </div>
                </div>
                <div className="shimmer-bg h-10 rounded-2xl" />
                <div className="shimmer-bg h-16 rounded-2xl" />
                <div className="shimmer-bg h-9 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <style>{styles}</style>
      <div className="rx-root min-h-screen bg-[#f0f5fb] p-6 space-y-6">
        {/* === HERO === */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 px-8 py-10 shadow-xl anim-fade-up">
          {/* Grid texture */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.04,
              backgroundImage:
                'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          {/* Glow orbs */}
          <div
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-5"
            style={{ background: 'white' }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-5"
            style={{ background: 'white' }}
          />
          {/* Spinning ring */}
          <svg
            className="spin-slow absolute top-4 left-4 opacity-20 hidden lg:block"
            width="90"
            height="90"
            viewBox="0 0 90 90"
            fill="none"
          >
            <circle
              cx="45"
              cy="45"
              r="40"
              stroke="white"
              strokeWidth="1.5"
              strokeDasharray="7 5"
            />
          </svg>

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 max-w-xl">
              <span className="inline-block rounded-full border border-teal-300/50 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-teal-100 mb-4">
                My Prescriptions
              </span>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                Prescription <span className="text-cyan-200">Records</span>
              </h1>
              <p className="mt-3 text-teal-100/85 text-base max-w-md">
                View and manage all prescriptions you have issued across
                consultations.
              </p>

              {/* Stat cards */}
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { label: 'Total Prescriptions', value: prescriptions.length },
                  {
                    label: 'Unique Patients',
                    value: new Set(prescriptions.map((rx) => rx.patientId?._id))
                      .size,
                  },
                  {
                    label: 'This Month',
                    value: prescriptions.filter((rx) => {
                      const d = new Date(rx.createdAt);
                      const now = new Date();
                      return (
                        d.getMonth() === now.getMonth() &&
                        d.getFullYear() === now.getFullYear()
                      );
                    }).length,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="hero-glass rounded-2xl px-5 py-3 min-w-[100px]"
                  >
                    <p className="text-2xl font-extrabold text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-teal-200 font-medium mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden lg:flex flex-shrink-0 h-64 w-72 items-center justify-center">
              <PrescriptionIllustration />
            </div>
          </div>
        </section>

        {/* === SEARCH BAR === */}
        <div className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3 anim-fade-up d1">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            className="text-teal-500 flex-shrink-0"
          >
            <circle cx="8" cy="8" r="5.5" stroke="#0d9488" strokeWidth="1.5" />
            <path
              d="M12.5 12.5L16 16"
              stroke="#0d9488"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, diagnosis or medicine…"
            className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-slate-400 hover:text-slate-600 transition text-xs font-bold"
            >
              ✕ Clear
            </button>
          )}
          <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700">
            {filtered.length} results
          </span>
        </div>

        {/* === PRESCRIPTION GRID === */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              className="mx-auto mb-4 float-1"
            >
              <rect x="8" y="6" width="44" height="50" rx="8" fill="#ccfbf1" />
              <rect x="8" y="6" width="44" height="16" rx="8" fill="#0d9488" />
              <text
                x="18"
                y="20"
                fill="white"
                fontSize="14"
                fontWeight="800"
                fontFamily="Sora,sans-serif"
              >
                Rx
              </text>
              <rect x="18" y="32" width="24" height="4" rx="2" fill="#99f6e4" />
              <rect x="18" y="40" width="16" height="4" rx="2" fill="#ccfbf1" />
            </svg>
            <h3 className="text-xl font-bold text-slate-900">
              No Prescriptions Found
            </h3>
            <p className="mt-2 text-slate-500 text-sm">
              {search
                ? 'Try adjusting your search.'
                : 'Prescriptions you issue will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((rx, idx) => {
              const patient = rx.patientId;
              const appt = rx.appointmentId;
              const followUp = rx.followUpDate
                ? new Date(rx.followUpDate)
                : null;
              const isFollowUpSoon =
                followUp && (followUp - new Date()) / 86400000 <= 7;

              return (
                <div
                  key={rx._id}
                  className={`rx-card card-in p-5 d${Math.min((idx % 5) + 1, 5)}`}
                  onClick={() => navigate(`/doctor/prescriptions/${rx._id}`)}
                >
                  {/* Patient row */}
                  <div className="flex items-center gap-3 mb-4">
                    <PatientAvatar
                      src={patient?.profilePicture}
                      name={patient?.fullName}
                      index={idx}
                      size={44}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {patient?.fullName || '—'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {patient?.email || '—'}
                      </p>
                    </div>
                    {isFollowUpSoon && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 flex-shrink-0">
                        Soon
                      </span>
                    )}
                  </div>

                  {/* Tinted strip */}
                  <div
                    className="rounded-xl px-3 py-2 mb-3"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(204,251,241,0.6), transparent)',
                    }}
                  >
                    <p className="text-xs text-teal-600 font-medium">
                      Diagnosis
                    </p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5 capitalize">
                      {rx.diagnosis || '—'}
                    </p>
                  </div>

                  {/* Medicines preview */}
                  <div className="space-y-1.5 mb-4">
                    {rx.medicines?.slice(0, 2).map((med, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {med.name}
                        </p>
                        <span className="ml-auto text-xs text-slate-500 flex-shrink-0">
                          {med.dosage}
                        </span>
                      </div>
                    ))}
                    {rx.medicines?.length > 2 && (
                      <p className="text-xs text-teal-600 font-semibold px-3">
                        +{rx.medicines.length - 2} more medicine
                        {rx.medicines.length - 2 > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400">
                        Appointment Date
                      </p>
                      <p className="text-xs font-bold text-slate-700">
                        {appt?.appointmentDate
                          ? new Date(appt.appointmentDate).toLocaleDateString()
                          : '—'}
                        {appt?.timeSlot ? ` · ${appt.timeSlot}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                      <span>View</span>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 5h6M5 2l3 3-3 3"
                          stroke="#0f766e"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorPrescriptionsPage;
