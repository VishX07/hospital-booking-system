/*
 * DoctorAvailabilityPage.jsx — AlphaCare Design System
 * Sections:
 *  1. Styles
 *  2. ScheduleIllustration (hero SVG)
 *  3. DoctorAvailabilityPage (main component)
 *     3a. Loading Skeleton
 *     3b. Hero
 *     3c. Weekly Schedule cards
 *     3d. Active Leaves
 *     3e. Create Schedule Modal
 *     3f. Edit Schedule Modal
 *     3g. Apply Leave Modal
 *     3h. Force Leave Modal
 */

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout.jsx';

import {
  getSchedules,
  updateDoctorSchedule,
  toggleSchedule,
  createSchedule,
} from '../../api/schedule.api.js';

import {
  getDoctorLeaves,
  createDoctorLeave,
  deleteDoctorLeave,
} from '../../api/schedule.api.js';

/* === STYLES === */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

  .avail-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
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
  .btn-act:hover:not(:disabled) { transform:translateY(-2px); }
  .btn-act:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

  .rx-input {
    border-radius:1rem;
    border:1px solid #e2e8f0;
    background:#f8fafc;
    padding:0.65rem 0.875rem;
    width:100%;
    font-family:'DM Sans',sans-serif;
    font-size:0.875rem;
    transition: border-color .2s, box-shadow .2s, background .2s;
    outline:none;
  }
  .rx-input:focus {
    border-color:#2dd4bf;
    box-shadow:0 0 0 3px rgba(20,184,166,.15);
    background:white;
  }

  .sched-card {
    transition: transform .22s ease, box-shadow .22s ease;
  }
  .sched-card:hover {
    transform:translateY(-4px);
    box-shadow:0 12px 32px rgba(13,148,136,.10);
  }

  .hero-illus { display:none; }
  @media(min-width:1024px){ .hero-illus { display:flex; } }

  .hero-stats {
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:0.5rem;
    margin-top:1rem;
  }
  @media(min-width:640px){
    .hero-stats { display:flex; flex-wrap:wrap; gap:0.75rem; margin-top:1.5rem; }
  }

  .hero-stat-pill {
    border-radius:1rem;
    padding:0.6rem 0.75rem;
    background:rgba(255,255,255,0.12);
    backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,0.2);
    text-align:center;
  }
  @media(min-width:640px){
    .hero-stat-pill { padding:0.75rem 1.25rem; text-align:left; min-width:100px; }
  }

  .hero-stat-value {
    font-size:1.25rem;
    font-weight:800;
    color:white;
    line-height:1;
    font-family:'Sora',sans-serif;
  }
  @media(min-width:640px){ .hero-stat-value { font-size:1.75rem; } }

  .hero-stat-label {
    font-size:0.6rem;
    color:#99f6e4;
    font-weight:600;
    margin-top:0.2rem;
  }
  @media(min-width:640px){ .hero-stat-label { font-size:0.75rem; } }

  .hero-ctas {
    display:flex;
    flex-direction:row;
    flex-wrap:wrap;
    gap:0.5rem;
    margin-top:1rem;
  }
  @media(min-width:480px){ .hero-ctas { margin-top:1.25rem; } }

  .sched-grid {
    display:grid;
    gap:0.875rem;
    grid-template-columns:1fr;
  }
  @media(min-width:640px){ .sched-grid { grid-template-columns:repeat(2,1fr); } }
  @media(min-width:1280px){ .sched-grid { grid-template-columns:repeat(3,1fr); } }

  .leave-grid {
    display:grid;
    gap:0.875rem;
    grid-template-columns:1fr;
  }
  @media(min-width:640px){ .leave-grid { grid-template-columns:repeat(2,1fr); } }

  .sched-actions {
    display:flex;
    gap:0.625rem;
    margin-top:1rem;
  }
  .sched-actions button { flex:1; }

  .modal-scroll {
    overflow-y:auto;
    max-height:92vh;
  }
  @media(min-width:640px){ .modal-scroll { max-height:none; overflow-y:visible; } }

  .days-grid {
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:0.375rem;
  }
  @media(min-width:480px){ .days-grid { grid-template-columns:repeat(7,1fr); } }

  .day-chip {
    padding:0.4rem 0.25rem;
    border-radius:0.625rem;
    border:1.5px solid #e2e8f0;
    background:white;
    font-size:0.7rem;
    font-weight:700;
    text-align:center;
    cursor:pointer;
    transition:all .15s;
    font-family:'DM Sans',sans-serif;
    color:#475569;
  }
  .day-chip.selected {
    background:#0d9488;
    border-color:#0d9488;
    color:white;
  }
  .day-chip:not(.selected):not(:disabled):hover {
    border-color:#99f6e4;
    color:#0f766e;
  }
  .day-chip:disabled {
    opacity:0.35;
    cursor:not-allowed;
  }
