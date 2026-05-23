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
  updatePrescription,
} from './prescription.controller.js';

const router = Router();

// Create prescription
router.post('/', protect, authorize(ROLES.DOCTOR), createPrescription);

// Get prescription
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

// Patient medical history
router.get('/my', protect, authorize(ROLES.PATIENT), getMyPrescriptions);
// Update prescription
router.patch('/:id', protect, authorize(ROLES.DOCTOR), updatePrescription);
// Download PDF
router.get('/:id/download', protect, downloadPrescriptionPdf);
// Follow-up booking data
router.get(
  '/:id/follow-up-data',
  protect,
  authorize(ROLES.PATIENT),
  getFollowUpData,
);
export default router;
