import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  getAppointmentById,
  getPrescriptionsByAppointmentId,
} from '../../api/appointment.api.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .appt-root { font-family: 'DM Sans', sans-serif; }
  .appt-root h1,.appt-root h2,.appt-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes float {
    0%,100% { transform:translateY(0) rotate(-1deg); }
    50%      { transform:translateY(-9px) rotate(1deg); }
  }
  .anim-fade-up { animation: fadeUp 0.5s ease both; }
  .d1{animation-delay:.05s} .d2{animation-delay:.1s} .d3{animation-delay:.15s}
  .d4{animation-delay:.2s}  .d5{animation-delay:.25s} .d6{animation-delay:.3s}

  .float-svg { animation: float 5s ease-in-out infinite; }

  .info-card {
    transition: box-shadow .2s ease, transform .2s ease;
  }
  .info-card:hover {
    box-shadow: 0 10px 30px rgba(0,0,0,.07);
    transform: translateY(-2px);
  }
  .pill-field {
    transition: background .18s ease;
  }
  .pill-field:hover { background: #f1f5f9; }
`;

/* ─── Status config ───────────────────────────────────────────────────────── */
const statusMap = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    ring: 'ring-amber-200',
    label: 'Pending',
  },
  confirmed: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-200',
    label: 'Confirmed',
  },
  completed: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    ring: 'ring-blue-200',
    label: 'Completed',
  },
  cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-400',
    ring: 'ring-red-200',
    label: 'Cancelled',
  },
  rejected: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    ring: 'ring-slate-200',
    label: 'Rejected',
  },
};
const getS = (s = '') => statusMap[s.toLowerCase()] ?? statusMap.pending;

/* ─── Section wrapper ─────────────────────────────────────────────────────── */
const Card = ({ children, className = '', delay = '' }) => (
  <section
    className={`info-card anim-fade-up ${delay} rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
  >
    {children}
  </section>
);

/* ─── Section header ──────────────────────────────────────────────────────── */
const SectionHead = ({ icon, title, sub, color = 'blue' }) => (
  <div className="mb-6 flex items-center gap-3">
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

/* ─── Info field ──────────────────────────────────────────────────────────── */
const Field = ({ label, value, span = false }) => (
  <div
    className={`pill-field rounded-2xl bg-slate-50 p-4 ${span ? 'sm:col-span-2' : ''}`}
  >
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
      {label}
    </p>
    <p className="mt-1.5 text-sm font-semibold leading-relaxed text-slate-800">
      {value || '—'}
    </p>
  </div>
);

/* ─── Appointment illustration ────────────────────────────────────────────── */
const ApptIllustration = () => (
  <svg
    viewBox="0 0 300 240"
    xmlns="http://www.w3.org/2000/svg"
    className="float-svg w-full h-full"
    aria-hidden="true"
  >
    <ellipse cx="150" cy="130" rx="125" ry="100" fill="rgba(255,255,255,0.1)" />

    {/* Clipboard */}
    <rect
      x="72"
      y="38"
      width="156"
      height="172"
      rx="14"
      fill="white"
      opacity=".95"
    />
    <rect x="72" y="38" width="156" height="36" rx="14" fill="#1d4ed8" />
    <rect x="72" y="60" width="156" height="14" fill="#1d4ed8" />
    <rect x="118" y="28" width="64" height="20" rx="10" fill="#1e40af" />
    <rect x="126" y="33" width="48" height="10" rx="5" fill="#3b82f6" />

    {/* Lines of text */}
    {[90, 108, 126, 144, 162, 178].map((y, i) => (
      <rect
        key={i}
        x="92"
        y={y}
        width={i % 3 === 2 ? 72 : 110}
        height="7"
        rx="3.5"
        fill={i === 0 ? '#bfdbfe' : '#e2e8f0'}
      />
    ))}

    {/* Checkmark badge */}
    <circle cx="204" cy="176" r="22" fill="#dcfce7" />
    <path
      d="M193 176l8 8 14-16"
      stroke="#16a34a"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Stethoscope */}
    <path
      d="M55 80 Q52 65 62 62 Q72 59 72 70"
      fill="none"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="55"
      y1="80"
      x2="55"
      y2="100"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle
      cx="55"
      cy="105"
      r="7"
      fill="none"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="3"
    />
    <circle cx="55" cy="105" r="3" fill="rgba(255,255,255,0.5)" />

    {/* Calendar icon top-right */}
    <rect
      x="222"
      y="52"
      width="38"
      height="36"
      rx="8"
      fill="rgba(255,255,255,0.2)"
    />
    <line
      x1="230"
      y1="52"
      x2="230"
      y2="62"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="252"
      y1="52"
      x2="252"
      y2="62"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="222"
      y1="66"
      x2="260"
      y2="66"
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="1.5"
    />
    {[0, 1, 2].map((col) =>
      [0, 1].map((row) => (
        <rect
          key={`${col}-${row}`}
          x={228 + col * 11}
          y={70 + row * 9}
          width="7"
          height="6"
          rx="2"
          fill="rgba(255,255,255,0.35)"
        />
      )),
    )}

    {/* Pills bottom-left */}
    <rect
      x="30"
      y="155"
      width="30"
      height="14"
      rx="7"
      fill="rgba(255,255,255,0.25)"
    />
    <line
      x1="45"
      y1="155"
      x2="45"
      y2="169"
      stroke="rgba(255,255,255,0.45)"
      strokeWidth="1.5"
    />
    <rect
      x="30"
      y="175"
      width="30"
      height="14"
      rx="7"
      fill="rgba(255,255,255,0.18)"
    />
    <line
      x1="45"
      y1="175"
      x2="45"
      y2="189"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="1.5"
    />
  </svg>
);

