/*
 * DoctorAvailabilityPage.jsx — AlphaCare Design System
 * Sections:
 *  1. Styles
 *  2. ScheduleIllustration (hero SVG)
 *  3. DoctorAvailabilityPage (main component)
 *     3a. Hero
 *     3b. Weekly Schedule cards
 *     3c. Active Leaves
 *     3d. Edit Schedule Modal
 *     3e. Apply Leave Modal
 *     3f. Force Leave Modal
 */

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout.jsx';

import {
  getSchedules,
  updateDoctorSchedule,
  toggleSchedule,
} from '../../api/schedule.api.js';

import {
  getDoctorLeaves,
  createDoctorLeave,
  deleteDoctorLeave,
} from '../../api/schedule.api.js';

/* === STYLES === */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

  .avail-root * { font-family: 'DM Sans', sans-serif; }
  .avail-root h1, .avail-root h2, .avail-root h3, .avail-root h4 { font-family: 'Sora', sans-serif; }

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
  .btn-act:hover { transform:translateY(-2px); }
  .btn-act:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

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
    border-color:#60a5fa;
    box-shadow:0 0 0 3px rgba(59,130,246,.15);
    background:white;
  }

  .sched-card {
    transition: transform .22s ease, box-shadow .22s ease;
  }
  .sched-card:hover {
    transform:translateY(-5px);
    box-shadow:0 12px 32px rgba(37,99,235,.10);
  }
