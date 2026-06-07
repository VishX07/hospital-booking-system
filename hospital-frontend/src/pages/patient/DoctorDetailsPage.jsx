import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { getDoctorById } from '../../api/doctor.api.js';
import { getDoctorSchedules } from '../../api/schedule.api.js';
import {
  bookAppointment,
  getAvailableSlots,
} from '../../api/appointment.api.js';
import { getDoctorReviews } from '../../api/review.api.js';
import toast from 'react-hot-toast';
import {
  createPaymentOrder,
  verifyPayment,
  bookOfflineAppointment,
} from '../../api/payment.api.js';
/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .dr-root { font-family: 'DM Sans', sans-serif; }
  .dr-root h1,.dr-root h2,.dr-root h3,.dr-root h4 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes float1 {
    0%,100% { transform:translateY(0) rotate(-1deg); }
    50%      { transform:translateY(-10px) rotate(1deg); }
  }
  @keyframes float2 {
    0%,100% { transform:translateY(0) rotate(1deg); }
    50%      { transform:translateY(-7px) rotate(-1deg); }
  }
  @keyframes pulse-ring {
    0%   { box-shadow:0 0 0 0 rgba(34,197,94,0.5); }
    70%  { box-shadow:0 0 0 10px rgba(34,197,94,0); }
    100% { box-shadow:0 0 0 0 rgba(34,197,94,0); }
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.5; transform:scale(1.4); }
  }
  @keyframes spin-slow {
    from { transform:rotate(0deg); }
    to   { transform:rotate(360deg); }
  }
  @keyframes wa-bounce {
    0%,100% { transform:scale(1); }
    30%      { transform:scale(1.08) translateY(-4px); }
    60%      { transform:scale(1.03) translateY(-1px); }
  }

  .anim-fade-up { animation:fadeUp .55s ease both; }
  .d1{animation-delay:.06s}.d2{animation-delay:.12s}
  .d3{animation-delay:.18s}.d4{animation-delay:.24s}

  .float-1 { animation:float1 5s ease-in-out infinite; }
  .float-2 { animation:float2 4.4s ease-in-out infinite .6s; }
  .float-3 { animation:float2 5.8s ease-in-out infinite 1.2s; }
  .spin-slow { animation:spin-slow 20s linear infinite; }
  .pulse-dot { animation:pulse-dot 2s ease-in-out infinite; }

  .info-card { transition:transform .22s ease,box-shadow .22s ease; }
  .info-card:hover { transform:translateY(-3px); box-shadow:0 12px 36px rgba(0,0,0,.08); }

  .slot-btn { transition:all .18s ease; }
  .slot-btn:hover:not(.slot-active) { transform:translateY(-2px); box-shadow:0 4px 14px rgba(59,130,246,.18); }

  .book-btn { transition:all .2s cubic-bezier(.34,1.3,.64,1); }
  .book-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 28px rgba(29,78,216,.35); background:#1d4ed8; }

  .review-card { transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease; }
  .review-card:hover { transform:translateX(3px); box-shadow:0 4px 18px rgba(59,130,246,.09); border-color:#bfdbfe; }

  .input-field { transition:all .18s ease; }
  .input-field:focus { background:white; border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.15); outline:none; }

  .type-tab { transition:all .18s ease; }
  .type-tab.active { background:#2563eb; color:white; box-shadow:0 4px 14px rgba(37,99,235,.3); transform:translateY(-1px); }

  .wa-fab {
    cursor:grab;
    animation:wa-bounce 3.5s ease-in-out infinite 2s;
    transition:box-shadow .2s ease;
  }
  .wa-fab:active { cursor:grabbing; animation:none; }
  .wa-fab.is-dragging { animation:none !important; cursor:grabbing; }
  .wa-pulse { animation:pulse-ring 2s ease-in-out infinite; }

  .field-pill { transition:background .16s ease; }
  .field-pill:hover { background:#f1f5f9; }
`;

/* ─── Default Avatar ──────────────────────────────────────────────────────── */
const palettes = [
  { bg: '#eff6ff', fg: '#1d4ed8', border: '#bfdbfe' },
  { bg: '#eef2ff', fg: '#4338ca', border: '#c7d2fe' },
  { bg: '#f0fdfa', fg: '#0f766e', border: '#99f6e4' },
  { bg: '#fdf4ff', fg: '#7e22ce', border: '#e9d5ff' },
  { bg: '#fff7ed', fg: '#c2410c', border: '#fed7aa' },
];

const DoctorAvatar = ({ src, name = '', className = '' }) => {
  const [err, setErr] = useState(false);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  const p = palettes[name.length % palettes.length];
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

/* ─── Stars ───────────────────────────────────────────────────────────────── */
const Stars = ({ rating, size = 'sm' }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        className={`${size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'} ${s <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

/* ─── Card wrapper ────────────────────────────────────────────────────────── */
const Card = ({ children, className = '', delay = '' }) => (
  <section
    className={`info-card anim-fade-up ${delay} rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
  >
    {children}
  </section>
);

/* ─── Section heading ─────────────────────────────────────────────────────── */
const SHead = ({ icon, title, sub }) => (
  <div className="mb-6 flex items-center gap-3">
    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
      {icon}
    </span>
    <div>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {sub && <p className="text-sm text-slate-500">{sub}</p>}
    </div>
  </div>
);

/* ─── Hero Illustration (doctor + floating badges) ────────────────────────── */
const HeroIllustration = () => (
  <div className="relative w-full h-full">
    {/* Doctor SVG */}
    <svg
      viewBox="0 0 260 230"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <ellipse
        cx="130"
        cy="195"
        rx="105"
        ry="32"
        fill="rgba(255,255,255,0.08)"
      />
      {/* Desk */}
      <rect
        x="48"
        y="165"
        width="164"
        height="12"
        rx="5"
        fill="rgba(255,255,255,0.22)"
      />
      {/* Laptop */}
      <rect
        x="72"
        y="112"
        width="116"
        height="53"
        rx="8"
        fill="white"
        opacity=".93"
      />
      <rect
        x="72"
        y="112"
        width="116"
        height="18"
        rx="8"
        fill="#1d4ed8"
        opacity=".85"
      />
      <rect
        x="64"
        y="163"
        width="132"
        height="5"
        rx="2.5"
        fill="rgba(255,255,255,0.28)"
      />
      {/* Screen content */}
      <line
        x1="82"
        y1="140"
        x2="164"
        y2="140"
        stroke="#e2e8f0"
        strokeWidth="1.8"
      />
      <line
        x1="82"
        y1="149"
        x2="148"
        y2="149"
        stroke="#e2e8f0"
        strokeWidth="1.8"
      />
      <rect x="82" y="155" width="36" height="5" rx="2.5" fill="#bfdbfe" />
      {/* Body */}
      <circle cx="130" cy="62" r="28" fill="#fde8d0" />
      {/* Hair */}
      <path
        d="M102,56 Q104,36 130,34 Q156,36 158,56 Q147,44 130,44 Q113,44 102,56z"
        fill="#374151"
        opacity=".85"
      />
      {/* White coat */}
      <rect
        x="108"
        y="87"
        width="44"
        height="52"
        rx="9"
        fill="white"
        opacity=".96"
      />
      <path
        d="M122,87 L116,108 L130,103 L144,108 L138,87"
        fill="#dbeafe"
        opacity=".9"
      />
      <line
        x1="130"
        y1="103"
        x2="130"
        y2="139"
        stroke="#93c5fd"
        strokeWidth="2"
        opacity=".5"
      />
      {/* Arms */}
      <rect x="94" y="90" width="16" height="38" rx="8" fill="#fde8d0" />
      <rect x="150" y="90" width="16" height="38" rx="8" fill="#fde8d0" />
      {/* Stethoscope */}
      <path
        d="M116,98 Q104,110 106,124 Q108,133 116,133"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle
        cx="116"
        cy="136"
        r="5.5"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2.2"
      />
      <circle cx="116" cy="136" r="2.5" fill="#3b82f6" opacity=".5" />
      {/* Face */}
      <circle cx="121" cy="59" r="3.5" fill="#374151" opacity=".7" />
      <circle cx="139" cy="59" r="3.5" fill="#374151" opacity=".7" />
      <path
        d="M121,71 Q130,77 139,71"
        fill="none"
        stroke="#374151"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity=".6"
      />
      {/* Name tag */}
      <rect x="120" y="143" width="20" height="13" rx="3.5" fill="#dbeafe" />
      <text
        x="123"
        y="152"
        fontFamily="sans-serif"
        fontSize="6"
        fill="#1d4ed8"
        fontWeight="700"
      >
        Dr.
      </text>
    </svg>

    {/* Badge 1 — Rating */}
    <svg
      viewBox="0 0 106 42"
      xmlns="http://www.w3.org/2000/svg"
      className="float-2 absolute top-0 right-0 w-28"
      aria-hidden="true"
    >
      <rect width="106" height="42" rx="12" fill="white" opacity=".95" />
      <rect
        width="106"
        height="42"
        rx="12"
        fill="none"
        stroke="#fde68a"
        strokeWidth="1"
      />
      <text
        x="10"
        y="14"
        fontFamily="sans-serif"
        fontSize="6.5"
        fill="#78716c"
        fontWeight="600"
      >
        PATIENT RATING
      </text>
      <text
        x="10"
        y="33"
        fontFamily="sans-serif"
        fontSize="14"
        fill="#d97706"
        fontWeight="800"
      >
        ★ 4.9
      </text>
      <text x="48" y="33" fontFamily="sans-serif" fontSize="7.5" fill="#78716c">
        / 5.0
      </text>
      <rect x="74" y="24" width="24" height="12" rx="5" fill="#dcfce7" />
      <text
        x="76"
        y="33"
        fontFamily="sans-serif"
        fontSize="7"
        fill="#15803d"
        fontWeight="700"
      >
        Top 5%
      </text>
    </svg>

    {/* Badge 2 — Verified */}
    <svg
      viewBox="0 0 112 38"
      xmlns="http://www.w3.org/2000/svg"
      className="float-3 absolute bottom-6 left-0 w-28"
      aria-hidden="true"
    >
      <rect width="112" height="38" rx="11" fill="white" opacity=".93" />
      <rect
        width="112"
        height="38"
        rx="11"
        fill="none"
        stroke="#bbf7d0"
        strokeWidth="1"
      />
      <circle cx="18" cy="19" r="9" fill="#dcfce7" />
      <path
        d="M13,19 l4,4 7-7"
        stroke="#16a34a"
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
        fill="#15803d"
        fontWeight="700"
      >
        VERIFIED MD
      </text>
      <text x="32" y="28" fontFamily="sans-serif" fontSize="7" fill="#64748b">
        Board Certified
      </text>
    </svg>

    {/* Badge 3 — Online */}
    <svg
      viewBox="0 0 98 36"
      xmlns="http://www.w3.org/2000/svg"
      className="float-1 absolute top-14 left-0 w-24"
      style={{ animationDelay: '1.1s' }}
      aria-hidden="true"
    >
      <rect width="98" height="36" rx="10" fill="white" opacity=".92" />
      <rect
        width="98"
        height="36"
        rx="10"
        fill="none"
        stroke="#e0f2fe"
        strokeWidth="1"
      />
      <circle cx="15" cy="18" r="5" fill="#22c55e" className="pulse-dot" />
      <text
        x="26"
        y="14"
        fontFamily="sans-serif"
        fontSize="7.5"
        fill="#0f172a"
        fontWeight="700"
      >
        AVAILABLE
      </text>
      <text x="26" y="27" fontFamily="sans-serif" fontSize="6.5" fill="#64748b">
        Online · Today
      </text>
    </svg>
  </div>
);

/* ─── Draggable WhatsApp button ───────────────────────────────────────────── */
const DraggableWhatsApp = ({ phone }) => {
  const ref = useRef(null);
  const state = useRef({
    down: false,
    moved: false,
    ox: 0,
    oy: 0,
    sx: 0,
    sy: 0,
  });
  const [pos, setPos] = useState({
    x: window.innerWidth - 80,
    y: window.innerHeight - 90,
  });

  useEffect(() => {
    const move = (e) => {
      if (!state.current.down) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = cx - state.current.sx;
      const dy = cy - state.current.sy;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) state.current.moved = true;
      setPos({
        x: Math.max(
          12,
          Math.min(window.innerWidth - 68, state.current.ox + dx),
        ),
        y: Math.max(
          12,
          Math.min(window.innerHeight - 68, state.current.oy + dy),
        ),
      });
    };
    const up = () => {
      if (!state.current.down) return;
      state.current.down = false;
      ref.current?.classList.remove('is-dragging');
      if (!state.current.moved)
        window.open(`https://wa.me/+91${phone}`, '_blank', 'noreferrer');
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [phone]);

  const down = (e) => {
    e.preventDefault();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    state.current = {
      down: true,
      moved: false,
      ox: pos.x,
      oy: pos.y,
      sx: cx,
      sy: cy,
    };
    ref.current?.classList.add('is-dragging');
  };

  return (
    <div
      ref={ref}
      onMouseDown={down}
      onTouchStart={down}
      className="wa-fab wa-pulse fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white select-none"
      style={{
        left: pos.x,
        top: pos.y,
        boxShadow: '0 8px 30px rgba(34,197,94,0.5)',
      }}
      title="Chat on WhatsApp · drag to move"
      aria-label="Contact on WhatsApp"
    >
      <svg
        className="h-7 w-7"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M20.52 3.48A11.86 11.86 0 0012.09 0C5.52 0 .18 5.34.18 11.91c0 2.1.55 4.15 1.6 5.96L.08 24l6.28-1.65a11.9 11.9 0 005.73 1.46h.01c6.57 0 11.91-5.34 11.91-11.91a11.86 11.86 0 00-3.49-8.42zM12.1 21.8h-.01a9.88 9.88 0 01-5.04-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.87 9.87 0 01-1.52-5.28c0-5.46 4.44-9.9 9.91-9.9a9.84 9.84 0 017 2.9 9.85 9.85 0 012.9 7c-.01 5.45-4.45 9.89-9.91 9.89zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
      </svg>
      {/* drag hint chip */}
      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
        <svg
          className="h-3 w-3 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
          />
        </svg>
      </span>
    </div>
  );
};

/* ─── Main Page ───────────────────────────────────────────────────────────── */
const DoctorDetailsPage = () => {
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consType, setConsType] = useState('online');
  const [reason, setReason] = useState('');
  const [bookLoading, setBookLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [leaveMessage, setLeaveMessage] = useState('');
  const [paymentMode, setPaymentMode] = useState('online'); // 'online' | 'offline'

  useEffect(() => {
    fetchDoctor();
    fetchSchedules();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    setPaymentMode('online');
  }, [consType]);

  const fetchDoctor = async () => {
    try {
      const r = await getDoctorById(id);
      setDoctor(r.data.doctor);
    } catch (e) {
      console.log(e);
    }
  };
  const fetchReviews = async () => {
    try {
      const r = await getDoctorReviews(id);
      setReviews(r.data.reviews);
      setAvgRating(r.data.averageRating);
      setTotalReviews(r.data.totalReviews);
    } catch (e) {
      console.log(e);
    }
  };
  const fetchSchedules = async () => {
    try {
      const r = await getDoctorSchedules(id);
      setSchedules(r.data.schedules);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const generateSlots = async (date) => {
    try {
      setSelectedDate(date);

      setSelectedSlot('');

      const response = await getAvailableSlots(id, date);
      setLeaveMessage(response.data.message);
      setSlots(response.data.slots || []);
    } catch (error) {
      setSlots([]);

      toast.error(error?.response?.data?.message || 'Failed to fetch slots');
    }
  };

  // const handleBooking = async () => {
  //   if (!selectedDate) return toast.error('Select a date');
  //   if (!selectedSlot) return toast.error('Select a time slot');
  //   if (!reason) return toast.error('Enter reason for visit');
  //   try {
  //     setBookLoading(true);
  //     await bookAppointment({
  //       doctorId: id,
  //       appointmentDate: selectedDate,
  //       timeSlot: selectedSlot,
  //       consultationType: consType,
  //       reasonForVisit: reason,
  //     });
  //     toast.success('Appointment booked successfully!');
  //     setSelectedSlot('');
  //     setReason('');
  //     setSelectedDate('');
  //     setSlots([]);
  //   } catch (e) {
  //     toast.error(e?.response?.data?.message || 'Booking failed');
  //   } finally {
  //     setBookLoading(false);
  //   }
  // };

  const handleBooking = async () => {
    if (!selectedDate) return toast.error('Select a date');
    if (!selectedSlot) return toast.error('Select a time slot');
    if (!reason) return toast.error('Enter reason for visit');

    const appointmentData = {
      doctorId: id,
      appointmentDate: selectedDate,
      timeSlot: selectedSlot,
      consultationType: consType,
      reasonForVisit: reason,
    };

    try {
      setBookLoading(true);

      /* ── Path A: Pay at Clinic ── */
      if (consType === 'offline' && paymentMode === 'clinic') {
        await bookOfflineAppointment(appointmentData);
        toast.success('Appointment booked! Please pay at the clinic.');
        setSelectedSlot('');
        setReason('');
        setSelectedDate('');
        setSlots([]);
        return;
      }

      /* ── Path B: Online Payment via Razorpay ── */
      const { data } = await createPaymentOrder(id);

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: 'AlphaCare',
        description: `Consultation with Dr. ${doctor?.userId?.fullName}`,
        theme: { color: '#0d9488' },

        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentData,
            });
            toast.success('Appointment booked & payment successful!');
            setSelectedSlot('');
            setReason('');
            setSelectedDate('');
            setSlots([]);
          } catch (err) {
            toast.error(
              err?.response?.data?.message || 'Booking failed after payment',
            );
          }
        },

        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setBookLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setBookLoading(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center bg-[#f0f5fb]">
          <div className="rounded-3xl border border-slate-200 bg-white px-10 py-9 text-center shadow-md">
            <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="text-sm font-semibold text-slate-500 tracking-wide">
              Loading doctor profile…
            </p>
          </div>
        </div>
      </DashboardLayout>
    );

  const docName = doctor?.userId?.fullName || '';

  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="dr-root min-h-screen bg-[#f0f5fb] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* ── HERO ────────────────────────────────────────────────────────── */}
          <div className="anim-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 shadow-2xl">
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
            {/* spinning ring */}
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

            <div className="relative flex flex-col gap-6 px-8 py-10 md:flex-row md:items-center md:px-10">
              {/* Left — doctor info */}
              <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-center">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="h-28 w-28 overflow-hidden rounded-3xl ring-4 ring-white/40 shadow-xl">
                    <DoctorAvatar
                      src={doctor?.userId?.profilePicture}
                      name={docName}
                      className="h-full w-full rounded-3xl"
                    />
                  </div>
                  <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg ring-2 ring-white">
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
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </div>

                {/* Text */}
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                      Verified Doctor
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold capitalize text-white backdrop-blur-sm">
                      {doctor?.consultationMode}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                      {doctor?.department?.name}
                    </span>
                  </div>
                  <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                    Dr. {docName}
                  </h1>
                  <p className="mt-1 text-base font-semibold text-blue-200">
                    {doctor?.specialization}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 backdrop-blur-sm">
                      <svg
                        className="h-4 w-4 text-blue-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                        />
                      </svg>
                      <span className="text-sm font-semibold text-white">
                        {doctor?.qualification}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 backdrop-blur-sm">
                      <svg
                        className="h-4 w-4 text-blue-200"
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
                      <span className="text-sm font-semibold text-white">
                        {doctor?.experience} yrs exp.
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-400/20 px-4 py-2 backdrop-blur-sm">
                      <Stars rating={avgRating} />
                      <span className="text-sm font-bold text-amber-300">
                        {avgRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-blue-200">
                        ({totalReviews})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — fee + illustration */}
              <div className="flex flex-col items-start gap-4 lg:items-end">
                <div className="rounded-2xl bg-white/15 px-6 py-5 backdrop-blur-md ring-1 ring-white/20">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                    Consultation Fee
                  </p>
                  <p className="mt-1 text-4xl font-extrabold text-white">
                    ₹{doctor?.consultationFee}
                  </p>
                  <p className="mt-1 text-xs capitalize text-blue-200">
                    {doctor?.consultationMode} · available now
                  </p>
                </div>
                <div className="hidden h-44 w-52 lg:block relative">
                  <HeroIllustration />
                </div>
              </div>
            </div>
          </div>

          {/* ── BODY ────────────────────────────────────────────────────────── */}
          <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
            {/* Left column */}
            <div className="space-y-6">
              {/* About */}
              <Card delay="d1">
                <SHead
                  title="About Doctor"
                  sub="Professional background and expertise"
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
                <p className="text-sm leading-7 text-slate-600">
                  {doctor?.bio}
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { l: 'Qualification', v: doctor?.qualification },
                    { l: 'Department', v: doctor?.department?.name },
                    { l: 'Specialization', v: doctor?.specialization },
                    { l: 'Experience', v: `${doctor?.experience} years` },
                  ].map((f) => (
                    <div
                      key={f.l}
                      className="field-pill rounded-2xl bg-slate-50 p-4"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {f.l}
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-slate-800">
                        {f.v || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Date & Slots */}
              <Card delay="d2">
                <SHead
                  title="Select Appointment"
                  sub="Choose a date and available time slot"
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
                <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                  {/* Date */}
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-800">
                      Choose Date
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => generateSlots(e.target.value)}
                      className="input-field h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700"
                    />
                    {selectedDate && (
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                    )}
                  </div>
                  {/* Slots */}
                  <div>
                    <h3 className="mb-3 text-sm font-bold text-slate-800">
                      Available Slots
                      {availableSlots.length > 0 && (
                        <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                          {availableSlots.length} open
                        </span>
                      )}
                    </h3>
                    {!selectedDate ? (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                        <svg
                          className="mb-2 h-8 w-8 text-slate-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 21h15a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6.75V19.5A1.5 1.5 0 004.5 21z"
                          />
                        </svg>
                        <p className="text-sm text-slate-400">
                          Pick a date to see slots
                        </p>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50 py-10 text-center">
                        <p className="text-sm font-semibold text-red-500">
                          {leaveMessage ===
                          'Doctor is on leave on selected date'
                            ? 'Doctor is on leave on selected date'
                            : 'No Slots Today'}
                        </p>
                        <p className="mt-1 text-xs text-red-400">
                          Try a different date
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`slot-btn h-11 rounded-2xl border text-sm font-bold ${selectedSlot === slot ? 'slot-active border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Booking form */}
              <Card delay="d3">
                <SHead
                  title="Book Appointment"
                  sub="Add consultation preference and visit reason"
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
                <div className="space-y-5">
                  {/* Type tabs */}
                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-800">
                      Consultation Type
                    </label>
                    <div className="inline-flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                      {['online', 'offline'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setConsType(t)}
                          className={`type-tab inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold capitalize ${consType === t ? 'active' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {t === 'online' ? (
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
                                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                              />
                            </svg>
                          ) : (
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
                                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                              />
                            </svg>
                          )}
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Reason */}
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-800">
                      Reason For Visit
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                      placeholder="Describe your symptoms or reason for visiting…"
                      className="input-field w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400"
                    />
                    <p className="mt-1 text-right text-xs text-slate-400">
                      {reason.length} chars
                    </p>
                  </div>
                </div>
              </Card>

              {/* Reviews */}
              <Card delay="d4">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Patient Reviews
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Feedback from verified patients
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3">
                    <Stars rating={avgRating} size="lg" />
                    <div>
                      <p className="text-lg font-extrabold leading-none text-amber-700">
                        {avgRating.toFixed(1)}
                      </p>
                      <p className="text-xs text-amber-600">
                        {totalReviews} reviews
                      </p>
                    </div>
                  </div>
                </div>
                {reviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
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
                        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                      />
                    </svg>
                    <p className="text-sm font-semibold text-slate-600">
                      No reviews yet
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Be the first after your consultation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev, i) => (
                      <div
                        key={rev._id}
                        className="review-card anim-fade-up rounded-2xl border border-slate-100 bg-slate-50 p-4"
                        style={{ animationDelay: `${0.05 + i * 0.06}s` }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-2xl ring-1 ring-slate-200">
                              <DoctorAvatar
                                src={rev?.patientId?.profilePicture}
                                name={rev?.patientId?.fullName || '?'}
                                className="h-full w-full rounded-2xl"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {rev?.patientId?.fullName}
                              </p>
                              <Stars rating={rev.rating} />
                            </div>
                          </div>
                          <span className="flex-shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                            {rev.rating}/5
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right sidebar */}
            <aside className="space-y-6 xl:sticky xl:top-24 xl:h-fit">
              {/* Summary */}
              <Card
                delay="d2"
                className="shadow-[0_16px_48px_rgba(15,23,42,0.1)]"
              >
                <SHead
                  title="Appointment Summary"
                  sub="Review before confirming"
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
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                />

                {/* Doctor mini card */}
                <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl ring-2 ring-white shadow">
                    <DoctorAvatar
                      src={doctor?.userId?.profilePicture}
                      name={docName}
                      className="h-full w-full rounded-2xl"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-900">
                      Dr. {docName}
                    </h3>
                    <p className="mt-0.5 text-sm font-medium text-blue-700">
                      {doctor?.specialization}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Stars rating={avgRating} />
                      <span className="text-xs text-slate-500">
                        {avgRating.toFixed(1)} ({totalReviews})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary rows */}
                <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                  {[
                    { label: 'Consultation', val: consType, cap: true },
                    {
                      label: 'Date',
                      val: selectedDate
                        ? new Date(selectedDate).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—',
                    },
                    { label: 'Time Slot', val: selectedSlot || '—' },
                  ].map((r) => (
                    <div
                      key={r.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-sm text-slate-500">{r.label}</span>
                      <span
                        className={`text-sm font-bold text-slate-900 ${r.cap ? 'capitalize' : ''}`}
                      >
                        {r.val}
                      </span>
                    </div>
                  ))}
                  {/* Fee */}
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-4">
                    <span className="text-sm font-bold text-blue-200">
                      Total Fee
                    </span>
                    <span className="text-2xl font-extrabold text-white">
                      ₹{doctor?.consultationFee}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5 flex items-center gap-2">
                  {[
                    { label: 'Date', done: !!selectedDate },
                    { label: 'Slot', done: !!selectedSlot },
                    { label: 'Reason', done: !!reason },
                  ].map((step) => (
                    <div
                      key={step.label}
                      className="flex flex-1 flex-col items-center gap-1"
                    >
                      <div
                        className={`h-1.5 w-full rounded-full transition-all duration-300 ${step.done ? 'bg-blue-600' : 'bg-slate-200'}`}
                      />
                      <span
                        className={`text-[10px] font-bold ${step.done ? 'text-blue-600' : 'text-slate-400'}`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                {/* ── Payment Method Selector (offline consultations only) ── */}
                {consType === 'offline' && (
                  <div className="mt-5">
                    <label className="block text-sm font-bold text-slate-800 mb-3">
                      Payment Method
                    </label>
                    <div className="flex gap-3">
                      {/* Online */}
                      <button
                        type="button"
                        onClick={() => setPaymentMode('online')}
                        className={`flex-1 flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all ${
                          paymentMode === 'online'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-blue-200'
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                            paymentMode === 'online'
                              ? 'bg-blue-600'
                              : 'bg-slate-100'
                          }`}
                        >
                          <svg
                            className={`h-5 w-5 ${paymentMode === 'online' ? 'text-white' : 'text-slate-500'}`}
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
                        </div>
                        <div className="text-left">
                          <p
                            className={`text-sm font-bold ${paymentMode === 'online' ? 'text-blue-700' : 'text-slate-700'}`}
                          >
                            Pay Online
                          </p>
                        </div>
                        {paymentMode === 'online' && (
                          <svg
                            className="ml-auto h-5 w-5 text-blue-600 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                      </button>

                      {/* Pay at Clinic */}
                      <button
                        type="button"
                        onClick={() => setPaymentMode('clinic')}
                        className={`flex-1 flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all ${
                          paymentMode === 'clinic'
                            ? 'border-teal-600 bg-teal-50'
                            : 'border-slate-200 bg-white hover:border-teal-200'
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                            paymentMode === 'clinic'
                              ? 'bg-teal-600'
                              : 'bg-slate-100'
                          }`}
                        >
                          <svg
                            className={`h-5 w-5 ${paymentMode === 'clinic' ? 'text-white' : 'text-slate-500'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21"
                            />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p
                            className={`text-sm font-bold ${paymentMode === 'clinic' ? 'text-teal-700' : 'text-slate-700'}`}
                          >
                            Pay at Clinic
                          </p>
                        </div>
                        {paymentMode === 'clinic' && (
                          <svg
                            className="ml-auto h-5 w-5 text-teal-600 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={bookLoading}
                  className="book-btn mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bookLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Confirming…
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Confirm Appointment
                    </>
                  )}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
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
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                  Secure &amp; encrypted booking
                </p>
              </Card>

              {/* Contact */}
              <Card delay="d3">
                <h2 className="mb-5 text-lg font-bold text-slate-900">
                  Contact Information
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      l: 'Email',
                      v: doctor?.userId?.email,
                      icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
                    },
                    {
                      l: 'Phone',
                      v: doctor?.userId?.phoneNumber,
                      icon: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z',
                    },
                  ].map((f) => (
                    <div
                      key={f.l}
                      className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 transition hover:bg-blue-50/50"
                    >
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
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
                            d={f.icon}
                          />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {f.l}
                        </p>
                        <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                          {f.v || '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </div>

      {/* Draggable WhatsApp */}
      {doctor?.userId?.phoneNumber && (
        <DraggableWhatsApp phone={doctor.userId.phoneNumber} />
      )}
    </DashboardLayout>
  );
};

export default DoctorDetailsPage;
