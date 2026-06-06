import { Router } from 'express';

import protect from '../../middleware/auth.middleware.js';

import authorize from '../../middleware/role.middleware.js';

import ROLES from '../../constants/roles.js';

import {
  createPrescription,
  downloadPrescriptionPdf,
  getFollowUpData,
  getMyPrescriptions,
  getPatientPrescriptionHistory,
  getPrescriptionByAppointment,
  getPrescriptionByIdController,
  updatePrescription,
} from './prescription.controller.js';

const router = Router();
// Create prescription
router.post('/', protect, authorize(ROLES.DOCTOR), createPrescription);

// Specific routes first
router.get(
  '/appointment/:appointmentId',
  protect,
  getPrescriptionByAppointment,
);

router.get(
  '/patient/:patientId',
  protect,
  authorize(ROLES.DOCTOR),
  getPatientPrescriptionHistory,
);

router.get('/my', protect, getMyPrescriptions);

router.get('/:id/download', protect, downloadPrescriptionPdf);

router.get(
  '/:id/follow-up-data',
  protect,
  authorize(ROLES.PATIENT),
  getFollowUpData,
);

router.patch('/:id', protect, authorize(ROLES.DOCTOR), updatePrescription);

// Generic route ALWAYS LAST
router.get('/:prescriptionId', protect, getPrescriptionByIdController);
export default router;
