import { Router } from 'express';

import {
  createSchedule,
  getDoctorSchedules,
  getMySchedules,
  toggleScheduleAvailability,
  updateSchedule,
} from './schedule.controller.js';

import validate from '../../middleware/validate.middleware.js';
import protect from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/role.middleware.js';

import ROLES from '../../constants/roles.js';

import {
  createScheduleSchema,
  updateScheduleSchema,
} from './schedule.validation.js';

const router = Router();

router.post(
  '/',
  validate(createScheduleSchema),
  protect,
  authorize(ROLES.DOCTOR),
  createSchedule,
);

router.get('/my', protect, authorize(ROLES.DOCTOR), getMySchedules);
router.patch(
  '/:id/toggle',
  protect,
  authorize(ROLES.DOCTOR),
  toggleScheduleAvailability,
);
router.patch(
  '/:id',
  protect,
  authorize(ROLES.DOCTOR),
  validate(updateScheduleSchema),
  updateSchedule,
);
router.get('/doctor/:doctorId', getDoctorSchedules);
export default router;
