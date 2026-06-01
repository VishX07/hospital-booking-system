import api from './axios.instance.js';

// Get notifications
export const getNotifications = () => api.get('/notifications/my');

// Mark single notification as read
export const markAsRead = (notificationId) =>
  api.patch(`/notifications/${notificationId}/read`);

// Mark all notifications as read
export const markAllRead = () => api.patch('/notifications/read-all');
