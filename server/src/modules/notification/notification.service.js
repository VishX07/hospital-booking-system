import Notification from '../../models/Notification.model.js';

import ApiError from '../../utils/ApiError.js';

// Create notification
export const createNotification = async ({
  userId,
  title,
  message,
  type = 'system',
  metadata = {},
}) => {
  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    metadata,
  });

  return notification;
};

// Get my notifications
export const getMyNotificationsService = async (userId) => {
  const notifications = await Notification.find({
    userId,
  })
    .sort({
      createdAt: -1,
    })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    userId,

    isRead: false,
  });

  return {
    notifications,
    unreadCount,
  };
};

// Mark single notification read
export const markNotificationReadService = async (userId, notificationId) => {
  const notification = await Notification.findOne({
    _id: notificationId,

    userId,
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  notification.isRead = true;

  await notification.save();

  return {
    message: 'Notification marked as read.',
  };
};

// Mark all notifications read
export const markAllNotificationsReadService = async (userId) => {
  await Notification.updateMany(
    {
      userId,

      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    },
  );

  return {
    message: 'All notifications marked as read.',
  };
};
