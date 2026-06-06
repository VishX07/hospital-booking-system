import { Router } from 'express';

import {
  bookAppointment,
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  getAppointmentById,
  getAvailableSlots,
  getDoctorAppointments,
  getDoctorAvailableDates,
  getMyAppointments,
  rejectAppointment,
  rescheduleAppointment,
} from './appointment.controller.js';

import validate from '../../middleware/validate.middleware.js';
import protect from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/role.middleware.js';

import ROLES from '../../constants/roles.js';

import {
  bookAppointmentSchema,
  cancelAppointmentSchema,
} from './appointment.validation.js';

const router = Router();

// router.post(
//   '/',
//   validate(bookAppointmentSchema),
//   protect,
//   authorize(ROLES.PATIENT),
//   bookAppointment,
// );

router.get('/my', protect, authorize(ROLES.PATIENT), getMyAppointments);
router.get('/doctor', protect, authorize(ROLES.DOCTOR), getDoctorAppointments);
router.get('/:id', protect, getAppointmentById);
router.patch(
  '/:id/cancel',
  validate(cancelAppointmentSchema),
  protect,
  cancelAppointment,
);
router.patch(
  '/:id/confirm',
  protect,
  authorize(ROLES.DOCTOR),
  confirmAppointment,
);
router.patch(
  '/:id/reject',
  validate(cancelAppointmentSchema),
  protect,
  authorize(ROLES.DOCTOR),
  rejectAppointment,
);
router.patch(
  '/:id/complete',
  protect,
  authorize(ROLES.DOCTOR),
  completeAppointment,
);
router.get('/doctor/:doctorId/slots', getAvailableSlots);
router.patch(
  '/:id/reschedule',
  protect,
  authorize(ROLES.PATIENT),
  rescheduleAppointment,
);
router.get('/doctor/:doctorId/available-dates', getDoctorAvailableDates);
export default router;