`;

/* === SCHEDULE ILLUSTRATION === */
const ScheduleIllustration = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <svg
      className="spin-slow absolute inset-0 w-full h-full opacity-20"
      viewBox="0 0 320 280"
      fill="none"
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
    <svg
      className="float-1 absolute inset-0 w-full h-full"
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="calHeader" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="slotGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ccfbf1" />
          <stop offset="100%" stopColor="#cffafe" />
        </linearGradient>
      </defs>
      <rect
        x="60"
        y="30"
        width="200"
        height="220"
        rx="20"
        fill="white"
        opacity="0.95"
      />
      <rect
        x="60"
        y="30"
        width="200"
        height="52"
        rx="20"
        fill="url(#calHeader)"
      />
      <rect x="60" y="62" width="200" height="20" fill="url(#calHeader)" />
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
            fill="#0f766e"
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
            fill="#99f6e4"
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
    <svg
      className="float-2 absolute"
      style={{ top: '10%', right: '2%', width: 88, height: 34 }}
      viewBox="0 0 88 34"
      fill="none"
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
    <svg
      className="float-3 absolute"
      style={{ bottom: '12%', left: '0%', width: 98, height: 34 }}
      viewBox="0 0 98 34"
      fill="none"
    >
      <rect width="98" height="34" rx="10" fill="#0f766e" opacity="0.9" />
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
    <svg
      className="float-1 absolute"
      style={{ bottom: '28%', right: '0%', width: 82, height: 34 }}
      viewBox="0 0 82 34"
      fill="none"
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

/* === CONSTANTS === */
const ALL_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];
const DAY_SHORT = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};
const DEFAULT_SCHEDULE_FORM = {
  dayOfWeek: '',
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 30,
  breakStart: '',
  breakEnd: '',
};
const DEFAULT_LEAVE_FORM = { startDate: '', endDate: '', reason: '' };

/* === FORM FIELD === */
const FormField = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1.5 sm:text-sm">
      {label}
    </label>
    {children}
  </div>
);

/* === MAIN COMPONENT === */
const DoctorAvailabilityPage = () => {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [leaves, setLeaves] = useState([]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [showForceLeaveModal, setShowForceLeaveModal] = useState(false);

  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [appointmentCount, setAppointmentCount] = useState(0);

  const [createForm, setCreateForm] = useState(DEFAULT_SCHEDULE_FORM);
  const [scheduleForm, setScheduleForm] = useState(DEFAULT_SCHEDULE_FORM);
  const [leaveForm, setLeaveForm] = useState(DEFAULT_LEAVE_FORM);

  const [savingSchedule, setSavingSchedule] = useState(false);
  const [creatingSchedule, setCreatingSchedule] = useState(false);
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
    });
    setEditModalOpen(true);
  };

  const configuredDays = schedules.map((s) => s.dayOfWeek);
  const availableDays = ALL_DAYS.filter((d) => !configuredDays.includes(d));
  const sortedSchedules = [...schedules].sort(
    (a, b) => ALL_DAYS.indexOf(a.dayOfWeek) - ALL_DAYS.indexOf(b.dayOfWeek),
  );
  const availableCount = schedules.filter((s) => s.isAvailable).length;

  const openCreateModal = () => {
    setCreateForm({
      ...DEFAULT_SCHEDULE_FORM,
      dayOfWeek: availableDays[0] || '',
    });
    setCreateModalOpen(true);
  };

  /* === LOADING SKELETON === */
  if (loading) {
    return (
      <DashboardLayout>
        <style>{styles}</style>
        <div className="avail-root min-h-screen bg-[#f0f5fb] p-3 sm:p-6">
          <div className="shimmer-bg rounded-2xl sm:rounded-3xl h-40 sm:h-52 mb-5 sm:mb-6" />
          <div className="sched-grid">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm p-4 sm:p-6"
              >
                <div className="shimmer-bg h-5 w-24 rounded-full mb-2" />
                <div className="shimmer-bg h-4 w-16 rounded-full mb-4" />
                <div className="space-y-2">
                  <div className="shimmer-bg h-12 rounded-2xl" />
                  <div className="shimmer-bg h-12 rounded-2xl" />
                  <div className="shimmer-bg h-12 rounded-2xl" />
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="shimmer-bg flex-1 h-10 rounded-xl" />
                  <div className="shimmer-bg flex-1 h-10 rounded-xl" />
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
      <div className="avail-root min-h-screen bg-[#f0f5fb] p-3 sm:p-6">
        {/* === HERO === */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 px-4 py-6 sm:px-8 sm:py-10 shadow-xl anim-fade-up">
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
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-5"
            style={{ background: 'white' }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-5"
            style={{ background: 'white' }}
          />
          <svg
            className="spin-slow absolute top-4 left-4 opacity-20 hidden lg:block"
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
          >
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="white"
              strokeWidth="1.5"
              strokeDasharray="7 5"
            />
          </svg>

          <div className="relative flex items-start justify-between gap-4 lg:items-center">
            <div className="flex-1 min-w-0">
              <span className="inline-block rounded-full border border-teal-300/50 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-100 mb-3 sm:px-4 sm:py-1.5 sm:text-xs sm:mb-4">
                Availability Management
              </span>
              <h1 className="text-2xl font-extrabold text-white leading-tight sm:text-3xl lg:text-4xl xl:text-5xl">
                Schedule & <span className="text-cyan-200">Leave</span>
              </h1>
              <p className="mt-1.5 text-teal-100/80 text-xs sm:text-sm sm:mt-2 max-w-md">
                Manage your weekly availability, working hours and time-off
                requests.
              </p>

              <div className="hero-stats">
                {[
                  { label: 'Active Days', value: availableCount },
                  { label: 'Total Schedules', value: schedules.length },
                  { label: 'Leaves', value: leaves.length },
                ].map((stat) => (
                  <div key={stat.label} className="hero-stat-pill">
                    <p className="hero-stat-value">{stat.value}</p>
                    <p className="hero-stat-label">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="hero-ctas">
                {availableDays.length > 0 && (
                  <button
                    onClick={openCreateModal}
                    className="btn-act rounded-xl sm:rounded-2xl bg-white px-4 py-2 text-xs font-bold text-teal-700 shadow-lg sm:px-5 sm:py-2.5 sm:text-sm"
                    style={{ boxShadow: '0 4px 14px rgba(0,0,0,.15)' }}
                  >
                    + Add Schedule
                  </button>
                )}
                <button
                  onClick={() => setLeaveModalOpen(true)}
                  className="btn-act rounded-xl sm:rounded-2xl border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  + Apply Leave
                </button>
              </div>
            </div>

            <div className="hero-illus flex-shrink-0 h-56 w-64 xl:h-64 xl:w-72">
              <ScheduleIllustration />
            </div>
          </div>
        </section>

        {/* === WEEKLY SCHEDULE === */}
        <section className="mt-6 sm:mt-10">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-950 sm:text-2xl">
                Weekly Schedule
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 sm:text-sm sm:mt-1">
                Manage working hours for each day
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-700 sm:px-3">
                {availableCount}/{schedules.length} Active
              </span>
              {availableDays.length > 0 && (
                <button
                  onClick={openCreateModal}
                  className="btn-act hidden sm:flex rounded-2xl bg-teal-600 px-4 py-2 text-xs font-bold text-white items-center gap-1.5"
                  style={{ boxShadow: '0 4px 12px rgba(13,148,136,.3)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1v10M1 6h10"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  Add Day
                </button>
              )}
            </div>
          </div>

          {schedules.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
              <svg
                width="56"
                height="56"
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
                  fill="#ccfbf1"
                />
                <rect
                  x="8"
                  y="12"
                  width="48"
                  height="14"
                  rx="8"
                  fill="#0d9488"
                />
                <rect
                  x="20"
                  y="36"
                  width="24"
                  height="4"
                  rx="2"
                  fill="#99f6e4"
                />
                <rect
                  x="20"
                  y="44"
                  width="16"
                  height="4"
                  rx="2"
                  fill="#ccfbf1"
                />
              </svg>
              <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                No Schedule Configured
              </h3>
              <p className="mt-2 text-slate-500 text-sm">
                Add your first working day to get started.
              </p>
              <button
                onClick={openCreateModal}
                className="btn-act mt-5 inline-flex rounded-2xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white"
                style={{ boxShadow: '0 4px 14px rgba(13,148,136,.3)' }}
              >
                + Add Schedule
              </button>
            </div>
          ) : (
            <div className="sched-grid">
              {sortedSchedules.map((schedule, idx) => (
                <div
                  key={schedule._id}
                  className={`sched-card card-in rounded-2xl sm:rounded-3xl border bg-white p-4 sm:p-6 shadow-sm d${Math.min(idx + 1, 5)}`}
                  style={{
                    borderColor: schedule.isAvailable ? '#99f6e4' : '#fecaca',
                  }}
                >
                  <div
                    style={{
                      background: schedule.isAvailable
                        ? 'linear-gradient(90deg,#22c55e,#86efac)'
                        : 'linear-gradient(90deg,#ef4444,#fca5a5)',
                      borderRadius: '0.875rem 0.875rem 0 0',
                      height: 3,
                      margin: '-1rem -1rem 1rem',
                    }}
                  />

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold capitalize text-slate-950 sm:text-xl">
                        {schedule.dayOfWeek}
                      </h3>
                      <span
                        className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold"
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

                  <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
                    {[
                      {
                        label: 'Working Hours',
                        value: `${schedule.startTime} – ${schedule.endTime}`,
                      },
                      {
                        label: 'Break Time',
                        value: `${schedule.breakStart || '—'} – ${schedule.breakEnd || '—'}`,
                      },
                      {
                        label: 'Slot Duration',
                        value: `${schedule.slotDuration} Minutes`,
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-xl sm:rounded-2xl bg-slate-50 px-3 py-2.5 border border-slate-100"
                      >
                        <p className="text-[10px] text-slate-500 font-medium">
                          {label}
                        </p>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="sched-actions">
                    <button
                      onClick={() => openEditModal(schedule)}
                      className="btn-act rounded-xl sm:rounded-2xl border border-teal-200 bg-teal-50 py-2.5 text-xs font-bold text-teal-700 sm:text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleSchedule(schedule._id)}
                      className="btn-act rounded-xl sm:rounded-2xl py-2.5 text-xs font-bold text-white sm:text-sm"
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
        <section className="mt-8 sm:mt-12 anim-fade-up d3 pb-6">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-950 sm:text-2xl">
                Active Leaves
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 sm:text-sm sm:mt-1">
                Your upcoming and current time-off
              </p>
            </div>
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700 sm:px-3">
              {leaves.length} Leaves
            </span>
          </div>

          {leaves.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
              <svg
                width="52"
                height="52"
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
              <h3 className="text-lg font-bold text-slate-900">
                No Active Leaves
              </h3>
              <p className="mt-2 text-slate-500 text-sm">
                You currently have no leave requests.
              </p>
              <button
                onClick={() => setLeaveModalOpen(true)}
                className="btn-act mt-5 inline-flex rounded-2xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white"
                style={{ boxShadow: '0 4px 14px rgba(13,148,136,.28)' }}
              >
                Apply Leave
              </button>
            </div>
          ) : (
            <div className="leave-grid">
              {leaves.map((leave, idx) => (
                <div
                  key={leave._id}
                  className={`card-in rounded-2xl sm:rounded-3xl border border-orange-200 bg-white p-4 sm:p-6 shadow-sm d${Math.min(idx + 1, 5)}`}
                >
                  <div
                    style={{
                      background:
                        'linear-gradient(90deg,rgba(251,146,60,.12),transparent)',
                      borderRadius: '0.5rem',
                      padding: '0.3rem 0.75rem',
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700 flex items-center gap-1.5">
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
                      className="text-xs font-bold text-red-500 hover:text-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                      <p className="text-[10px] text-slate-500 font-medium">
                        Start Date
                      </p>
                      <p className="font-bold text-slate-900 text-xs mt-0.5">
                        {new Date(leave.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                      <p className="text-[10px] text-slate-500 font-medium">
                        End Date
                      </p>
                      <p className="font-bold text-slate-900 text-xs mt-0.5">
                        {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 mt-2">
                    <p className="text-[10px] text-slate-500 font-medium">
                      Reason
                    </p>
                    <p className="font-medium text-slate-800 text-xs mt-0.5">
                      {leave.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* === CREATE SCHEDULE MODAL === */}
        {createModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
            style={{
              background: 'rgba(10,22,40,0.6)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setCreateModalOpen(false);
            }}
          >
            <div className="modal-panel modal-scroll w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-teal-700 to-cyan-600 sm:px-6 sm:py-5">
                <h2 className="text-lg font-bold text-white sm:text-xl">
                  Add Schedule
                </h2>
                <p className="text-teal-100 text-xs mt-0.5 sm:text-sm">
                  Configure a new working day
                </p>
              </div>
              <div className="p-4 space-y-4 sm:p-6 sm:space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 sm:text-sm">
                    Select Day
                  </label>
                  {availableDays.length === 0 ? (
                    <p className="text-sm text-slate-500 bg-slate-50 rounded-2xl p-3 text-center">
                      All 7 days are already configured.
                    </p>
                  ) : (
                    <div className="days-grid">
                      {ALL_DAYS.map((day) => {
                        const isConfigured = configuredDays.includes(day);
                        const isSelected = createForm.dayOfWeek === day;
                        return (
                          <button
                            key={day}
                            disabled={isConfigured}
                            onClick={() =>
                              !isConfigured &&
                              setCreateForm({ ...createForm, dayOfWeek: day })
                            }
                            className={`day-chip ${isSelected ? 'selected' : ''}`}
                            style={
                              isConfigured
                                ? { opacity: 0.35, cursor: 'not-allowed' }
                                : {}
                            }
                          >
                            {DAY_SHORT[day]}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Start Time">
                    <input
                      type="time"
                      value={createForm.startTime}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          startTime: e.target.value,
                        })
                      }
                      className="rx-input"
                    />
                  </FormField>
                  <FormField label="End Time">
                    <input
                      type="time"
                      value={createForm.endTime}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          endTime: e.target.value,
                        })
                      }
                      className="rx-input"
                    />
                  </FormField>
                  <FormField label="Break Start">
                    <input
                      type="time"
                      value={createForm.breakStart}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          breakStart: e.target.value,
                        })
                      }
                      className="rx-input"
                    />
                  </FormField>
                  <FormField label="Break End">
                    <input
                      type="time"
                      value={createForm.breakEnd}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          breakEnd: e.target.value,
                        })
                      }
                      className="rx-input"
                    />
                  </FormField>
                </div>

                <FormField label="Slot Duration (minutes)">
                  <select
                    value={createForm.slotDuration}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        slotDuration: Number(e.target.value),
                      })
                    }
                    className="rx-input"
                  >
                    {[10, 15, 20, 30, 45, 60].map((m) => (
                      <option key={m} value={m}>
                        {m} minutes
                      </option>
                    ))}
                  </select>
                </FormField>

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    onClick={() => setCreateModalOpen(false)}
                    className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={creatingSchedule || !createForm.dayOfWeek}
                    onClick={async () => {
                      if (!createForm.dayOfWeek)
                        return toast.error('Please select a day');
                      setCreatingSchedule(true);
                      try {
                        await createSchedule(createForm);
                        toast.success('Schedule created successfully');
                        setCreateModalOpen(false);
                        setCreateForm(DEFAULT_SCHEDULE_FORM);
                        fetchData();
                      } catch (error) {
                        toast.error(
                          error?.response?.data?.message ||
                            'Failed to create schedule',
                        );
                      } finally {
                        setCreatingSchedule(false);
                      }
                    }}
                    className="btn-act rounded-2xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white flex items-center gap-2"
                    style={{ boxShadow: '0 4px 14px rgba(13,148,136,.3)' }}
                  >
                    {creatingSchedule && (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {creatingSchedule ? 'Creating…' : 'Create Schedule'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === EDIT SCHEDULE MODAL === */}
        {editModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
            style={{
              background: 'rgba(10,22,40,0.6)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditModalOpen(false);
            }}
          >
            <div className="modal-panel modal-scroll w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-teal-700 to-cyan-600 sm:px-6 sm:py-5">
                <h2 className="text-lg font-bold text-white capitalize sm:text-xl">
                  Edit — {selectedSchedule?.dayOfWeek}
                </h2>
                <p className="text-teal-100 text-xs mt-0.5 sm:text-sm">
                  Update working hours and break timings
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { label: 'Start Time', key: 'startTime', type: 'time' },
                    { label: 'End Time', key: 'endTime', type: 'time' },
                    { label: 'Break Start', key: 'breakStart', type: 'time' },
                    { label: 'Break End', key: 'breakEnd', type: 'time' },
                  ].map(({ label, key, type }) => (
                    <FormField key={key} label={label}>
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
                    </FormField>
                  ))}
                  <FormField label="Slot Duration (mins)">
                    <select
                      value={scheduleForm.slotDuration}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          slotDuration: Number(e.target.value),
                        })
                      }
                      className="rx-input"
                    >
                      {[10, 15, 20, 30, 45, 60].map((m) => (
                        <option key={m} value={m}>
                          {m} minutes
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
                <div className="mt-4 flex justify-end gap-3 sm:mt-5">
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
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
                    className="btn-act rounded-2xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white flex items-center gap-2"
                    style={{ boxShadow: '0 4px 14px rgba(13,148,136,.3)' }}
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
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
            style={{
              background: 'rgba(10,22,40,0.6)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setLeaveModalOpen(false);
            }}
          >
            <div className="modal-panel modal-scroll w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-teal-700 to-cyan-600 sm:px-6 sm:py-5">
                <h2 className="text-lg font-bold text-white sm:text-xl">
                  Apply Leave
                </h2>
                <p className="text-teal-100 text-xs mt-0.5 sm:text-sm">
                  Request time off from your schedule
                </p>
              </div>
              <div className="p-4 space-y-3 sm:p-6 sm:space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Start Date">
                    <input
                      type="date"
                      value={leaveForm.startDate}
                      onChange={(e) =>
                        setLeaveForm({
                          ...leaveForm,
                          startDate: e.target.value,
                        })
                      }
                      className="rx-input"
                    />
                  </FormField>
                  <FormField label="End Date">
                    <input
                      type="date"
                      value={leaveForm.endDate}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, endDate: e.target.value })
                      }
                      className="rx-input"
                    />
                  </FormField>
                </div>
                <FormField label="Reason">
                  <textarea
                    rows={3}
                    value={leaveForm.reason}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, reason: e.target.value })
                    }
                    className="rx-input resize-none"
                    placeholder="Briefly describe your reason…"
                  />
                </FormField>
                <div className="flex justify-end gap-3 pt-1">
                  <button
                    onClick={() => setLeaveModalOpen(false)}
                    className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
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
                        setLeaveForm(DEFAULT_LEAVE_FORM);
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
                    className="btn-act rounded-2xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white flex items-center gap-2"
                    style={{ boxShadow: '0 4px 14px rgba(13,148,136,.3)' }}
                  >
                    {applyingLeave && (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {applyingLeave ? 'Applying…' : 'Apply Leave'}
                  </button>
                </div>
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
              <div className="px-5 py-4 bg-gradient-to-r from-red-500 to-rose-600 sm:px-6 sm:py-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
                    <h2 className="text-base font-bold text-white sm:text-lg">
                      Appointments Found
                    </h2>
                    <p className="text-red-100 text-xs">Action required</p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="rounded-2xl bg-red-50 border border-red-200 p-3 mb-4">
                  <p className="font-bold text-red-800 text-sm sm:text-base">
                    {appointmentCount} appointment
                    {appointmentCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-red-700 text-xs sm:text-sm mt-0.5">
                    already booked during this leave period.
                  </p>
                </div>
                <p className="text-slate-600 text-sm">
                  Do you still want to apply this leave? This may affect your
                  patients.
                </p>
                <div className="mt-5 flex justify-end gap-3">
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
                    {forcingLeave ? 'Applying…' : 'Force Apply'}
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
