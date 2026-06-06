/*
 * DoctorAppointmentDetailsPage.jsx — AlphaCare Design System
 * Sections:
 *  1. Styles
 *  2. PatientAvatar (avatar with fallback)
 *  3. AppointmentIllustration (hero SVG)
 *  4. DoctorAppointmentDetailsPage
 *     4a. Loading Skeleton
 *     4b. Hero
 *     4c. Main Grid — Left (Patient Card, Appointment Card)
 *     4d. Main Grid — Right (Actions Card, Meeting Card, Prescription Card)
 *     4e. Cancel Modal
 *     4f. Create Prescription Modal
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout.jsx';

import {
  getAppointmentById,
  confirmAppointment,
  rejectAppointment,
  cancelAppointment,
  completeAppointment,
} from '../../api/appointment.api.js';

import {
  createPrescription,
  getPrescriptionByAppointment,
  downloadPrescription,
} from '../../api/prescription.api.js';

/* === STYLES === */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

  .appt-root * { font-family: 'DM Sans', sans-serif; }
  .appt-root h1, .appt-root h2, .appt-root h3, .appt-root h4 { font-family: 'Sora', sans-serif; }

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
    padding:0.75rem 1rem;
  }

  .section-card {
    background:white;
    border:1px solid #e2e8f0;
    border-radius:1.5rem;
    box-shadow:0 1px 4px rgba(0,0,0,.05);
    transition: transform .22s ease, box-shadow .22s ease;
  }
  .section-card:hover {
    transform:translateY(-3px);
    box-shadow:0 8px 28px rgba(15,118,110,.08);
  }
