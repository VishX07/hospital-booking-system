/*
 * NotificationsPage.jsx — AlphaCare Design System
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
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

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

  .float-1 { animation:float1 5.5s ease-in-out infinite; }
  .float-2 { animation:float2 4.8s ease-in-out infinite .7s; }
  .float-3 { animation:float3 6.2s ease-in-out infinite 1.3s; }
  .pulse-dot { animation:pulseDot 2s ease-in-out infinite; }
  .spin-slow { animation:spinSlow 22s linear infinite; }
  .anim-fade-up { animation:fadeUp .55s ease both; }
  .card-in { animation:cardIn .5s ease both; }
  .item-in { animation:itemIn .35s cubic-bezier(.22,1,.36,1) both; }
  .d1{animation-delay:.04s} .d2{animation-delay:.08s} .d3{animation-delay:.12s}
  .d4{animation-delay:.16s} .d5{animation-delay:.20s}

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
  .glass-panel {
    background:rgba(255,255,255,0.6);
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
    border:1px solid rgba(255,255,255,0.75);
  }

  .notif-card {
    background:white;
    border-radius:1.25rem;
    border:1.5px solid #f1f5f9;
    padding:1rem 1.125rem;
    cursor:pointer;
    transition: box-shadow .2s, border-color .2s, transform .18s;
    position:relative;
    overflow:hidden;
  }
  .notif-card:hover {
    transform:translateY(-3px);
    box-shadow:0 8px 28px rgba(0,0,0,.08);
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

  .filter-chip {
    padding:.4rem 1rem;
    border-radius:9999px;
    font-size:.82rem;
    font-weight:700;
    cursor:pointer;
    border:1.5px solid #e2e8f0;
    background:white;
    color:#475569;
    transition: all .18s;
    white-space:nowrap;
    outline:none;
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
  .filter-chip.chip-inactive:hover {
    border-color:currentColor;
  }

  .btn-act {
    transition: transform .18s ease, box-shadow .18s ease;
  }
  .btn-act:hover:not(:disabled) { transform:translateY(-2px); }
  .btn-act:disabled { opacity:.6; cursor:not-allowed; }

  .mark-read-btn {
    padding:.35rem .875rem;
    border-radius:9999px;
    font-size:.75rem;
    font-weight:700;
    cursor:pointer;
    background:white;
    border:1.5px solid;
    transition: all .18s;
    white-space:nowrap;
    flex-shrink:0;
    outline:none;
  }
  .mark-read-btn:hover { transform:translateY(-1px); }
`;

/* === NOTIFICATION ILLUSTRATION === */
const NotificationIllustration = ({ isDoctor }) => {
  const accent = isDoctor ? '#0d9488' : '#2563eb';
  const light = isDoctor ? '#99f6e4' : '#c7d2fe';
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
        {/* Phone card */}
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
        {/* Bell icon */}
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
        {/* Notification rows */}
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

      {/* Badge 1 */}
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

      {/* Badge 2 */}
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

      {/* Badge 3 */}
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
          <div className="shimmer-bg rounded-3xl h-56" />
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
        {/* === HERO === */}
        <section
          className="relative overflow-hidden rounded-3xl px-8 py-10 shadow-xl anim-fade-up"
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
                Your{' '}
                <span style={{ color: isDoctor ? '#99f6e4' : '#c7d2fe' }}>
                  Notifications
                </span>
              </h1>
              <p
                className="mt-3 text-base max-w-md"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                Stay updated with your appointments, prescriptions and system
                alerts.
              </p>

              {/* Stat cards */}
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
                      style={{ color: isDoctor ? '#99f6e4' : '#c7d2fe' }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden lg:flex flex-shrink-0 h-64 w-72 items-center justify-center">
              <NotificationIllustration isDoctor={isDoctor} />
            </div>
          </div>
        </section>

        {/* === FILTER TOOLBAR === */}
        <div className="glass-panel rounded-2xl px-4 py-3 flex items-center justify-between flex-wrap gap-3 anim-fade-up">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All', icon: '📋' },
              { key: 'unread', label: 'Unread', icon: '🔵' },
              { key: 'read', label: 'Read', icon: '✓' },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`filter-chip ${filter === key ? chipActive : 'chip-inactive'}`}
                style={filter !== key ? { '--hover-color': primary } : {}}
              >
                {icon} {label}
                {key === 'unread' && unreadCount > 0 && (
                  <span
                    className="ml-1.5 rounded-full px-1.5 text-[11px]"
                    style={{
                      background:
                        filter === key ? 'rgba(255,255,255,0.25)' : primary,
                      color: filter === key ? 'white' : 'white',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            disabled={unreadCount === 0}
            onClick={handleMarkAllRead}
            className="btn-act rounded-2xl px-4 py-2 text-sm font-bold text-white flex items-center gap-2"
            style={{
              background: primaryDark,
              boxShadow: `0 4px 14px ${isDoctor ? 'rgba(13,148,136,.3)' : 'rgba(37,99,235,.3)'}`,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark All Read
          </button>
        </div>

        {/* === NOTIFICATION LIST === */}
        {filteredNotifications.length === 0 ? (
          /* Empty state */
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-5xl mb-4 float-2">🔕</div>
            <h3 className="text-xl font-bold text-slate-900">
              {filter === 'unread' ? 'All caught up!' : 'No notifications'}
            </h3>
            <p className="mt-2 text-slate-500 text-sm">
              {filter === 'unread'
                ? 'You have no unread notifications right now.'
                : 'Nothing to show here yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification, idx) => {
              const cfg = getTypeConfig(notification.type);
              return (
                <div
                  key={notification._id}
                  className={`item-in notif-card ${!notification.isRead ? unreadClass : ''}`}
                  style={{ animationDelay: `${idx * 0.04}s` }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {/* Type icon */}
                    <div
                      className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-lg mt-0.5"
                      style={{ background: cfg.bg }}
                    >
                      {cfg.emoji}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                        {!notification.isRead && (
                          <span
                            className="pulse-dot inline-block w-2 h-2 rounded-full"
                            style={{ background: primary }}
                          />
                        )}
                      </div>
                      <p className="font-bold text-slate-900 text-sm leading-snug">
                        {notification.title}
                      </p>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-slate-400 text-[11px] mt-1.5 font-medium">
                        {relativeTime(notification.createdAt)}
                        <span className="mx-1.5 text-slate-300">·</span>
                        {new Date(notification.createdAt).toLocaleString(
                          'en-IN',
                          {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </p>
                    </div>

                    {/* Mark read btn */}
                    {!notification.isRead && (
                      <button
                        className="mark-read-btn"
                        style={{
                          borderColor: isDoctor ? '#99f6e4' : '#c7d2fe',
                          color: primary,
                        }}
                        onClick={(e) => handleMarkRead(e, notification._id)}
                      >
                        Mark Read
                      </button>
                    )}

                    {/* Read checkmark */}
                    {notification.isRead && (
                      <div
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
                        style={{
                          background: '#f0fdf4',
                          border: '1.5px solid #bbf7d0',
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
              );
            })}
          </div>
        )}

        {/* Footer count */}
        {filteredNotifications.length > 0 && (
          <p className="text-center text-slate-400 text-xs font-medium pb-4">
            Showing {filteredNotifications.length} of {notifications.length}{' '}
            notifications
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
