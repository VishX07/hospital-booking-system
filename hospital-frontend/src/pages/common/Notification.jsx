import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import {
  getNotifications,
  markAsRead,
  markAllRead,
} from '../../api/notification.api.js';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';

const NotificationsPage = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);

      setNotifications(
        notifications.map((n) =>
          n._id === id
            ? {
                ...n,
                isRead: true,
              }
            : n,
        ),
      );
    } catch {
      toast.error('Failed to mark notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead;
      Read();

      setNotifications(
        notifications.map((n) => ({
          ...n,
          isRead: true,
        })),
      );

      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all read');
    }
  };

  const filteredNotifications = useMemo(() => {
    if (filter === 'read') {
      return notifications.filter((n) => n.isRead);
    }

    if (filter === 'unread') {
      return notifications.filter((n) => !n.isRead);
    }

    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTypeStyles = (type) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-50 text-blue-700';

      case 'prescription':
        return 'bg-green-50 text-green-700';

      case 'cancelled':
        return 'bg-red-50 text-red-700';

      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return <div className="p-6">Loading notifications...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}

        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>

              <p className="mt-2 text-blue-100">
                Stay updated with your appointments and prescriptions.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-3">
              <p className="text-sm text-blue-100">Unread</p>

              <p className="text-2xl font-bold">{unreadCount}</p>
            </div>
          </div>
        </div>

        {/* Actions */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-xl px-4 py-2 ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'border'
              }`}
            >
              All
            </button>

            <button
              onClick={() => setFilter('unread')}
              className={`rounded-xl px-4 py-2 ${
                filter === 'unread' ? 'bg-blue-600 text-white' : 'border'
              }`}
            >
              Unread
            </button>

            <button
              onClick={() => setFilter('read')}
              className={`rounded-xl px-4 py-2 ${
                filter === 'read' ? 'bg-blue-600 text-white' : 'border'
              }`}
            >
              Read
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="rounded-xl bg-slate-900 px-4 py-2 text-white"
          >
            Mark All Read
          </button>
        </div>

        {/* Empty */}

        {filteredNotifications.length === 0 && (
          <div className="rounded-3xl border bg-white p-12 text-center">
            <h3 className="text-xl font-bold">No Notifications</h3>

            <p className="mt-2 text-slate-500">You're all caught up.</p>
          </div>
        )}

        {/* Notifications */}

        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`cursor-pointer rounded-3xl border p-5 shadow-sm transition hover:shadow-md ${
                !notification.isRead
                  ? 'border-blue-200 bg-blue-50/30'
                  : 'bg-white'
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getTypeStyles(
                        notification.type,
                      )}`}
                    >
                      {notification.type || 'system'}
                    </span>

                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>

                  <h3 className="font-bold">{notification.title}</h3>

                  <p className="mt-2 text-slate-600">{notification.message}</p>

                  <p className="mt-3 text-xs text-slate-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

                {!notification.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      handleMarkRead(notification._id);
                    }}
                    className="rounded-xl border px-4 py-2"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
