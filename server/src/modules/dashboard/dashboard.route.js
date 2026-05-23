import { Router } from 'express';

import protect from '../../middleware/auth.middleware.js';

import authorize from '../../middleware/role.middleware.js';

import ROLES from '../../constants/roles.js';

import {
  getAdminDashboard,
  getDoctorDashboard,
  getPatientDashboard,
} from './dashboard.controller.js';

const router = Router();

// Doctor dashboard
router.get('/doctor', protect, authorize(ROLES.DOCTOR), getDoctorDashboard);
// Patient dashboard
router.get('/patient', protect, authorize(ROLES.PATIENT), getPatientDashboard);
router.get('/admin', protect, authorize(ROLES.ADMIN), getAdminDashboard);
export default router;