`;

/* === SCHEDULE ILLUSTRATION === */
const ScheduleIllustration = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    {/* Spinning ring */}
    <svg
      className="spin-slow absolute inset-0 w-full h-full opacity-20"
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="160"
        cy="140"
        r="130"
        stroke="white"
        strokeWidth="1.5"
        strokeDasharray="8 6"
      />
    </svg>

    {/* Main calendar widget */}
    <svg
      className="float-1 absolute inset-0 w-full h-full"
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="calHeader" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="slotGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#e0e7ff" />
        </linearGradient>
      </defs>
      {/* Card */}
      <rect
        x="60"
        y="30"
        width="200"
        height="220"
        rx="20"
        fill="white"
        opacity="0.95"
      />
      {/* Header */}
      <rect
        x="60"
        y="30"
        width="200"
        height="52"
        rx="20"
        fill="url(#calHeader)"
      />
      <rect
        x="60"
        y="62"
        width="200"
        height="20"
        rx="0"
        fill="url(#calHeader)"
      />
      <text
        x="160"
        y="62"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="700"
        fontFamily="Sora,sans-serif"
      >
        Weekly Schedule
      </text>
      <text
        x="160"
        y="76"
        textAnchor="middle"
        fill="rgba(255,255,255,0.7)"
        fontSize="9"
        fontFamily="DM Sans,sans-serif"
      >
        June 2026
      </text>
      {/* Day slots */}
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
        <g key={d}>
          <rect
            x="76"
            y={102 + i * 28}
            width="168"
            height="20"
            rx="6"
            fill={i % 2 === 0 ? 'url(#slotGrad)' : '#f8fafc'}
          />
          <text
            x="90"
            y={116 + i * 28}
            fill="#1e40af"
            fontSize="9"
            fontWeight="600"
            fontFamily="DM Sans,sans-serif"
          >
            {d}
          </text>
          <rect
            x="130"
            y={107 + i * 28}
            width="60"
            height="10"
            rx="3"
            fill="#bfdbfe"
          />
          <rect
            x="198"
            y={107 + i * 28}
            width="30"
            height="10"
            rx="3"
            fill={i === 2 ? '#fca5a5' : '#bbf7d0'}
          />
        </g>
      ))}
      {/* Medical cross */}
      <rect
        x="235"
        y="35"
        width="8"
        height="20"
        rx="2"
        fill="rgba(255,255,255,0.4)"
      />
      <rect
        x="229"
        y="41"
        width="20"
        height="8"
        rx="2"
        fill="rgba(255,255,255,0.4)"
      />
    </svg>

    {/* Badge 1 — Active Days */}
    <svg
      className="float-2 absolute"
      style={{ top: '10%', right: '2%', width: 88, height: 34 }}
      viewBox="0 0 88 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="88" height="34" rx="10" fill="white" opacity="0.95" />
      <circle cx="14" cy="17" r="5" fill="#22c55e" className="pulse-dot" />
      <text
        x="24"
        y="21"
        fill="#0f172a"
        fontSize="10"
        fontWeight="700"
        fontFamily="Sora,sans-serif"
      >
        5 Active
      </text>
    </svg>

    {/* Badge 2 — Slot duration */}
    <svg
      className="float-3 absolute"
      style={{ bottom: '12%', left: '0%', width: 98, height: 34 }}
      viewBox="0 0 98 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="98" height="34" rx="10" fill="#1d4ed8" opacity="0.9" />
      <text
        x="12"
        y="21"
        fill="white"
        fontSize="10"
        fontWeight="700"
        fontFamily="Sora,sans-serif"
      >
        30 min slots
      </text>
    </svg>

    {/* Badge 3 — Leave */}
    <svg
      className="float-1 absolute"
      style={{ bottom: '28%', right: '0%', width: 82, height: 34 }}
      viewBox="0 0 82 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="82" height="34" rx="10" fill="white" opacity="0.95" />
      <circle cx="13" cy="17" r="4" fill="#f97316" />
      <text
        x="22"
        y="21"
        fill="#0f172a"
        fontSize="10"
        fontWeight="700"
        fontFamily="Sora,sans-serif"
      >
        2 Leaves
      </text>
    </svg>
  </div>
);

/* === MAIN COMPONENT === */
const DoctorAvailabilityPage = () => {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showForceLeaveModal, setShowForceLeaveModal] = useState(false);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [scheduleForm, setScheduleForm] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    slotDuration: 30,
    breakStart: '',
    breakEnd: '',
    isAvailable: true,
  });
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [applyingLeave, setApplyingLeave] = useState(false);
  const [forcingLeave, setForcingLeave] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [scheduleRes, leaveRes] = await Promise.all([
        getSchedules(),
        getDoctorLeaves(),
      ]);
      setSchedules(scheduleRes.data.schedules || []);
      setLeaves(leaveRes.data.leaves || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to load availability data',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleSchedule = async (scheduleId) => {
    try {
      await toggleSchedule(scheduleId);
      toast.success('Schedule updated');
      fetchData();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to update schedule',
      );
    }
  };

  const openEditModal = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleForm({
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      slotDuration: schedule.slotDuration,
      breakStart: schedule.breakStart || '',
      breakEnd: schedule.breakEnd || '',
      isAvailable: schedule.isAvailable,
    });
    setEditModalOpen(true);
  };

  const daysOrder = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  const sortedSchedules = [...schedules].sort(
    (a, b) => daysOrder.indexOf(a.dayOfWeek) - daysOrder.indexOf(b.dayOfWeek),
  );

  const availableCount = schedules.filter((s) => s.isAvailable).length;

  /* === LOADING SKELETON === */
  if (loading) {
    return (
      <DashboardLayout>
        <style>{styles}</style>
        <div className="avail-root min-h-screen bg-[#f0f5fb] p-6">
          <div className="shimmer-bg rounded-3xl h-52 mb-8" />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6"
              >
                <div className="shimmer-bg h-6 w-32 rounded-full mb-3" />
                <div className="shimmer-bg h-4 w-20 rounded-full mb-5" />
                <div className="space-y-3">
                  <div className="shimmer-bg h-14 rounded-2xl" />
                  <div className="shimmer-bg h-14 rounded-2xl" />
                  <div className="shimmer-bg h-14 rounded-2xl" />
                </div>
                <div className="flex gap-3 mt-5">
                  <div className="shimmer-bg flex-1 h-11 rounded-2xl" />
                  <div className="shimmer-bg flex-1 h-11 rounded-2xl" />
                </div>
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
      <div className="avail-root min-h-screen bg-[#f0f5fb] p-6">
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
            className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-5"
            style={{ background: 'white' }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-5"
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
              <span className="inline-block rounded-full border border-teal-300/50 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-100 mb-4">
                Availability Management
              </span>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                Schedule & <span className="text-teal-200">Leave</span>{' '}
                Management
              </h1>
              <p className="mt-3 text-teal-100/85 text-base max-w-md">
                Manage your weekly availability, working hours, break timings
                and time-off requests.
              </p>

              {/* Hero stat cards */}
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { label: 'Active Days', value: availableCount },
                  { label: 'Total Schedules', value: schedules.length },
                  { label: 'Leaves Taken', value: leaves.length },
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
              <ScheduleIllustration />
            </div>
          </div>

          {/* Apply Leave CTA */}
          <button
            onClick={() => setLeaveModalOpen(true)}
            className="btn-act absolute top-6 right-6 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-teal-700 shadow-lg"
            style={{ boxShadow: '0 4px 14px rgba(37,99,235,.28)' }}
          >
            + Apply Leave
          </button>
        </section>

        {/* === WEEKLY SCHEDULE === */}
        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between anim-fade-up d1">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Weekly Schedule
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Manage working hours for each day
              </p>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-teal-700">
              {availableCount} / {schedules.length} Active
            </span>
          </div>

          {schedules.length === 0 ? (
            /* Empty state */
            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                className="mx-auto mb-4 float-1"
              >
                <rect
                  x="8"
                  y="12"
                  width="48"
                  height="44"
                  rx="8"
                  fill="#dbeafe"
                />
                <rect
                  x="8"
                  y="12"
                  width="48"
                  height="14"
                  rx="8"
                  fill="#3b82f6"
                />
                <rect
                  x="20"
                  y="36"
                  width="24"
                  height="4"
                  rx="2"
                  fill="#93c5fd"
                />
                <rect
                  x="20"
                  y="44"
                  width="16"
                  height="4"
                  rx="2"
                  fill="#bfdbfe"
                />
              </svg>
              <h3 className="text-xl font-bold text-slate-900">
                No Schedule Configured
              </h3>
              <p className="mt-2 text-slate-500">
                Your weekly schedule will appear here once set up.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sortedSchedules.map((schedule, idx) => (
                <div
                  key={schedule._id}
                  className={`sched-card card-in rounded-3xl border bg-white p-6 shadow-sm d${Math.min(idx + 1, 5)}`}
                  style={{
                    borderColor: schedule.isAvailable ? '#bbf7d0' : '#fecaca',
                  }}
                >
                  {/* Status strip */}
                  <div
                    className="absolute inset-x-0 top-0 h-1 rounded-t-3xl"
                    style={{
                      background: schedule.isAvailable
                        ? 'linear-gradient(90deg, #22c55e, #86efac)'
                        : 'linear-gradient(90deg, #ef4444, #fca5a5)',
                      position: 'relative',
                      borderRadius: '1.5rem 1.5rem 0 0',
                      height: 4,
                      marginBottom: 16,
                    }}
                  />

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold capitalize text-slate-950">
                        {schedule.dayOfWeek}
                      </h3>
                      <span
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                        style={{
                          background: schedule.isAvailable
                            ? '#dcfce7'
                            : '#fee2e2',
                          color: schedule.isAvailable ? '#15803d' : '#b91c1c',
                        }}
                      >
                        <span
                          className="pulse-dot inline-block w-1.5 h-1.5 rounded-full"
                          style={{
                            background: schedule.isAvailable
                              ? '#22c55e'
                              : '#ef4444',
                          }}
                        />
                        {schedule.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">
                        Working Hours
                      </p>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {schedule.startTime} – {schedule.endTime}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">
                        Break Time
                      </p>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {schedule.breakStart || '—'} –{' '}
                        {schedule.breakEnd || '—'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">
                        Slot Duration
                      </p>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {schedule.slotDuration} Minutes
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => openEditModal(schedule)}
                      className="btn-act flex-1 rounded-2xl border border-teal-200 bg-teal-50 py-3 text-sm font-bold text-teal-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleSchedule(schedule._id)}
                      className="btn-act flex-1 rounded-2xl py-3 text-sm font-bold text-white"
                      style={{
                        background: schedule.isAvailable
                          ? '#dc2626'
                          : '#16a34a',
                        boxShadow: schedule.isAvailable
                          ? '0 4px 12px rgba(220,38,38,.25)'
                          : '0 4px 12px rgba(22,163,74,.25)',
                      }}
                    >
                      {schedule.isAvailable ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* === ACTIVE LEAVES === */}
        <section className="mt-12 anim-fade-up d3">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Active Leaves
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Your upcoming and current time-off
              </p>
            </div>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
              {leaves.length} Leaves
            </span>
          </div>

          {leaves.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                fill="none"
                className="mx-auto mb-4 float-2"
              >
                <rect
                  x="8"
                  y="10"
                  width="44"
                  height="42"
                  rx="8"
                  fill="#ffedd5"
                />
                <rect
                  x="8"
                  y="10"
                  width="44"
                  height="14"
                  rx="8"
                  fill="#f97316"
                />
                <rect
                  x="18"
                  y="34"
                  width="24"
                  height="4"
                  rx="2"
                  fill="#fed7aa"
                />
                <rect
                  x="18"
                  y="42"
                  width="14"
                  height="4"
                  rx="2"
                  fill="#fdba74"
                />
              </svg>
              <h3 className="text-xl font-bold text-slate-900">
                No Active Leaves
              </h3>
              <p className="mt-2 text-slate-500">
                You currently have no leave requests.
              </p>
              <button
                onClick={() => setLeaveModalOpen(true)}
                className="btn-act mt-5 inline-block rounded-2xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white"
                style={{ boxShadow: '0 4px 14px rgba(37,99,235,.28)' }}
              >
                Apply Leave
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {leaves.map((leave, idx) => (
                <div
                  key={leave._id}
                  className={`card-in rounded-3xl border border-orange-200 bg-white p-6 shadow-sm d${Math.min(idx + 1, 5)}`}
                >
                  {/* Tinted strip */}
                  <div
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(251,146,60,.12), transparent)',
                      borderRadius: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700 flex items-center gap-1.5">
                      <span className="pulse-dot inline-block w-1.5 h-1.5 rounded-full bg-orange-500" />
                      Leave
                    </span>
                    <button
                      onClick={async () => {
                        try {
                          await deleteDoctorLeave(leave._id);
                          toast.success('Leave deleted');
                          fetchData();
                        } catch (error) {
                          toast.error(
                            error?.response?.data?.message ||
                              'Failed to delete leave',
                          );
                        }
                      }}
                      className="text-sm font-bold text-red-500 hover:text-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">
                        Start Date
                      </p>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {new Date(leave.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">
                        End Date
                      </p>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 mt-3">
                    <p className="text-xs text-slate-500 font-medium">Reason</p>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {leave.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* === EDIT SCHEDULE MODAL === */}
        {editModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(10,22,40,0.6)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditModalOpen(false);
            }}
          >
            <div className="modal-panel w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
              {/* Modal header */}
              <div className="px-6 py-5 bg-gradient-to-r from-teal-600 to-cyan-600">
                <h2 className="text-xl font-bold text-white capitalize">
                  Edit — {selectedSchedule?.dayOfWeek}
                </h2>
                <p className="text-teal-200 text-sm mt-0.5">
                  Update working hours and break timings
                </p>
              </div>

              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { label: 'Start Time', key: 'startTime', type: 'time' },
                    { label: 'End Time', key: 'endTime', type: 'time' },
                    { label: 'Break Start', key: 'breakStart', type: 'time' },
                    { label: 'Break End', key: 'breakEnd', type: 'time' },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        {label}
                      </label>
                      <input
                        type={type}
                        value={scheduleForm[key]}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            [key]: e.target.value,
                          })
                        }
                        className="rx-input"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Slot Duration (mins)
                    </label>
                    <input
                      type="number"
                      value={scheduleForm.slotDuration}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          slotDuration: Number(e.target.value),
                        })
                      }
                      className="rx-input"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={savingSchedule}
                    onClick={async () => {
                      setSavingSchedule(true);
                      try {
                        await updateDoctorSchedule(
                          selectedSchedule._id,
                          scheduleForm,
                        );
                        toast.success('Schedule updated');
                        setEditModalOpen(false);
                        fetchData();
                      } catch (error) {
                        toast.error(
                          error?.response?.data?.message || 'Update failed',
                        );
                      } finally {
                        setSavingSchedule(false);
                      }
                    }}
                    className="btn-act rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white flex items-center gap-2"
                    style={{ boxShadow: '0 4px 14px rgba(37,99,235,.28)' }}
                  >
                    {savingSchedule && (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {savingSchedule ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === APPLY LEAVE MODAL === */}
        {leaveModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(10,22,40,0.6)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setLeaveModalOpen(false);
            }}
          >
            <div className="modal-panel w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-teal-600 to-cyan-600">
                <h2 className="text-xl font-bold text-white">Apply Leave</h2>
                <p className="text-teal-200 text-sm mt-0.5">
                  Request time off from your schedule
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, startDate: e.target.value })
                    }
                    className="rx-input"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, endDate: e.target.value })
                    }
                    className="rx-input"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Reason
                  </label>
                  <textarea
                    rows={4}
                    value={leaveForm.reason}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, reason: e.target.value })
                    }
                    className="rx-input resize-none"
                    placeholder="Briefly describe your reason for leave…"
                  />
                </div>
              </div>

              <div className="px-6 pb-6 flex justify-end gap-3">
                <button
                  onClick={() => setLeaveModalOpen(false)}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  disabled={applyingLeave}
                  onClick={async () => {
                    setApplyingLeave(true);
                    try {
                      const response = await createDoctorLeave(leaveForm);
                      setAppointmentCount(
                        response?.data?.appointmentCount || 0,
                      );
                      if (
                        response?.data?.message
                          ?.toLowerCase()
                          .includes('continue anyway')
                      ) {
                        setShowForceLeaveModal(true);
                        return;
                      }
                      toast.success('Leave applied successfully');
                      setLeaveModalOpen(false);
                      setLeaveForm({ startDate: '', endDate: '', reason: '' });
                      fetchData();
                    } catch (error) {
                      toast.error(
                        error?.response?.data?.message ||
                          'Failed to apply leave',
                      );
                    } finally {
                      setApplyingLeave(false);
                    }
                  }}
                  className="btn-act rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white flex items-center gap-2"
                  style={{ boxShadow: '0 4px 14px rgba(37,99,235,.28)' }}
                >
                  {applyingLeave && (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {applyingLeave ? 'Applying…' : 'Apply Leave'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === FORCE LEAVE MODAL === */}
        {showForceLeaveModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(10,22,40,0.6)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <div className="modal-panel w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-red-500 to-rose-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 3L17 16H3L10 3Z"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 9V12"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <circle cx="10" cy="14.5" r="0.75" fill="white" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Existing Appointments Found
                    </h2>
                    <p className="text-red-100 text-sm mt-0.5">
                      Action required
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4 mb-4">
                  <p className="font-bold text-red-800 text-lg">
                    {appointmentCount} appointment
                    {appointmentCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    are already booked during this leave period.
                  </p>
                </div>
                <p className="text-slate-600">
                  Do you still want to apply this leave? This may affect your
                  patients' bookings.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowForceLeaveModal(false)}
                    className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={forcingLeave}
                    onClick={async () => {
                      setForcingLeave(true);
                      try {
                        await createDoctorLeave({
                          ...leaveForm,
                          forceCreate: true,
                        });
                        toast.success('Leave applied successfully');
                        setShowForceLeaveModal(false);
                        setLeaveModalOpen(false);
                        fetchData();
                      } catch (error) {
                        toast.error(
                          error?.response?.data?.message ||
                            'Failed to apply leave',
                        );
                      } finally {
                        setForcingLeave(false);
                      }
                    }}
                    className="btn-act rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white flex items-center gap-2"
                    style={{ boxShadow: '0 4px 12px rgba(220,38,38,.3)' }}
                  >
                    {forcingLeave && (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {forcingLeave ? 'Applying…' : 'Force Apply Leave'}
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

export default DoctorAvailabilityPage;
