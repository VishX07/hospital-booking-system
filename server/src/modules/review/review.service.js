import Appointment from '../../models/Appointment.model.js';
import Doctor from '../../models/Doctor.model.js';
import Review from '../../models/Review.model.js';
import ApiError from '../../utils/ApiError.js';

// Create review
export const createReviewService = async (userId, reviewData) => {
  const { appointmentId, rating, comment } = reviewData;

  // 1. Find appointment
  const appointment = await Appointment.findById(appointmentId);

  // 2. Appointment not found
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  // 3. Check ownership
  if (appointment.patientId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Unauthorized access');
  }

  // 4. Only completed appointment
  if (appointment.status !== 'completed') {
    throw new ApiError(400, 'You can review only completed appointments');
  }

  // 5. Review already exists
  const existingReview = await Review.findOne({
    appointmentId,
  });

  if (existingReview) {
    throw new ApiError(409, 'Review already submitted for this appointment');
  }

  // 6. Create review
  const review = await Review.create({
    patientId: userId,

    doctorId: appointment.doctorId,

    appointmentId,

    rating,

    comment,
  });

  // 7. Get all doctor reviews
  const doctorReviews = await Review.find({
    doctorId: appointment.doctorId,
  });

  // 8. Calculate average
  const totalRating = doctorReviews.reduce(
    (sum, review) => sum + review.rating,
    0,
  );

  const averageRating = totalRating / doctorReviews.length;

  // 9. Update doctor
  await Doctor.findByIdAndUpdate(appointment.doctorId, {
    averageRating: Number(averageRating.toFixed(1)),

    totalReviews: doctorReviews.length,
  });

  // 10. Return response
  return {
    message: 'Review submitted successfully.',

    review,
  };
};

// Get doctor reviews
export const getDoctorReviewsService = async (doctorId) => {
  // 1. Get reviews
  const reviews = await Review.find({
    doctorId,
  })
    .populate('patientId', 'fullName profilePicture')
    .sort({
      createdAt: -1,
    });

  // 2. Return response
  return {
    reviews,
    totalReviews: reviews.length,
  };
};

// Get my reviews
export const getMyReviewsService = async (userId) => {
  // 1. Get reviews
  const reviews = await Review.find({
    patientId: userId,
  })
    .populate({
      path: 'doctorId',

      populate: [
        {
          path: 'userId',

          select: 'fullName profilePicture',
        },

        {
          path: 'department',

          select: 'name',
        },
      ],
    })
    .sort({
      createdAt: -1,
    });

  // 2. Return response
  return {
    reviews,
  };
};

// Update review
export const updateReviewService = async (userId, reviewId, updateData) => {
  const { rating, comment } = updateData;

  // 1. Find review
  const review = await Review.findById(reviewId);

  // 2. Review not found
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  // 3. Check ownership
  if (review.patientId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Unauthorized access');
  }

  // 4. Update review
  if (rating !== undefined) {
    review.rating = rating;
  }

  if (comment !== undefined) {
    review.comment = comment;
  }

  await review.save();

  // 5. Get all doctor reviews
  const doctorReviews = await Review.find({
    doctorId: review.doctorId,
  });

  // 6. Calculate average
  const totalRating = doctorReviews.reduce((sum, item) => sum + item.rating, 0);

  const averageRating = totalRating / doctorReviews.length;

  // 7. Update doctor
  await Doctor.findByIdAndUpdate(review.doctorId, {
    averageRating: Number(averageRating.toFixed(1)),

    totalReviews: doctorReviews.length,
  });

  // 8. Return response
  return {
    message: 'Review updated successfully.',

    review,
  };
};
