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

const Navbar = ({ onOpenSidebar }) => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  // const logout = useAuthStore((state) => state.logout);
  const logoutUser = useAuthStore((state) => state.logoutUser);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  //notifications
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const notificationRef = useRef(null);

  const unreadCount = notifications.filter(
    (notification) => !notification?.isRead && !notification?.read,
  ).length;

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

  const handleBellClick = async () => {
    setNotificationOpen((current) => !current);
    setDropdownOpen(false);

    if (!notificationOpen) {
      await fetchNotifications();
    }
  };
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification._id);

        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id
              ? {
                  ...n,
                  isRead: true,
                }
              : n,
          ),
        );
      }

      const appointmentId = notification?.metadata?.appointmentId;

      if (appointmentId) {
        navigate(`/patient/appointments/${appointmentId}`);
        return;
      }
    } catch {
      toast.error('Something went wrong');
    }
  };
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true, read: true }
            : notification,
        ),
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to update notification',
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          read: true,
        })),
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to update notifications',
      );
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || 'U';

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

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
      console.log(error?.response?.status);
      console.log(error?.response?.data);
      toast.error(error?.response?.data?.message || 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="mr-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-blue-50 hover:text-blue-600 lg:hidden"
        aria-label="Open sidebar"
      >
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
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
          AlphaCare Dashboard
        </p>
        <h1 className="truncate text-lg font-bold text-slate-950 sm:text-xl">
          Welcome, {user?.fullName || 'User'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={handleBellClick}
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            aria-label="Notifications"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.9}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-3 w-[360px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-bold text-slate-950">
                    Notifications
                  </h2>
                  <p className="text-xs text-slate-500">
                    {unreadCount > 0
                      ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                      : 'You are all caught up'}
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-xs font-bold text-blue-600 transition hover:text-blue-700"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    navigate('/notifications');
                    setNotificationOpen(false);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>
              </div>

              <div className="max-h-[360px] overflow-y-auto p-2">
                {notificationsLoading ? (
                  <div className="px-4 py-8 text-center text-sm font-medium text-slate-500">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <svg
                        className="h-6 w-6"
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
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      No notifications yet
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Appointment updates will appear here.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const isUnread =
                      !notification?.isRead && !notification?.read;

                    return (
                      <button
                        key={notification._id}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex w-full gap-3 rounded-2xl px-4 py-3 text-left transition ${
                          isUnread
                            ? 'bg-blue-50 hover:bg-blue-100'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                            isUnread ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-950">
                            {notification?.title || 'Notification'}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                            {notification?.message ||
                              notification?.description ||
                              'You have a new notification.'}
                          </p>
                          {notification?.createdAt && (
                            <p className="mt-2 text-[11px] font-medium text-slate-400">
                              {new Date(
                                notification.createdAt,
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold capitalize text-blue-700 sm:flex">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          {user?.role || 'user'}
        </div>

        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setDropdownOpen((current) => !current);
              setNotificationOpen(false);
            }}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition hover:border-blue-200 hover:bg-slate-50"
            aria-label="Profile menu"
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt=""
                className="h-10 w-10 rounded-2xl object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white">
                {userInitial}
              </div>
            )}

            <div className="hidden min-w-0 text-left md:block">
              <p className="max-w-[160px] truncate text-sm font-bold text-slate-950">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs font-medium capitalize text-slate-500">
                {user?.role || 'user'}
              </p>
            </div>

            <svg
              className={`hidden h-4 w-4 text-slate-400 transition sm:block ${
                dropdownOpen
                  ? 'rotate-180 text-blue-600'
                  : 'group-hover:text-blue-600'
              }`}
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
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-[320px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
              <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-6 pb-6 pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt=""
                        className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-md"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white ring-4 ring-white shadow-md">
                        {userInitial}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handlePhotoClick}
                      disabled={uploadingPhoto}
                      className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                      aria-label="Update profile photo"
                    >
                      {uploadingPhoto ? (
                        <svg
                          className="h-4 w-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
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
                      ) : (
                        <svg
                          className="h-4 w-4"
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
                      )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>

                  <h2 className="mt-4 max-w-full truncate text-lg font-bold text-slate-950">
                    {user?.fullName || 'User'}
                  </h2>

                  <p className="mt-1 max-w-full truncate text-sm text-slate-500">
                    {user?.email || 'No email available'}
                  </p>

                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-700">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    {user?.role || 'user'}
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  type="button"
                  onClick={handleSettings}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.9}
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
                  </span>
                  Settings
                </button>

                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.9}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                  </span>
                  Change Password
                </button>

                <div className="my-2 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.9}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                      />
                    </svg>
                  </span>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
