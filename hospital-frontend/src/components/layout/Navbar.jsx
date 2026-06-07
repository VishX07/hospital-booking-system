import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getNotifications,
  markAsRead,
  markAllRead,
} from '../../api/notification.api.js';
import useAuthStore from '../../store/auth.store.js';
import { updateProfilePhoto } from '../../api/user.api.js';
import ROUTES from '../../constants/routes.js';

/* ─────────────────────────────────────────────
   Role-based design tokens
───────────────────────────────────────────── */
const ROLE_TOKENS = {
  doctor: {
    accent: '#0d9488',
    accentLight: '#f0fdfa',
    accentMid: '#ccfbf1',
    accentText: '#0f766e',
    accentRing: 'rgba(13,148,136,0.18)',
    dot: '#0d9488',
    gradient: 'from-teal-500 to-cyan-500',
    badgeBg: '#f0fdfa',
    badgeBorder: '#99f6e4',
    badgeText: '#0f766e',
    avatarBg: 'linear-gradient(135deg,#0d9488,#06b6d4)',
  },
  patient: {
    accent: '#2563eb',
    accentLight: '#eff6ff',
    accentMid: '#dbeafe',
    accentText: '#1d4ed8',
    accentRing: 'rgba(37,99,235,0.18)',
    dot: '#2563eb',
    gradient: 'from-blue-500 to-indigo-500',
    badgeBg: '#eff6ff',
    badgeBorder: '#bfdbfe',
    badgeText: '#1d4ed8',
    avatarBg: 'linear-gradient(135deg,#2563eb,#6366f1)',
  },
  admin: {
    accent: '#7c3aed',
    accentLight: '#f5f3ff',
    accentMid: '#ede9fe',
    accentText: '#6d28d9',
    accentRing: 'rgba(124,58,237,0.18)',
    dot: '#7c3aed',
    gradient: 'from-violet-500 to-purple-500',
    badgeBg: '#f5f3ff',
    badgeBorder: '#ddd6fe',
    badgeText: '#6d28d9',
    avatarBg: 'linear-gradient(135deg,#7c3aed,#a855f7)',
  },
};

function getRoleTokens(role) {
  return ROLE_TOKENS[role] || ROLE_TOKENS.patient;
}

/* ─────────────────────────────────────────────
   Icons
───────────────────────────────────────────── */
const BellIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a3 3 0 11-5.714 0"
    />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
    />
  </svg>
);

const MenuIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

const SettingsIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.654.85.196.095.388.196.576.304.325.188.72.202 1.052.047l1.168-.544a1.125 1.125 0 011.45.478l1.296 2.247a1.125 1.125 0 01-.256 1.465l-.955.784c-.293.241-.438.613-.431.992a7.723 7.723 0 010 .712c-.007.379.138.751.431.992l.955.784c.431.354.54.971.256 1.465l-1.296 2.247a1.125 1.125 0 01-1.45.478l-1.168-.544c-.332-.155-.727-.141-1.052.047a6.498 6.498 0 01-.576.304c-.341.164-.591.476-.654.85l-.213 1.281c-.09.542-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.654-.85a6.498 6.498 0 01-.576-.304c-.325-.188-.72-.202-1.052-.047l-1.168.544a1.125 1.125 0 01-1.45-.478l-1.296-2.247a1.125 1.125 0 01.256-1.465l.955-.784c.293-.241.438-.613.431-.992a7.723 7.723 0 010-.712c.007-.379-.138-.751-.431-.992l-.955-.784a1.125 1.125 0 01-.256-1.465l1.296-2.247a1.125 1.125 0 011.45-.478l1.168.544c.332.155.727.141 1.052-.047.188-.108.38-.209.576-.304.341-.164.591-.476.654-.85l.213-1.281z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

const LogoutIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
    />
  </svg>
);

const CameraIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.827 6.175A2.31 2.31 0 019.186 4.5h5.628a2.31 2.31 0 012.359 1.675l.22.774a1.125 1.125 0 001.081.801h.151A2.625 2.625 0 0121.25 10.375v6A2.625 2.625 0 0118.625 19h-13.25A2.625 2.625 0 012.75 16.375v-6A2.625 2.625 0 015.375 7.75h.151a1.125 1.125 0 001.081-.801l.22-.774z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 13.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
    />
  </svg>
);

const SpinnerIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

/* ─────────────────────────────────────────────
   Avatar
───────────────────────────────────────────── */
function Avatar({ user, size = 'md', tokens, showRing = false }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-[72px] w-[72px] text-2xl',
  };
  const ringClass = showRing ? 'ring-[3px] ring-white shadow-lg' : '';
  return user?.profilePicture ? (
    <img
      src={user.profilePicture}
      alt={user.fullName || 'User'}
      className={`${sizes[size]} ${ringClass} rounded-2xl object-cover flex-shrink-0`}
      style={size === 'lg' ? { borderRadius: '20px' } : {}}
    />
  ) : (
    <div
      className={`${sizes[size]} ${ringClass} rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{
        background: tokens.avatarBg,
        borderRadius: size === 'lg' ? '20px' : undefined,
      }}
    >
      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Notification Panel
───────────────────────────────────────────── */
function NotificationPanel({
  notifications,
  notificationsLoading,
  unreadCount,
  onMarkAllRead,
  onNotificationClick,
  onViewAll,
}) {
  return (
    <div
      className="notification-panel md:mr-0 mr-4 mt-3 absolute right-0 mt-3 w-[320px] xs:w-[360px] sm:w-[380px] overflow-hidden bg-white border border-slate-200/80 shadow-[0_32px_80px_rgba(15,23,42,0.14)]"
      style={{
        borderRadius: '20px',
        transformOrigin: 'top right',
        maxWidth: 'calc(100vw - 1rem)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">
            Notifications
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            View all
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[400px] overflow-y-auto overscroll-contain">
        {notificationsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <SpinnerIcon className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-sm text-slate-400 font-medium">Loading…</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
              <BellIcon className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              No notifications yet
            </p>
            <p className="text-xs text-slate-400 mt-1.5">
              Appointment updates will appear here.
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {notifications.map((notification) => {
              const isUnread = !notification?.isRead && !notification?.read;
              return (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => onNotificationClick(notification)}
                  className={`w-full flex gap-3.5 px-4 py-3.5 rounded-xl text-left transition-all duration-150 ${
                    isUnread
                      ? 'bg-blue-50/70 hover:bg-blue-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1.5">
                    <span
                      className={`block h-2 w-2 rounded-full transition-colors ${isUnread ? 'bg-blue-500' : 'bg-slate-300'}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                      {notification?.title || 'Notification'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {notification?.message ||
                        notification?.description ||
                        'You have a new notification.'}
                    </p>
                    {notification?.createdAt && (
                      <p className="mt-2 text-[11px] text-slate-400 font-medium">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Profile Dropdown
───────────────────────────────────────────── */
function ProfileDropdown({
  user,
  tokens,
  uploadingPhoto,
  onPhotoClick,
  fileInputRef,
  onPhotoChange,
  onSettings,
  onChangePassword,
  onLogout,
}) {
  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div
      className="profile-dropdown absolute right-0 mt-3 w-[300px] overflow-hidden bg-white border border-slate-200/80 shadow-[0_32px_80px_rgba(15,23,42,0.14)]"
      style={{ borderRadius: '20px', transformOrigin: 'top right' }}
    >
      {/* Profile hero */}
      <div className="relative px-6 pb-5 pt-6">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            background: `radial-gradient(ellipse at top, ${tokens.accent}, transparent 70%)`,
          }}
        />
        <div className="relative flex flex-col items-center text-center">
          <div className="relative inline-block">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user?.fullName || 'User'}
                className="h-[72px] w-[72px] rounded-[20px] object-cover ring-[3px] ring-white shadow-lg"
              />
            ) : (
              <div
                className="h-[72px] w-[72px] rounded-[20px] flex items-center justify-center text-2xl font-bold text-white ring-[3px] ring-white shadow-lg"
                style={{ background: tokens.avatarBg }}
              >
                {userInitial}
              </div>
            )}
            <button
              type="button"
              onClick={onPhotoClick}
              disabled={uploadingPhoto}
              className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-full flex items-center justify-center border-2 border-white text-white shadow-md transition hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: tokens.accent }}
              aria-label="Update profile photo"
            >
              {uploadingPhoto ? (
                <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CameraIcon className="h-3.5 w-3.5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
              className="hidden"
            />
          </div>

          <h2 className="mt-3.5 text-[15px] font-bold text-slate-900 truncate max-w-full">
            {user?.fullName || 'User'}
          </h2>
          <p className="text-xs text-slate-500 truncate max-w-full mt-0.5 font-medium">
            {user?.email || 'No email available'}
          </p>
          <div
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold capitalize border"
            style={{
              background: tokens.badgeBg,
              borderColor: tokens.badgeBorder,
              color: tokens.badgeText,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: tokens.accent }}
            />
            {user?.role || 'user'}
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-100 mx-4" />

      <div className="p-2">
        <button
          type="button"
          onClick={onSettings}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 transition-all hover:text-slate-900"
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = tokens.accentLight)
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = '')}
        >
          <span
            className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: tokens.accentMid, color: tokens.accent }}
          >
            <SettingsIcon className="h-4 w-4" />
          </span>
          Settings
        </button>

        <button
          type="button"
          onClick={onChangePassword}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 transition-all hover:text-slate-900"
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = tokens.accentLight)
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = '')}
        >
          <span
            className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: tokens.accentMid, color: tokens.accent }}
          >
            <LockIcon className="h-4 w-4" />
          </span>
          Change Password
        </button>

        <div className="h-px bg-slate-100 my-1.5 mx-1" />

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 transition-all hover:bg-red-50 hover:text-red-700"
        >
          <span className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-50 text-red-500">
            <LogoutIcon className="h-4 w-4" />
          </span>
          Sign Out
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Navbar
───────────────────────────────────────────── */
const Navbar = ({ onOpenSidebar }) => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const logoutUser = useAuthStore((state) => state.logoutUser);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const notificationRef = useRef(null);

  const tokens = getRoleTokens(user?.role);

  const unreadCount = notifications.filter(
    (n) => !n?.isRead && !n?.read,
  ).length;

  // ── Fetch notifications ───────────────────────────────────
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await getNotifications();
      setNotifications(
        response?.data?.notifications ||
          response?.data?.data ||
          response?.data ||
          [],
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to load notifications',
      );
    } finally {
      setNotificationsLoading(false);
    }
  };

  // ── Auto-fetch on mount so badge shows immediately ────────
  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // ── Optional: re-fetch every 60 seconds in background ────
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  // ── Bell click — open panel (data already loaded) ────────
  const handleBellClick = () => {
    setNotificationOpen((cur) => !cur);
    setDropdownOpen(false);
    // Refresh data when opening panel in case it's stale
    if (!notificationOpen) fetchNotifications();
  };

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
      if (appointmentId)
        navigate({ pathname: `/doctor/appointments/${appointmentId}` });
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications((cur) =>
        cur.map((n) => ({ ...n, isRead: true, read: true })),
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to update notifications',
      );
    }
  };

  // ── Click outside ─────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setDropdownOpen(false);
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      )
        setNotificationOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Photo handlers ─────────────────────────────────────────
  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('profilePicture', file);
      await updateProfilePhoto(formData);
      await fetchCurrentUser();
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // ── Navigation handlers ────────────────────────────────────
  const handleChangePassword = () => {
    setDropdownOpen(false);
    navigate(ROUTES.CHANGE_PASSWORD);
  };

  const handleSettings = () => {
    setDropdownOpen(false);
    navigate(
      user?.role === 'doctor'
        ? ROUTES.DOCTOR_SETTINGS
        : ROUTES.PATIENT_SETTINGS,
    );
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logoutUser();
    toast.success('Logged out successfully');
    navigate(ROUTES.LOGIN);
  };

  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        .navbar-root { font-family: 'DM Sans', sans-serif; }
        .navbar-title { font-family: 'Sora', sans-serif; }

        .notification-panel,
        .profile-dropdown {
          animation: dropdown-in 0.18s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes dropdown-in {
          from { opacity: 0; transform: scale(0.96) translateY(-6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }

        /* Badge pop-in on first render */
        @keyframes badge-pop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .badge-pop { animation: badge-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }

        button:focus-visible {
          outline: 2px solid;
          outline-color: var(--focus-ring, #2563eb);
          outline-offset: 2px;
          border-radius: 10px;
        }
      `}</style>

      <header
        className="navbar-root sticky top-0 z-30 flex h-16 items-center justify-between px-4 sm:px-5 border-b border-slate-200/70"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow:
            '0 1px 0 0 rgba(15,23,42,0.06), 0 4px 16px 0 rgba(15,23,42,0.04)',
        }}
      >
        {/* ── Left: hamburger + branding ─────────────────── */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="lg:hidden flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-xl border bg-white text-slate-500 border-none transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 active:scale-95"
            aria-label="Open sidebar"
          >
            <MenuIcon className="h-[18px] w-[18px]" />
          </button>

          <div className="min-w-0 ml-3 sm:ml-0">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: tokens.accent }}
            >
              AlphaCare
            </p>
            <h1 className="navbar-title truncate text-[17px] font-bold text-slate-900 leading-tight sm:text-lg">
              Welcome, {user?.fullName?.split(' ')[0] || 'User'}
            </h1>
          </div>
        </div>

        {/* ── Right: actions ─────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Role badge */}
          <div
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize border"
            style={{
              background: tokens.badgeBg,
              borderColor: tokens.badgeBorder,
              color: tokens.badgeText,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: tokens.accent }}
            />
            {user?.role || 'user'}
          </div>

          {/* Notification bell */}
          <div ref={notificationRef} className="relative static sm:relative">
            <button
              type="button"
              onClick={handleBellClick}
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition active:scale-95 ${
                notificationOpen
                  ? 'border-blue-200 text-blue-600 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-500 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700'
              }`}
              style={
                notificationOpen
                  ? {
                      background: tokens.accentLight,
                      borderColor: tokens.badgeBorder,
                      color: tokens.accent,
                    }
                  : {}
              }
              aria-label="Notifications"
              aria-expanded={notificationOpen}
            >
              <BellIcon className="h-[18px] w-[18px]" />

              {/* Badge — shows immediately on load */}
              {unreadCount > 0 && (
                <span
                  key={unreadCount} // re-triggers animation when count changes
                  className="badge-pop absolute -top-1 -right-1 h-[18px] min-w-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white"
                  style={{ background: '#ef4444' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <NotificationPanel
                notifications={notifications}
                notificationsLoading={notificationsLoading}
                unreadCount={unreadCount}
                onMarkAllRead={handleMarkAllRead}
                onNotificationClick={handleNotificationClick}
                onViewAll={() => {
                  navigate('/notifications');
                  setNotificationOpen(false);
                }}
              />
            )}
          </div>

          {/* Profile button */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setDropdownOpen((cur) => !cur);
                setNotificationOpen(false);
              }}
              className={`flex items-center gap-2.5 rounded-xl border py-1.5 pl-1.5 pr-3 shadow-sm transition active:scale-95 ${
                dropdownOpen
                  ? 'border-slate-300 bg-slate-50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
              aria-label="Profile menu"
              aria-expanded={dropdownOpen}
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user?.fullName || 'User'}
                  className="h-7 w-7 rounded-lg object-cover ring-1 ring-slate-100 flex-shrink-0"
                />
              ) : (
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: tokens.avatarBg }}
                >
                  {userInitial}
                </div>
              )}
              <div className="hidden md:block text-left min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 truncate max-w-[140px] leading-tight">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-[11px] text-slate-400 font-medium capitalize leading-tight">
                  {user?.role || 'user'}
                </p>
              </div>
              <ChevronDownIcon
                className={`hidden sm:block h-3.5 w-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <ProfileDropdown
                user={user}
                tokens={tokens}
                uploadingPhoto={uploadingPhoto}
                onPhotoClick={handlePhotoClick}
                fileInputRef={fileInputRef}
                onPhotoChange={handlePhotoChange}
                onSettings={handleSettings}
                onChangePassword={handleChangePassword}
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