/* ─── Main Component ──────────────────────────────────────────────────────── */
const AppointmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prescription, setPrescription] = useState(null);
  const [prescriptionLoading, setPrescriptionLoading] = useState(true);

  const fetchAppointment = async () => {
    try {
      const response = await getAppointmentById(id);
      setAppointment(response.data.appointment);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to load appointment',
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescription = async () => {
    try {
      const response = await getPrescriptionsByAppointmentId(id);
      setPrescription(response.data.prescription);
    } catch {
      setPrescription(null);
    } finally {
      setPrescriptionLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
    fetchPrescription();
  }, [id]);

  /* Loading */
  if (loading)
    return (
      <div className="min-h-[70vh] bg-[#f0f5fb] p-6 flex items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-10 py-9 text-center shadow-md">
          <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-semibold text-slate-500 tracking-wide">
            Loading appointment…
          </p>
        </div>
      </div>
    );

  /* Not found */
  if (!appointment)
    return (
      <div className="min-h-[70vh] bg-[#f0f5fb] p-6 flex items-center justify-center">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center shadow-sm max-w-md w-full">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-500">
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
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.178-.43.326-.67.442-.745.361-1.451.999-1.451 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Appointment not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            We couldn't find the requested appointment.
          </p>
        </div>
      </div>
    );

  const s = getS(appointment.status);
  const apptDate = new Date(appointment.appointmentDate).toLocaleDateString(
    'en-US',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  );
  const shortId = appointment._id?.slice(-8).toUpperCase();

  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="appt-root min-h-screen bg-[#f0f5fb] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
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

            <div className="relative flex flex-col gap-8 px-8 py-10 md:flex-row md:items-center md:justify-between md:px-10">
              {/* Left */}
              <div className="flex-1">
                {/* Breadcrumb pill */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-blue-100 backdrop-blur-sm">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Appointment Details
                </div>

                {/* Title */}
                <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                  Your Consultation
                </h1>
                <p className="mt-2 text-blue-100/80 text-sm">
                  with{' '}
                  <span className="font-semibold text-white">
                    Dr. {appointment?.doctorId?.userId?.fullName}
                  </span>
                  {appointment?.doctorId?.department?.name
                    ? ` · ${appointment.doctorId.department.name}`
                    : ''}
                </p>

                {/* Meta chips */}
                <div className="mt-5 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${s.bg} ${s.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white capitalize backdrop-blur-sm">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                    {appointment.consultationType}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                      />
                    </svg>
                    Ref #{shortId}
                  </span>
                </div>

                {/* Date / time / type pills */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    { label: 'Date', val: apptDate },
                    { label: 'Time', val: appointment.timeSlot },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-white">
                        {item.val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Illustration */}
              <div className="mx-auto w-56 flex-shrink-0 md:mx-0 md:w-64 lg:w-72">
                <ApptIllustration />
              </div>
            </div>
          </div>

          {/* ── BODY ────────────────────────────────────────────────────────── */}
          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            {/* Left column */}
            <div className="space-y-6">
              {/* Doctor */}
              <Card delay="d1">
                <SectionHead
                  title="Doctor Information"
                  sub="Provider assigned to this appointment"
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
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="relative flex-shrink-0">
                    <img
                      src={appointment?.doctorId?.userId?.profilePicture}
                      alt="Doctor"
                      className="h-28 w-28 rounded-3xl object-cover ring-2 ring-slate-100"
                    />
                    <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                      MD
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl font-bold text-slate-900">
                      Dr. {appointment?.doctorId?.userId?.fullName}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-blue-600">
                      {appointment?.doctorId?.specialization}
                    </p>
                    <p className="text-sm text-slate-500">
                      {appointment?.doctorId?.department?.name}
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Field
                        label="Qualification"
                        value={appointment?.doctorId?.qualification}
                      />
                      <Field
                        label="Experience"
                        value={`${appointment?.doctorId?.experience} years`}
                      />
                      <Field
                        label="Email"
                        value={appointment?.doctorId?.userId?.email}
                      />
                      <Field
                        label="Phone"
                        value={appointment?.doctorId?.userId?.phoneNumber}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Patient */}
              <Card delay="d2">
                <SectionHead
                  title="Patient Information"
                  sub="Patient contact and profile details"
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
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <img
                    src={appointment?.patientId?.profilePicture}
                    alt="Patient"
                    className="h-24 w-24 flex-shrink-0 rounded-3xl object-cover ring-2 ring-slate-100"
                  />
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <Field
                      label="Name"
                      value={appointment?.patientId?.fullName}
                    />
                    <Field
                      label="Gender"
                      value={appointment?.patientId?.gender}
                    />
                    <Field
                      label="Email"
                      value={appointment?.patientId?.email}
                    />
                    <Field
                      label="Phone"
                      value={appointment?.patientId?.phoneNumber}
                    />
                  </div>
                </div>
              </Card>

              {/* Appointment info */}
              <Card delay="d3">
                <SectionHead
                  title="Appointment Details"
                  sub="Date, time, type, and reason for visit"
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
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Date" value={apptDate} />
                  <Field label="Time Slot" value={appointment.timeSlot} />
                  <Field
                    label="Consultation Type"
                    value={appointment.consultationType}
                  />
                  <Field
                    label="Reason for Visit"
                    value={appointment.reasonForVisit}
                    span
                  />
                </div>
              </Card>

              {/* Notes */}
              {appointment.notes && (
                <Card delay="d4">
                  <SectionHead
                    title="Doctor's Notes"
                    sub="Additional notes from your consultation"
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
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 leading-7 text-slate-700 text-sm">
                    {appointment.notes}
                  </div>
                </Card>
              )}

              {/* Cancellation */}
              {appointment.status === 'cancelled' && (
                <section className="anim-fade-up d5 rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-6 shadow-sm">
                  <SectionHead
                    title="Cancellation Details"
                    sub="This appointment has been cancelled"
                    color="red"
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
                          d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM10.29 3.86L1.82 18a1.875 1.875 0 001.61 2.85h17.14A1.875 1.875 0 0022.18 18L13.71 3.86a1.875 1.875 0 00-3.42 0z"
                        />
                      </svg>
                    }
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/70 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                        Cancelled By
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-red-900">
                        {appointment.cancelledBy}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/70 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                        Reason
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-red-900">
                        {appointment.cancelReason}
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Right sidebar */}
            <aside className="space-y-6 xl:sticky xl:top-24 xl:h-fit">
              {/* Payment */}
              <Card
                delay="d2"
                className="shadow-[0_12px_40px_rgba(15,23,42,0.09)]"
              >
                <SectionHead
                  title="Payment"
                  sub="Billing and payment status"
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
                        d="M2.25 8.25h19.5M3.75 6h16.5A1.5 1.5 0 0121.75 7.5v9A1.5 1.5 0 0120.25 18H3.75A1.5 1.5 0 012.25 16.5v-9A1.5 1.5 0 013.75 6z"
                      />
                    </svg>
                  }
                />
                <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 px-5 py-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
                    Total Amount
                  </p>
                  <p className="mt-1 text-4xl font-extrabold text-white">
                    ₹{appointment.amount}
                  </p>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-500">
                      Payment Status
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">
                      {appointment.paymentStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-500">
                      Consultation Fee
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      ₹{appointment?.doctorId?.consultationFee}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Meeting */}
              {appointment.consultationType === 'online' && (
                <Card delay="d3">
                  <SectionHead
                    title="Meeting Link"
                    sub="Online consultation access"
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
                          d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                    }
                  />
                  {appointment.meetingLink ? (
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-700 hover:-translate-y-0.5"
                      style={{ transition: 'all .18s ease' }}
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
                          d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                      Join Meeting
                    </a>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-400">
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
                            d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-slate-700">
                        Link not available yet
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Will appear once the doctor confirms.
                      </p>
                    </div>
                  )}
                </Card>
              )}

              {/* Prescription */}
              <Card delay="d4">
                <SectionHead
                  title="Prescription"
                  sub="Medical prescription from this visit"
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

                {prescriptionLoading ? (
                  <div className="flex items-center justify-center py-10 gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
                    <p className="text-sm text-slate-500">
                      Loading prescription…
                    </p>
                  </div>
                ) : prescription ? (
                  <div className="space-y-4">
                    {/* Diagnosis */}
                    <div className="rounded-2xl bg-blue-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                        Diagnosis
                      </p>
                      <p className="mt-1 text-sm font-semibold text-blue-900">
                        {prescription.diagnosis}
                      </p>
                    </div>

                    {/* Follow up */}
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-sm text-slate-500">
                        Follow-up Date
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {new Date(prescription.followUpDate).toLocaleDateString(
                          'en-US',
                          { day: 'numeric', month: 'short', year: 'numeric' },
                        )}
                      </span>
                    </div>

                    {/* Medicines */}
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Medicines
                      </p>
                      <div className="space-y-2">
                        {prescription.medicines.map((med, idx) => (
                          <div
                            key={idx}
                            className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                          >
                            <p className="font-semibold text-slate-800 text-sm">
                              {med.name}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {[med.dosage, med.frequency, med.duration]
                                .filter(Boolean)
                                .map((val, i) => (
                                  <span
                                    key={i}
                                    className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-600"
                                  >
                                    {val}
                                  </span>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/patient/prescriptions/${id}`)}
                      className="w-full rounded-2xl border border-blue-200 bg-blue-50 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                      style={{ transition: 'all .18s ease' }}
                    >
                      View Full Prescription →
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
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
                          d="M9 12h6m-6 4h6M9 8h6m2.25-4.5H6.75A2.25 2.25 0 004.5 5.75v12.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V5.75a2.25 2.25 0 00-2.25-2.25z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      No prescription yet
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Your doctor hasn't added one yet.
                    </p>
                  </div>
                )}
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentDetailsPage;
