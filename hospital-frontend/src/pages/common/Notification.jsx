/*
 * NotificationsPage.jsx — AlphaCare Design System
 * Mobile-first responsive redesign
 * Sections:
 *  1. Styles
 *  2. NotificationIllustration (hero SVG)
 *  3. relativeTime helper
 *  4. TYPE_CONFIG
 *  5. NotificationsPage
 *     5a. Loading Skeleton
 *     5b. Hero
 *     5c. Filter Toolbar
 *     5d. Notification List
 *     5e. Empty State
 */

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import {
  getNotifications,
  markAsRead,
  markAllRead,
} from '../../api/notification.api.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import useAuthStore from '../../store/auth.store.js';

/* === STYLES === */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

  .notif-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .notif-root h1, .notif-root h2, .notif-root h3 { font-family: 'Sora', sans-serif; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes float1 { 0%,100%{transform:translateY(0) rotate(-1.5deg)} 50%{transform:translateY(-12px) rotate(1.5deg)} }
  @keyframes float2 { 0%,100%{transform:translateY(0) rotate(1deg)} 50%{transform:translateY(-8px) rotate(-1deg)} }
  @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.6)} }
  @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes cardIn { from{opacity:0;transform:translateY(16px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes itemIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes heroSlide { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }

  .float-1 { animation:float1 5.5s ease-in-out infinite; }
  .float-2 { animation:float2 4.8s ease-in-out infinite .7s; }
  .float-3 { animation:float3 6.2s ease-in-out infinite 1.3s; }
  .pulse-dot { animation:pulseDot 2s ease-in-out infinite; }
  .spin-slow { animation:spinSlow 22s linear infinite; }
  .anim-fade-up { animation:fadeUp .55s ease both; }
  .card-in { animation:cardIn .5s ease both; }
  .item-in { animation:itemIn .35s cubic-bezier(.22,1,.36,1) both; }
  .hero-slide { animation:heroSlide .4s ease both; }

  .shimmer-bg {
    background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
    background-size:200% 100%;
    animation:shimmer 1.4s infinite;
  }
  .hero-glass {
    background:rgba(255,255,255,0.14);
    backdrop-filter:blur(10px);
    -webkit-backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,0.22);
  }
  .glass-panel {
    background:rgba(255,255,255,0.65);
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
    border:1px solid rgba(255,255,255,0.78);
  }

  /* ---- NOTIFICATION CARD ---- */
  .notif-card {
    background:white;
    border-radius:1.125rem;
    border:1.5px solid #f1f5f9;
    padding:.875rem 1rem;
    cursor:pointer;
    transition: box-shadow .2s, border-color .2s, transform .18s;
    position:relative;
    overflow:hidden;
  }
  .notif-card:hover {
    transform:translateY(-3px);
    box-shadow:0 8px 28px rgba(0,0,0,.08);
  }
  /* Touch devices: no hover lift, just subtle press */
  @media (hover: none) {
    .notif-card:hover { transform:none; box-shadow:none; }
    .notif-card:active { transform:scale(.985); box-shadow:0 2px 12px rgba(0,0,0,.07); }
  }
  .notif-card.unread-doctor {
    background:linear-gradient(135deg,#f0fdfa 0%,#ecfeff 100%);
    border-color:#99f6e4;
  }
  .notif-card.unread-doctor::before {
    content:'';
    position:absolute;
    left:0; top:0; bottom:0;
    width:4px;
    background:linear-gradient(180deg,#0d9488,#0891b2);
    border-radius:4px 0 0 4px;
  }
  .notif-card.unread-patient {
    background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);
    border-color:#c7d2fe;
  }
  .notif-card.unread-patient::before {
    content:'';
    position:absolute;
    left:0; top:0; bottom:0;
    width:4px;
    background:linear-gradient(180deg,#2563eb,#7c3aed);
    border-radius:4px 0 0 4px;
  }

  /* ---- FILTER CHIPS ---- */
  .filter-chip {
    padding:.4rem .875rem;
    border-radius:9999px;
    font-size:.8rem;
    font-weight:700;
    cursor:pointer;
    border:1.5px solid #e2e8f0;
    background:white;
    color:#475569;
    transition: all .18s;
    white-space:nowrap;
    outline:none;
    -webkit-tap-highlight-color:transparent;
    min-height:36px;
    display:inline-flex;
    align-items:center;
    gap:.3rem;
  }
  .filter-chip:hover { transform:translateY(-1px); }
  .filter-chip.chip-active-doctor {
    background:#0d9488;
    color:white;
    border-color:#0d9488;
    box-shadow:0 4px 14px rgba(13,148,136,.28);
    transform:translateY(-1px);
  }
  .filter-chip.chip-active-patient {
    background:#2563eb;
    color:white;
    border-color:#2563eb;
    box-shadow:0 4px 14px rgba(37,99,235,.28);
    transform:translateY(-1px);
  }

  .btn-act {
    transition: transform .18s ease, box-shadow .18s ease;
    -webkit-tap-highlight-color:transparent;
  }
  .btn-act:hover:not(:disabled) { transform:translateY(-2px); }
  .btn-act:disabled { opacity:.6; cursor:not-allowed; }

  .mark-read-btn {
    padding:.3rem .75rem;
    border-radius:9999px;
    font-size:.72rem;
    font-weight:700;
    cursor:pointer;
    background:white;
    border:1.5px solid;
    transition: all .18s;
    white-space:nowrap;
    flex-shrink:0;
    outline:none;
    -webkit-tap-highlight-color:transparent;
    min-height:32px;
    display:inline-flex;
    align-items:center;
  }
  .mark-read-btn:hover { transform:translateY(-1px); }

  /* ---- MOBILE HERO ---- */
  .hero-mobile {
    display:none;
  }
  .hero-desktop {
    display:block;
  }

  /* ---- MOBILE BOTTOM STAT BAR ---- */
  .stat-bar {
    display:flex;
    gap:.625rem;
    overflow-x:auto;
    -webkit-overflow-scrolling:touch;
    scrollbar-width:none;
    padding-bottom:2px;
  }
  .stat-bar::-webkit-scrollbar { display:none; }

  /* ---- FILTER SCROLL ---- */
  .filter-scroll {
    display:flex;
    gap:.5rem;
    overflow-x:auto;
    -webkit-overflow-scrolling:touch;
    scrollbar-width:none;
    padding-bottom:2px;
    flex:1;
  }
  .filter-scroll::-webkit-scrollbar { display:none; }

  /* ---- RESPONSIVE BREAKPOINTS ---- */
  @media (max-width: 767px) {
    .hero-desktop { display:none !important; }
    .hero-mobile { display:block !important; }
    .notif-root .p-6 { padding: .875rem !important; }
    .notif-root .space-y-6 > * + * { margin-top: .75rem !important; }

    /* Compact cards on mobile */
    .notif-card {
      padding:.75rem .875rem;
      border-radius:1rem;
    }
    /* Tighter font on mobile */
    .notif-card p.font-bold { font-size:.8rem !important; }
    .notif-card p.text-xs { font-size:.72rem !important; }
  }

  @media (max-width: 480px) {
    .notif-root .p-6 { padding:.75rem !important; }
  }
`;

/* === NOTIFICATION ILLUSTRATION (desktop only) === */
const NotificationIllustration = ({ isDoctor }) => {
  const accent = isDoctor ? '#0d9488' : '#2563eb';
  const grad1 = isDoctor ? '#0f766e' : '#1d4ed8';
  const grad2 = isDoctor ? '#0891b2' : '#4f46e5';

  return (
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
          <linearGradient id="nfHead" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={grad1} />
            <stop offset="100%" stopColor={grad2} />
          </linearGradient>
        </defs>
        <rect
          x="90"
          y="30"
          width="148"
          height="220"
          rx="22"
          fill="white"
          opacity="0.95"
        />
        <rect
          x="90"
          y="30"
          width="148"
          height="60"
          rx="22"
          fill="url(#nfHead)"
        />
        <rect x="90" y="72" width="148" height="18" fill="url(#nfHead)" />
        <path
          d="M155 48 C147 48 142 54 142 62 L140 74 H170 L168 62 C168 54 163 48 155 48Z"
          fill="rgba(255,255,255,0.25)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.2"
        />
        <path
          d="M150 74 C150 77 152 79 155 79 C158 79 160 77 160 74"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.2"
        />
        <text
          x="164"
          y="58"
          fill="white"
          fontSize="11"
          fontWeight="700"
          fontFamily="Sora,sans-serif"
        >
          Notifications
        </text>
        {[
          {
            emoji: '📅',
            label: 'Appointment',
            color: '#dbeafe',
            dot: '#3b82f6',
          },
          {
            emoji: '💊',
            label: 'Prescription',
            color: '#dcfce7',
            dot: '#22c55e',
          },
          {
            emoji: '🔔',
            label: 'System Alert',
            color: '#f3e8ff',
            dot: '#a855f7',
          },
          { emoji: '❌', label: 'Cancelled', color: '#fee2e2', dot: '#ef4444' },
        ].map(({ emoji, label, color, dot }, i) => (
          <g key={label}>
            <rect
              x="102"
              y={106 + i * 34}
              width="124"
              height="26"
              rx="8"
              fill={color}
              opacity="0.7"
            />
            <text x="114" y={123 + i * 34} fontSize="11">
              {emoji}
            </text>
            <text
              x="130"
              y={123 + i * 34}
              fill="#1e293b"
              fontSize="9"
              fontWeight="600"
              fontFamily="DM Sans,sans-serif"
            >
              {label}
            </text>
            <circle cx="218" cy={119 + i * 34} r="4" fill={dot} />
          </g>
        ))}
      </svg>

      <svg
        className="float-2 absolute"
        style={{ top: '6%', right: '0%', width: 96, height: 34 }}
        viewBox="0 0 96 34"
        fill="none"
      >
        <rect width="96" height="34" rx="10" fill="white" opacity="0.95" />
        <circle cx="14" cy="17" r="5" fill={accent} className="pulse-dot" />
        <text
          x="24"
          y="21"
          fill="#0f172a"
          fontSize="10"
          fontWeight="700"
          fontFamily="Sora,sans-serif"
        >
          3 Unread
        </text>
      </svg>

      <svg
        className="float-3 absolute"
        style={{ bottom: '14%', left: '0%', width: 88, height: 34 }}
        viewBox="0 0 88 34"
        fill="none"
      >
        <rect width="88" height="34" rx="10" fill={accent} opacity="0.9" />
        <text
          x="10"
          y="21"
          fill="white"
          fontSize="10"
          fontWeight="700"
          fontFamily="Sora,sans-serif"
        >
          All caught up
        </text>
      </svg>

      <svg
        className="float-1 absolute"
        style={{ bottom: '32%', right: '0%', width: 80, height: 34 }}
        viewBox="0 0 80 34"
        fill="none"
      >
        <rect width="80" height="34" rx="10" fill="white" opacity="0.95" />
        <text
          x="10"
          y="21"
          fill={accent}
          fontSize="10"
          fontWeight="700"
          fontFamily="Sora,sans-serif"
        >
          🔔 Live
        </text>
      </svg>
    </div>
  );
};

/* === HELPERS === */
const relativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

const TYPE_CONFIG = {
  appointment: {
    emoji: '📅',
    bg: '#eff6ff',
    color: '#1d4ed8',
    label: 'Appointment',
  },
  prescription: {
    emoji: '💊',
    bg: '#f0fdf4',
    color: '#15803d',
    label: 'Prescription',
  },
  cancelled: {
    emoji: '❌',
    bg: '#fff1f2',
    color: '#be123c',
    label: 'Cancelled',
  },
  system: { emoji: '🔔', bg: '#f5f3ff', color: '#6d28d9', label: 'System' },
};
const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.system;

/* === MAIN COMPONENT === */
const NotificationsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isDoctor = user?.role === 'doctor';

  const primary = isDoctor ? '#0d9488' : '#2563eb';
  const primaryDark = isDoctor ? '#0f766e' : '#1d4ed8';
  const heroBg = isDoctor
    ? 'linear-gradient(135deg, #0f766e 0%, #0d9488 40%, #0891b2 100%)'
    : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 40%, #4f46e5 100%)';
  const accentLight = isDoctor ? '#99f6e4' : '#c7d2fe';
  const chipActive = isDoctor ? 'chip-active-doctor' : 'chip-active-patient';
  const unreadClass = isDoctor ? 'unread-doctor' : 'unread-patient';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to load notifications',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n,
          ),
        );
      }
      const appointmentId = notification?.metadata?.appointmentId;
      if (appointmentId) {
        if (user.role === 'patient')
          navigate(`/patient/appointments/${appointmentId}`);
        else if (user.role === 'doctor')
          navigate(`/doctor/appointments/${appointmentId}`);
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch {
      toast.error('Failed to mark notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all read');
    }
  };

  const filteredNotifications = useMemo(() => {
    if (filter === 'read') return notifications.filter((n) => n.isRead);
    if (filter === 'unread') return notifications.filter((n) => !n.isRead);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* === LOADING SKELETON === */
  if (loading) {
    return (
      <DashboardLayout>
        <style>{styles}</style>
        <div className="notif-root min-h-screen bg-[#f0f5fb] p-6 space-y-6">
          <div className="shimmer-bg rounded-3xl h-44 md:h-56" />
          <div className="shimmer-bg rounded-2xl h-14" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white border border-slate-200 p-4 flex items-start gap-3"
              >
                <div className="shimmer-bg w-11 h-11 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer-bg h-3 w-24 rounded-full" />
                  <div className="shimmer-bg h-4 w-48 rounded-full" />
                  <div className="shimmer-bg h-3 w-64 rounded-full" />
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
      <div className="notif-root min-h-screen bg-[#f0f5fb] p-6 space-y-6">
        {/* ===== HERO — DESKTOP ===== */}
        <section
          className="hero-desktop relative overflow-hidden rounded-3xl px-8 py-10 shadow-xl anim-fade-up"
          style={{ background: heroBg }}
        >
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
          <div
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-5"
            style={{ background: 'white' }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-5"
            style={{ background: 'white' }}
          />
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
              <span
                className="inline-block rounded-full border bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] mb-4"
                style={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                Notification Center
              </span>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                Your <span style={{ color: accentLight }}>Notifications</span>
              </h1>
              <p
                className="mt-3 text-base max-w-md"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                Stay updated with your appointments, prescriptions and system
                alerts.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { label: 'Total', value: notifications.length },
                  { label: 'Unread', value: unreadCount },
                  { label: 'Read', value: notifications.length - unreadCount },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="hero-glass rounded-2xl px-5 py-3 min-w-[90px]"
                  >
                    <p className="text-2xl font-extrabold text-white">
                      {stat.value}
                    </p>
                    <p
                      className="text-xs font-medium mt-0.5"
                      style={{ color: accentLight }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex flex-shrink-0 h-64 w-72 items-center justify-center">
              <NotificationIllustration isDoctor={isDoctor} />
            </div>
          </div>
        </section>

        {/* ===== HERO — MOBILE (compact) ===== */}
        <section
          className="hero-mobile relative overflow-hidden rounded-2xl shadow-lg hero-slide"
          style={{ background: heroBg }}
        >
          {/* Subtle dot grid */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.06,
              backgroundImage:
                'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          {/* Glow orb top-right */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            }}
          />

          <div
            style={{
              position: 'relative',
              padding: '1.125rem 1.125rem .875rem',
            }}
          >
            {/* Top row: label + bell icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '.625rem',
              }}
            >
              <span
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  border: '1px solid rgba(255,255,255,0.28)',
                  borderRadius: '9999px',
                  padding: '.25rem .75rem',
                  fontSize: '.65rem',
                  fontWeight: 800,
                  letterSpacing: '.14em',
                  color: 'rgba(255,255,255,0.9)',
                  textTransform: 'uppercase',
                }}
              >
                Notification Center
              </span>
              {/* Live badge */}
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.3rem',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '9999px',
                  padding: '.2rem .625rem',
                  fontSize: '.7rem',
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: accentLight,
                    display: 'inline-block',
                    animation: 'pulseDot 2s ease-in-out infinite',
                  }}
                />
                Live
              </span>
            </div>

            {/* Heading */}
            <h1
              style={{
                fontFamily: 'Sora,sans-serif',
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.2,
                margin: '0 0 .25rem',
              }}
            >
              Your <span style={{ color: accentLight }}>Notifications</span>
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.72)',
                fontSize: '.78rem',
                margin: '0 0 .875rem',
              }}
            >
              Appointments, prescriptions &amp; alerts
            </p>

            {/* Stat pills — horizontal scroll */}
            <div className="stat-bar">
              {[
                { label: 'Total', value: notifications.length, icon: '📋' },
                {
                  label: 'Unread',
                  value: unreadCount,
                  icon: '🔵',
                  pulse: true,
                },
                {
                  label: 'Read',
                  value: notifications.length - unreadCount,
                  icon: '✓',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="hero-glass"
                  style={{
                    borderRadius: '1rem',
                    padding: '.5rem .875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.5rem',
                    flexShrink: 0,
                    minWidth: '80px',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: 'white',
                        lineHeight: 1,
                        margin: 0,
                      }}
                    >
                      {stat.value}
                    </p>
                    <p
                      style={{
                        fontSize: '.65rem',
                        fontWeight: 600,
                        color: accentLight,
                        margin: 0,
                        marginTop: '2px',
                      }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FILTER TOOLBAR ===== */}
        <div
          className="glass-panel rounded-2xl px-3 py-2.5 anim-fade-up"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.625rem',
            flexWrap: 'nowrap',
          }}
        >
          {/* Filter chips — scrollable */}
          <div className="filter-scroll">
            {[
              { key: 'all', label: 'All', icon: '📋' },
              { key: 'unread', label: 'Unread', icon: '🔵' },
              { key: 'read', label: 'Read', icon: '✓' },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`filter-chip ${filter === key ? chipActive : 'chip-inactive'}`}
              >
                {icon} {label}
                {key === 'unread' && unreadCount > 0 && (
                  <span
                    style={{
                      background:
                        filter === key ? 'rgba(255,255,255,0.25)' : primary,
                      color: 'white',
                      borderRadius: '9999px',
                      padding: '0 .4rem',
                      fontSize: '.68rem',
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mark all read — icon-only on mobile, full label on desktop */}
          <button
            disabled={unreadCount === 0}
            onClick={handleMarkAllRead}
            className="btn-act flex-shrink-0 rounded-xl"
            style={{
              background: primaryDark,
              color: 'white',
              border: 'none',
              padding: '.45rem .75rem',
              fontWeight: 700,
              fontSize: '.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '.3rem',
              boxShadow: isDoctor
                ? '0 4px 14px rgba(13,148,136,.3)'
                : '0 4px 14px rgba(37,99,235,.3)',
              cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
            }}
            title="Mark all as read"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {/* Hide text on small screens via inline media */}
            <span className="hidden sm:inline">Mark All</span>
          </button>
        </div>

        {/* ===== NOTIFICATION LIST ===== */}
        {filteredNotifications.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
            <div className="text-4xl mb-3 float-2">🔕</div>
            <h3 className="text-lg font-bold text-slate-900">
              {filter === 'unread' ? 'All caught up!' : 'No notifications'}
            </h3>
            <p className="mt-2 text-slate-500 text-sm">
              {filter === 'unread'
                ? 'You have no unread notifications right now.'
                : 'Nothing to show here yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredNotifications.map((notification, idx) => {
              const cfg = getTypeConfig(notification.type);
              return (
                <div
                  key={notification._id}
                  className={`item-in notif-card ${!notification.isRead ? unreadClass : ''}`}
                  style={{ animationDelay: `${idx * 0.04}s` }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '.75rem',
                    }}
                  >
                    {/* Type icon */}
                    <div
                      style={{
                        flexShrink: 0,
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '.75rem',
                        background: cfg.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        marginTop: '2px',
                      }}
                    >
                      {cfg.emoji}
                    </div>

                    {/* Body */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Type badge + unread dot */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '.4rem',
                          flexWrap: 'wrap',
                          marginBottom: '.25rem',
                        }}
                      >
                        <span
                          style={{
                            background: cfg.bg,
                            color: cfg.color,
                            borderRadius: '9999px',
                            padding: '.15rem .625rem',
                            fontSize: '.65rem',
                            fontWeight: 800,
                            letterSpacing: '.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {cfg.label}
                        </span>
                        {!notification.isRead && (
                          <span
                            className="pulse-dot"
                            style={{
                              display: 'inline-block',
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: primary,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>

                      <p
                        style={{
                          fontWeight: 700,
                          color: '#0f172a',
                          fontSize: '.82rem',
                          lineHeight: 1.35,
                          margin: '0 0 .2rem',
                        }}
                      >
                        {notification.title}
                      </p>
                      <p
                        style={{
                          color: '#64748b',
                          fontSize: '.74rem',
                          lineHeight: 1.5,
                          margin: '0 0 .3rem',
                        }}
                      >
                        {notification.message}
                      </p>

                      {/* Timestamp row */}
                      <p
                        style={{
                          color: '#94a3b8',
                          fontSize: '.68rem',
                          fontWeight: 500,
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '.3rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span>{relativeTime(notification.createdAt)}</span>
                        <span style={{ color: '#cbd5e1' }}>·</span>
                        <span>
                          {new Date(notification.createdAt).toLocaleString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </span>
                      </p>
                    </div>

                    {/* Right side actions */}
                    <div
                      style={{
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '.375rem',
                        marginTop: '2px',
                      }}
                    >
                      {!notification.isRead ? (
                        <button
                          className="mark-read-btn"
                          style={{
                            borderColor: isDoctor ? '#99f6e4' : '#c7d2fe',
                            color: primary,
                          }}
                          onClick={(e) => handleMarkRead(e, notification._id)}
                        >
                          ✓ Read
                        </button>
                      ) : (
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#f0fdf4',
                            border: '1.5px solid #bbf7d0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 14 14"
                            fill="none"
                            stroke="#16a34a"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <polyline points="2,7 5.5,10.5 12,3" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer count */}
        {filteredNotifications.length > 0 && (
          <p
            style={{
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '.72rem',
              fontWeight: 500,
              paddingBottom: '1rem',
            }}
          >
            Showing {filteredNotifications.length} of {notifications.length}{' '}
            notifications
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
