// import { Router } from 'express';

// import {
//   createDoctorProfile,
//   getAllDoctors,
//   getDoctorById,
//   updateDoctorApproval,
//   updateDoctorProfile,
// } from './doctor.controller.js';

// import validate from '../../middleware/validate.middleware.js';

// import protect from '../../middleware/auth.middleware.js';

// import authorize from '../../middleware/role.middleware.js';

// import ROLES from '../../constants/roles.js';

// import upload from '../../middleware/upload.middleware.js';

// import {
//   createDoctorProfileSchema,
//   updateDoctorApprovalSchema,
//   updateDoctorProfileSchema,
// } from './doctor.validation.js';

// const router = Router();

// router.post(
//   '/profile',
//   protect,
//   authorize(ROLES.DOCTOR),
//   upload.single('licenseDocument'),
//   validate(createDoctorProfileSchema),
//   createDoctorProfile,
// );
// router.patch(
//   '/:id/approval',
//   validate(updateDoctorApprovalSchema),
//   protect,
//   authorize(ROLES.ADMIN),
//   updateDoctorApproval,
// );

// router.get('/', getAllDoctors);
// router.patch(
//   '/profile',
//   validate(updateDoctorProfileSchema),
//   protect,
//   authorize(ROLES.DOCTOR),
//   updateDoctorProfile,
// );

// router.get('/:id', getDoctorById);
// export default router;

import { Router } from 'express';

import {
  createDoctorProfile,
  getAllDoctors,
  getDoctorById,
  getDoctorSuggestions,
  getPendingDoctors,
  updateDoctorApproval,
  updateDoctorProfile,
} from './doctor.controller.js';

import validate from '../../middleware/validate.middleware.js';
import protect from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/role.middleware.js';
import upload from '../../middleware/upload.middleware.js';

import ROLES from '../../constants/roles.js';

import {
  createDoctorProfileSchema,
  updateDoctorApprovalSchema,
  updateDoctorProfileSchema,
} from './doctor.validation.js';

const router = Router();
router.get('/suggestions', getDoctorSuggestions);
// Create doctor profile
router.post(
  '/profile',
  protect,
  authorize(ROLES.DOCTOR),
  upload.single('licenseDocument'),
  validate(createDoctorProfileSchema),
  createDoctorProfile,
);

router.get('/pending', protect, authorize(ROLES.ADMIN), getPendingDoctors);

// Approve / Reject doctor
router.patch(
  '/:id/approval',
  protect,
  authorize(ROLES.ADMIN),
  validate(updateDoctorApprovalSchema),
  updateDoctorApproval,
);

// Update doctor profile
router.patch(
  '/profile',
  protect,
  authorize(ROLES.DOCTOR),
  validate(updateDoctorProfileSchema),
  updateDoctorProfile,
);

// Get all doctors
router.get('/', getAllDoctors);

// Get doctor by id
router.get('/:id', getDoctorById);

export default router;
