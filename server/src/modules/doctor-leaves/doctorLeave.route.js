import { Router } from 'express';

import protect from '../../middleware/auth.middleware.js';

import authorize from '../../middleware/role.middleware.js';

import ROLES from '../../constants/roles.js';

import {
  createDoctorLeave,
  getMyLeaves,
  deleteDoctorLeave,
} from './doctorLeave.controller.js';

const router = Router();

// Create leave
router.post('/', protect, authorize(ROLES.DOCTOR), createDoctorLeave);

// Get my leaves
router.get('/my', protect, authorize(ROLES.DOCTOR), getMyLeaves);

// Delete leave
router.delete('/:id', protect, authorize(ROLES.DOCTOR), deleteDoctorLeave);

export default router;
