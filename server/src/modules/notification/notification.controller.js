import asyncHandler from '../../utils/asyncHandler.js';

import {
  getMyNotificationsService,
  markNotificationReadService,
  markAllNotificationsReadService,
} from './notification.service.js';

// Get notifications
export const getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const response = await getMyNotificationsService(userId);

  res.status(200).json({
    success: true,

    unreadCount: response.unreadCount,

    notifications: response.notifications,
  });
});

// Mark one read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const { id } = req.params;

  const response = await markNotificationReadService(userId, id);

  res.status(200).json({
    success: true,

    message: response.message,
  });
});

// Mark all read
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const response = await markAllNotificationsReadService(userId);

  res.status(200).json({
    success: true,

    message: response.message,
  });
});
