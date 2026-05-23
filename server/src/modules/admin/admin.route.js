import { Router } from 'express';

import protect from '../../middleware/auth.middleware.js';

import authorize from '../../middleware/role.middleware.js';

import ROLES from '../../constants/roles.js';

import {
  getAllAppointmentsAdmin,
  getAllDoctorsAdmin,
  getAllPatientsAdmin,
  toggleDoctorStatus,
} from './admin.controller.js';

const router = Router();

// Get all doctors
router.get('/doctors', protect, authorize(ROLES.ADMIN), getAllDoctorsAdmin);
// Toggle doctor status
router.patch(
  '/doctors/:id/toggle-status',
  protect,
  authorize(ROLES.ADMIN),
  toggleDoctorStatus,
);

// Get all patients
router.get('/patients', protect, authorize(ROLES.ADMIN), getAllPatientsAdmin);
// Get all appointments
router.get(
  '/appointments',
  protect,
  authorize(ROLES.ADMIN),
  getAllAppointmentsAdmin,
);
export default router;
