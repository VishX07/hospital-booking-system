import { Router } from 'express';

import protect from '../../middleware/auth.middleware.js';

import authorize from '../../middleware/role.middleware.js';

import ROLES from '../../constants/roles.js';

import {
  createReview,
  getDoctorReviews,
  getMyReviews,
  updateReview,
} from './review.controller.js';

const router = Router();

// Create review
router.post('/', protect, authorize(ROLES.PATIENT), createReview);
router.get('/doctor/:doctorId', getDoctorReviews);
router.get('/my', protect, authorize(ROLES.PATIENT), getMyReviews);
router.patch('/:id', protect, authorize(ROLES.PATIENT), updateReview);
export default router;
