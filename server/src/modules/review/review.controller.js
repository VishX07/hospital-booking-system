import asyncHandler from '../../utils/asyncHandler.js';

import {
  createReviewService,
  getDoctorReviewsService,
  getMyReviewsService,
  updateReviewService,
} from './review.service.js';

// Create review
export const createReview = asyncHandler(async (req, res) => {
  // 1. Get user id
  const userId = req.user._id;

  // 2. Create review
  const response = await createReviewService(userId, req.body);

  // 3. Return response
  res.status(201).json({
    success: true,

    message: response.message,

    review: response.review,
  });
});

// Get doctor reviews
export const getDoctorReviews = asyncHandler(async (req, res) => {
  // 1. Get doctor id
  const { doctorId } = req.params;

  // 2. Get reviews
  const response = await getDoctorReviewsService(doctorId);

  // 3. Return response
  res.status(200).json({
    success: true,

    totalReviews: response.totalReviews,

    reviews: response.reviews,
  });
});

// Get my reviews
export const getMyReviews = asyncHandler(async (req, res) => {
  // 1. Get user id
  const userId = req.user._id;

  // 2. Get reviews
  const response = await getMyReviewsService(userId);

  // 3. Return response
  res.status(200).json({
    success: true,

    reviews: response.reviews,
  });
});

// Update review
export const updateReview = asyncHandler(async (req, res) => {
  // 1. Get user id
  const userId = req.user._id;

  // 2. Get review id
  const { id } = req.params;

  // 3. Update review
  const response = await updateReviewService(userId, id, req.body);

  // 4. Return response
  res.status(200).json({
    success: true,

    message: response.message,

    review: response.review,
  });
});
