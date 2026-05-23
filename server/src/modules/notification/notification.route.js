import { Router } from 'express';

import protect from '../../middleware/auth.middleware.js';

import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from './notification.controller.js';

const router = Router();

router.get('/my', protect, getMyNotifications);

router.patch('/:id/read', protect, markNotificationRead);

router.patch('/read-all', protect, markAllNotificationsRead);

export default router;