`;

/* === PATIENT AVATAR === */
const palette = [
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#e0e7ff', text: '#4338ca' },
  { bg: '#ccfbf1', text: '#0f766e' },
  { bg: '#ede9fe', text: '#6d28d9' },
  { bg: '#ffedd5', text: '#c2410c' },
];

const PatientAvatar = ({ src, name, index = 0, size = 96 }) => {
  const [imgError, setImgError] = useState(false);
  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';
  const { bg, text } = palette[index % palette.length];

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        style={{
          width: size,
          height: size,
          borderRadius: '1rem',
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
        borderRadius: '1rem',
        background: bg,
        color: text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Sora, sans-serif',
        fontWeight: 700,
        fontSize: size * 0.3,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

/* === APPOINTMENT ILLUSTRATION === */
const AppointmentIllustration = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    {/* Spinning ring */}
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

    {/* Main clipboard widget */}
    <svg
      className="float-1 absolute inset-0 w-full h-full"
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="clipHead" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="rxRow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ccfbf1" />
          <stop offset="100%" stopColor="#cffafe" />
        </linearGradient>
      </defs>
      {/* Card body */}
      <rect
        x="70"
        y="28"
        width="188"
        height="224"
        rx="20"
        fill="white"
        opacity="0.95"
      />
      {/* Header */}
      <rect
        x="70"
        y="28"
        width="188"
        height="54"
        rx="20"
        fill="url(#clipHead)"
      />
      <rect x="70" y="60" width="188" height="22" fill="url(#clipHead)" />
      {/* Clipboard clip */}
      <rect
        x="140"
        y="20"
        width="48"
        height="18"
        rx="6"
        fill="white"
        opacity="0.9"
      />
      <rect x="156" y="15" width="16" height="12" rx="4" fill="#99f6e4" />
      <text
        x="164"
        y="57"
        textAnchor="middle"
        fill="white"
        fontSize="12"
        fontWeight="700"
        fontFamily="Sora,sans-serif"
      >
        Consultation
      </text>
      <text
        x="164"
        y="72"
        textAnchor="middle"
        fill="rgba(255,255,255,.7)"
        fontSize="9"
        fontFamily="DM Sans,sans-serif"
      >
        Appointment Details
      </text>
      {/* Info rows */}
      {[
        ['Patient', '#2dd4bf'],
        ['Date', '#38bdf8'],
        ['Status', '#a78bfa'],
        ['Type', '#34d399'],
        ['Slot', '#f472b6'],
      ].map(([label, color], i) => (
        <g key={label}>
          <rect
            x="86"
            y={100 + i * 28}
            width="156"
            height="20"
            rx="6"
            fill={i % 2 === 0 ? 'url(#rxRow)' : '#f8fafc'}
          />
          <text
            x="98"
            y={114 + i * 28}
            fill="#0f766e"
            fontSize="9"
            fontWeight="600"
            fontFamily="DM Sans,sans-serif"
          >
            {label}
          </text>
          <rect
            x="148"
            y={105 + i * 28}
            width="56"
            height="10"
            rx="3"
            fill={color}
            opacity="0.4"
          />
          <circle cx="82" cy={109 + i * 28} r="3" fill={color} />
        </g>
      ))}
      {/* Medical cross */}
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

    {/* Badge 1 — Confirmed */}
    <svg
      className="float-2 absolute"
      style={{ top: '8%', right: '0%', width: 96, height: 34 }}
      viewBox="0 0 96 34"
      fill="none"
    >
      <rect width="96" height="34" rx="10" fill="white" opacity="0.95" />
      <circle cx="14" cy="17" r="5" fill="#14b8a6" className="pulse-dot" />
      <text
        x="24"
        y="21"
        fill="#0f172a"
        fontSize="10"
        fontWeight="700"
        fontFamily="Sora,sans-serif"
      >
        Confirmed
      </text>
    </svg>

    {/* Badge 2 — Online */}
    <svg
      className="float-3 absolute"
      style={{ bottom: '14%', left: '0%', width: 88, height: 34 }}
      viewBox="0 0 88 34"
      fill="none"
    >
      <rect width="88" height="34" rx="10" fill="#0f766e" opacity="0.9" />
      <text
        x="12"
        y="21"
        fill="white"
        fontSize="10"
        fontWeight="700"
        fontFamily="Sora,sans-serif"
      >
        🎥 Online
      </text>
    </svg>

    {/* Badge 3 — Rx */}
    <svg
      className="float-1 absolute"
      style={{ bottom: '30%', right: '0%', width: 76, height: 34 }}
      viewBox="0 0 76 34"
      fill="none"
    >
      <rect width="76" height="34" rx="10" fill="white" opacity="0.95" />
      <text
        x="10"
        y="21"
        fill="#0f766e"
        fontSize="11"
        fontWeight="700"
        fontFamily="Sora,sans-serif"
      >
        Rx ✓
      </text>
    </svg>
  </div>
);

/* === STATUS CONFIG === */
const statusConfig = {
  pending: {
    color: '#b45309',
    bg: '#fef3c7',
    border: '#fde68a',
    dot: '#f59e0b',
    label: 'Pending',
  },
  confirmed: {
    color: '#0f766e',
    bg: '#ccfbf1',
    border: '#99f6e4',
    dot: '#14b8a6',
    label: 'Confirmed',
  },
  completed: {
    color: '#166534',
    bg: '#dcfce7',
    border: '#bbf7d0',
    dot: '#22c55e',
    label: 'Completed',
  },
  cancelled: {
    color: '#b91c1c',
    bg: '#fee2e2',
    border: '#fecaca',
    dot: '#ef4444',
    label: 'Cancelled',
  },
  rejected: {
    color: '#be123c',
    bg: '#ffe4e6',
    border: '#fecdd3',
    dot: '#f43f5e',
    label: 'Rejected',
  },
};

/* === MAIN COMPONENT === */
const DoctorAppointmentDetailsPage = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '' },
  ]);

  const [confirmingAppt, setConfirmingAppt] = useState(false);
  const [rejectingAppt, setRejectingAppt] = useState(false);
  const [completingAppt, setCompletingAppt] = useState(false);
  const [cancellingAppt, setCancellingAppt] = useState(false);
  const [creatingRx, setCreatingRx] = useState(false);

  const fetchAppointment = async () => {
    try {
      const response = await getAppointmentById(id);
      setAppointment(response.data.appointment);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to load appointment',
      );
    }
  };

  const fetchPrescription = async () => {
    try {
      console.log('appointment page id:', id);

      const response = await getPrescriptionByAppointment(id);

      console.log(response);
      console.log(response?.data);
      console.log(response?.data?.prescription);
      console.log('prescription response:', response.data);

      setPrescription(response.data.prescription);
    } catch (err) {
      console.log(err?.response?.data);
      setPrescription(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAppointment();
      await fetchPrescription();
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleConfirm = async () => {
    setConfirmingAppt(true);
    try {
      await confirmAppointment(appointment._id);
      toast.success('Appointment confirmed');
      fetchAppointment();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed');
    } finally {
      setConfirmingAppt(false);
    }
  };

  const handleReject = async () => {
    setRejectingAppt(true);
    try {
      await rejectAppointment(appointment._id);
      toast.success('Appointment rejected');
      fetchAppointment();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed');
    } finally {
      setRejectingAppt(false);
    }
  };

  const handleComplete = async () => {
    setCompletingAppt(true);
    try {
      await completeAppointment(appointment._id);
      toast.success('Appointment completed');
      fetchAppointment();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed');
    } finally {
      setCompletingAppt(false);
    }
  };

  const handleCancel = async () => {
    setCancellingAppt(true);
    try {
      await cancelAppointment(appointment._id, { cancelReason });
      toast.success('Appointment cancelled');
      setShowCancelModal(false);
      fetchAppointment();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed');
    } finally {
      setCancellingAppt(false);
    }
  };

  const addMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      { name: '', dosage: '', frequency: '', duration: '' },
    ]);
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleCreatePrescription = async () => {
    setCreatingRx(true);
    try {
      await createPrescription({
        appointmentId: appointment._id,
        diagnosis,
        medicines,
        notes,
        followUpDate,
      });
      toast.success('Prescription created successfully');
      setShowPrescriptionModal(false);
      setDiagnosis('');
      setNotes('');
      setFollowUpDate('');
      setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }]);
      await fetchPrescription();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to create prescription',
      );
    } finally {
      setCreatingRx(false);
    }
  };

  /* === LOADING SKELETON === */
  if (loading) {
    return (
      <DashboardLayout>
        <style>{styles}</style>
        <div className="appt-root min-h-screen bg-[#f0f5fb] p-6 space-y-6">
          <div className="shimmer-bg rounded-3xl h-56" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="shimmer-bg rounded-3xl h-44" />
              <div className="shimmer-bg rounded-3xl h-52" />
            </div>
            <div className="space-y-6">
              <div className="shimmer-bg rounded-3xl h-48" />
              <div className="shimmer-bg rounded-3xl h-40" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const patient = appointment?.patientId;
  const status = appointment?.status;
  const sc = statusConfig[status] || statusConfig.pending;

  return (
    <DashboardLayout>
      <style>{styles}</style>
      <div className="appt-root min-h-screen bg-[#f0f5fb] p-6 space-y-6">
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
          {/* Spinning ring (desktop) */}
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
            {/* Text */}
            <div className="flex-1 max-w-xl">
              <span className="inline-block rounded-full border border-teal-300/50 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-teal-100 mb-4">
                Appointment Details
              </span>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                Consultation{' '}
                <span className="text-cyan-200">
                  #{appointment?._id?.slice(-8)}
                </span>
              </h1>
              <p className="mt-3 text-teal-100/85 text-base max-w-md">
                Manage consultation status, patient records, and prescriptions
                from one place.
              </p>

              {/* Hero stat cards */}
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { label: 'Status', value: sc.label },
                  {
                    label: 'Type',
                    value: appointment?.consultationType || '—',
                  },
                  {
                    label: 'Date',
                    value: new Date(
                      appointment?.appointmentDate,
                    ).toLocaleDateString(),
                  },
                  { label: 'Time Slot', value: appointment?.timeSlot || '—' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="hero-glass rounded-2xl px-4 py-3 min-w-[90px]"
                  >
                    <p className="text-[11px] text-teal-200 font-medium mb-0.5">
                      {stat.label}
                    </p>
                    <p className="text-sm font-bold text-white capitalize">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden lg:flex flex-shrink-0 h-64 w-72 items-center justify-center">
              <AppointmentIllustration />
            </div>
          </div>
        </section>

        {/* === MAIN GRID === */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* === LEFT COLUMN === */}
          <div className="space-y-6 lg:col-span-2">
            {/* PATIENT CARD */}
            <div className="section-card card-in d1 p-6">
              <h2 className="mb-5 text-lg font-bold text-slate-900">
                Patient Information
              </h2>
              <div className="flex flex-col gap-5 md:flex-row">
                <PatientAvatar
                  src={patient?.profilePicture}
                  name={patient?.fullName}
                  index={0}
                  size={88}
                />
                <div className="grid flex-1 gap-3 md:grid-cols-2">
                  {[
                    { label: 'Full Name', value: patient?.fullName },
                    { label: 'Gender', value: patient?.gender || '—' },
                    { label: 'Email', value: patient?.email },
                    { label: 'Phone', value: patient?.phoneNumber },
                  ].map(({ label, value }) => (
                    <div key={label} className="info-tile">
                      <p className="text-xs text-slate-500 font-medium">
                        {label}
                      </p>
                      <p className="font-semibold text-slate-900 mt-0.5 break-all capitalize">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* APPOINTMENT INFO CARD */}
            <div className="section-card card-in d2 p-6">
              {/* Status tint strip */}
              <div
                style={{
                  background: `linear-gradient(90deg, ${sc.bg}, transparent)`,
                  borderRadius: '0.75rem',
                  padding: '0.5rem 1rem',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  className="pulse-dot inline-block w-2 h-2 rounded-full"
                  style={{ background: sc.dot }}
                />
                <span
                  className="text-sm font-bold capitalize"
                  style={{ color: sc.color }}
                >
                  {sc.label}
                </span>
              </div>

              <h2 className="mb-5 text-lg font-bold text-slate-900">
                Appointment Information
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  {
                    label: 'Appointment Date',
                    value: new Date(
                      appointment?.appointmentDate,
                    ).toLocaleDateString(),
                  },
                  { label: 'Time Slot', value: appointment?.timeSlot },
                  {
                    label: 'Consultation Type',
                    value: appointment?.consultationType,
                  },
                  { label: 'Status', value: appointment?.status },
                ].map(({ label, value }) => (
                  <div key={label} className="info-tile">
                    <p className="text-xs text-slate-500 font-medium">
                      {label}
                    </p>
                    <p className="font-semibold text-slate-900 mt-0.5 capitalize">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs text-slate-500 font-medium">
                  Reason For Visit
                </p>
                <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4 text-slate-700 font-medium text-sm leading-relaxed">
                  {appointment?.reasonForVisit || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* === RIGHT SIDEBAR === */}
          <div className="space-y-6">
            {/* ACTIONS CARD */}
            <div className="section-card card-in d2 p-6">
              <h2 className="mb-5 text-lg font-bold text-slate-900">
                Appointment Actions
              </h2>

              {status === 'pending' && (
                <div className="space-y-3">
                  <button
                    disabled={confirmingAppt}
                    onClick={handleConfirm}
                    className="btn-act w-full rounded-2xl bg-teal-600 px-4 py-3 font-bold text-white flex items-center justify-center gap-2"
                    style={{ boxShadow: '0 4px 14px rgba(13,148,136,.3)' }}
                  >
                    {confirmingAppt && (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {confirmingAppt ? 'Confirming…' : 'Confirm Appointment'}
                  </button>
                  <button
                    disabled={rejectingAppt}
                    onClick={handleReject}
                    className="btn-act w-full rounded-2xl bg-red-600 px-4 py-3 font-bold text-white flex items-center justify-center gap-2"
                    style={{ boxShadow: '0 4px 14px rgba(220,38,38,.25)' }}
                  >
                    {rejectingAppt && (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {rejectingAppt ? 'Rejecting…' : 'Reject Appointment'}
                  </button>
                </div>
              )}

              {status === 'confirmed' && (
                <div className="space-y-3">
                  <button
                    disabled={completingAppt}
                    onClick={handleComplete}
                    className="btn-act w-full rounded-2xl bg-teal-600 px-4 py-3 font-bold text-white flex items-center justify-center gap-2"
                    style={{ boxShadow: '0 4px 14px rgba(13,148,136,.3)' }}
                  >
                    {completingAppt && (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {completingAppt ? 'Completing…' : 'Complete Consultation'}
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="btn-act w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700"
                  >
                    Cancel Appointment
                  </button>
                </div>
              )}

              {status === 'completed' && (
                <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-2">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M4 9l3.5 3.5L14 6"
                        stroke="#0f766e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="font-bold text-teal-700">
                    Consultation Completed
                  </p>
                </div>
              )}

              {status === 'cancelled' && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="font-bold text-red-700 mb-3">
                    Appointment Cancelled
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="info-tile">
                      <p className="text-xs text-slate-500">Cancelled By</p>
                      <p className="font-semibold capitalize">
                        {appointment?.cancelledBy || '—'}
                      </p>
                    </div>
                    <div className="info-tile">
                      <p className="text-xs text-slate-500">Reason</p>
                      <p className="font-medium">
                        {appointment?.cancelReason || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {status === 'rejected' && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
                  <p className="font-bold text-rose-700">
                    Appointment Rejected
                  </p>
                </div>
              )}
            </div>

            {/* MEETING CARD */}
            {appointment?.consultationType === 'online' && (
              <div className="section-card card-in d3 p-6">
                <h2 className="mb-5 text-lg font-bold text-slate-900">
                  Online Meeting
                </h2>
                {appointment?.meetingLink ? (
                  <div className="space-y-3">
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-act block w-full rounded-2xl bg-teal-600 px-4 py-3 text-center font-bold text-white"
                      style={{ boxShadow: '0 4px 14px rgba(13,148,136,.3)' }}
                    >
                      🎥 Join Meeting
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(appointment.meetingLink);
                        toast.success('Meeting link copied');
                      }}
                      className="btn-act w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700"
                    >
                      Copy Meeting Link
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
                    Meeting link not yet available
                  </div>
                )}
              </div>
            )}

            {/* PRESCRIPTION CARD */}
            <div className="section-card card-in d4 p-6">
              <h2 className="mb-5 text-lg font-bold text-slate-900">
                Prescription
              </h2>

              {status !== 'completed' ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect
                        x="1"
                        y="1"
                        width="14"
                        height="14"
                        rx="4"
                        fill="#fef3c7"
                      />
                      <path
                        d="M8 5v4"
                        stroke="#b45309"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <circle cx="8" cy="11" r="0.75" fill="#b45309" />
                    </svg>
                    <p className="font-bold text-amber-700">
                      Prescription Locked
                    </p>
                  </div>
                  <p className="text-sm text-amber-600 ml-6">
                    Complete the consultation to unlock.
                  </p>
                </div>
              ) : prescription ? (
                <div className="space-y-4">
                  <div className="info-tile">
                    <p className="text-xs text-slate-500 font-medium">
                      Diagnosis
                    </p>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {prescription.diagnosis}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-2">
                      Medicines
                    </p>
                    <div className="space-y-2">
                      {prescription.medicines?.map((med, i) => (
                        <div
                          key={i}
                          className="rounded-2xl bg-teal-50 border border-teal-100 p-3"
                        >
                          <p className="font-bold text-slate-900 text-sm">
                            {med.name}
                          </p>
                          <p className="text-xs text-teal-700 mt-0.5">
                            {med.dosage} · {med.frequency} · {med.duration}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => downloadPrescription(prescription._id)}
                    className="btn-act w-full rounded-2xl bg-teal-600 px-4 py-3 font-bold text-white"
                    style={{ boxShadow: '0 4px 14px rgba(13,148,136,.3)' }}
                  >
                    Download Prescription
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center">
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 36 36"
                      fill="none"
                      className="mx-auto mb-2 float-2"
                    >
                      <rect
                        x="4"
                        y="4"
                        width="28"
                        height="32"
                        rx="6"
                        fill="#ccfbf1"
                      />
                      <rect
                        x="10"
                        y="14"
                        width="16"
                        height="3"
                        rx="1.5"
                        fill="#0f766e"
                        opacity="0.5"
                      />
                      <rect
                        x="10"
                        y="20"
                        width="10"
                        height="3"
                        rx="1.5"
                        fill="#0f766e"
                        opacity="0.35"
                      />
                    </svg>
                    <p className="font-semibold text-slate-600 text-sm">
                      No Prescription Yet
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPrescriptionModal(true)}
                    className="btn-act w-full rounded-2xl bg-teal-600 px-4 py-3 font-bold text-white"
                    style={{ boxShadow: '0 4px 14px rgba(13,148,136,.3)' }}
                  >
                    + Create Prescription
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === CANCEL MODAL === */}
        {showCancelModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(10,22,40,0.6)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCancelModal(false);
            }}
          >
            <div className="modal-panel w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-red-500 to-rose-600">
                <h2 className="text-xl font-bold text-white">
                  Cancel Appointment
                </h2>
                <p className="text-red-100 text-sm mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
              <div className="p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reason for Cancellation
                </label>
                <textarea
                  rows={5}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter cancellation reason…"
                  className="rx-input resize-none"
                />
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Close
                  </button>
                  <button
                    disabled={cancellingAppt}
                    onClick={handleCancel}
                    className="btn-act rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white flex items-center gap-2"
                    style={{ boxShadow: '0 4px 12px rgba(220,38,38,.3)' }}
                  >
                    {cancellingAppt && (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {cancellingAppt ? 'Cancelling…' : 'Confirm Cancel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === CREATE PRESCRIPTION MODAL === */}
        {showPrescriptionModal && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto p-4"
            style={{
              background: 'rgba(10,22,40,0.6)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <div className="modal-panel mx-auto mt-10 mb-10 w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden">
              {/* Modal header */}
              <div className="px-6 py-5 bg-gradient-to-r from-teal-700 to-cyan-600">
                <h2 className="text-xl font-bold text-white">
                  Create Prescription
                </h2>
                <p className="text-teal-100 text-sm mt-0.5">
                  Fill prescription details for this consultation
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Diagnosis */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Diagnosis
                  </label>
                  <textarea
                    rows={4}
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="rx-input resize-none"
                    placeholder="Enter diagnosis…"
                  />
                </div>

                {/* Medicines */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-700">
                      Medicines
                    </label>
                    <button
                      type="button"
                      onClick={addMedicine}
                      className="btn-act rounded-2xl bg-teal-50 border border-teal-200 px-4 py-2 text-sm font-bold text-teal-700"
                    >
                      + Add Medicine
                    </button>
                  </div>
                  <div className="space-y-4">
                    {medicines.map((medicine, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="text-xs font-bold text-teal-600 mb-3 uppercase tracking-wide">
                          Medicine {index + 1}
                        </p>
                        <div className="grid gap-3 md:grid-cols-2">
                          {[
                            { placeholder: 'Medicine Name', field: 'name' },
                            {
                              placeholder: 'Dosage (e.g. 500mg)',
                              field: 'dosage',
                            },
                            {
                              placeholder: 'Frequency (e.g. Twice daily)',
                              field: 'frequency',
                            },
                            {
                              placeholder: 'Duration (e.g. 7 days)',
                              field: 'duration',
                            },
                          ].map(({ placeholder, field }) => (
                            <input
                              key={field}
                              type="text"
                              placeholder={placeholder}
                              value={medicine[field]}
                              onChange={(e) =>
                                updateMedicine(index, field, e.target.value)
                              }
                              className="rx-input"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="rx-input resize-none"
                    placeholder="Any additional notes or instructions…"
                  />
                </div>

                {/* Follow Up */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Follow Up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="rx-input"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setShowPrescriptionModal(false)}
                    className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Close
                  </button>
                  <button
                    disabled={creatingRx}
                    onClick={handleCreatePrescription}
                    className="btn-act rounded-2xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white flex items-center gap-2"
                    style={{ boxShadow: '0 4px 14px rgba(13,148,136,.3)' }}
                  >
                    {creatingRx && (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {creatingRx ? 'Creating…' : 'Create Prescription'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorAppointmentDetailsPage;
