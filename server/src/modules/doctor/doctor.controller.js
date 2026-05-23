import asyncHandler from '../../utils/asyncHandler.js';
import {
  createDoctorProfileService,
  getAllDoctorsService,
  getDoctorByIdService,
  getDoctorSuggestionsService,
  getPendingDoctorsService,
  updateDoctorApprovalService,
  updateDoctorProfileService,
} from './doctor.service.js';

export const createDoctorProfile = asyncHandler(async (req, res) => {
  // 1. Get logged-in user id
  const userId = req.user._id;

  // 2. Call service
  const response = await createDoctorProfileService(userId, req.body, req.file);

  // 3. Return response
  res.status(201).json({
    success: true,
    message: response.message,
    doctorProfile: response.doctorProfile,
  });
});

export const updateDoctorApproval = asyncHandler(async (req, res) => {
  // 1. Get id
  const { id } = req.params;

  // 2. Get status
  const { approvalStatus, rejectionReason } = req.body;

  // 3. Call service
  const response = await updateDoctorApprovalService(
    id,
    approvalStatus,
    rejectionReason,
  );

  // 4. Return response
  res.status(200).json({
    success: true,
    message: response.message,
    doctor: response.doctor,
  });
});

// export const getAllDoctors = asyncHandler(async (req, res) => {
//   // 1. Call service
//   const response = await getAllDoctorsService();

//   // 2. Return response
//   res.status(200).json({
//     success: true,
//     doctors: response.doctors,
//   });
// });

// ─── GET /doctors ────────────────────────────────────────────────────────────
export const getAllDoctors = asyncHandler(async (req, res) => {
  const { search, department, consultationMode, page, limit } = req.query;

  const response = await getAllDoctorsService({
    search,
    department,
    consultationMode,
    page,
    limit,
  });

  res.status(200).json({
    success: true,
    doctors: response.doctors,
    pagination: response.pagination,
  });
});

// ─── GET /doctors/suggestions ────────────────────────────────────────────────
export const getDoctorSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(200).json({ success: true, suggestions: [] });
  }

  const suggestions = await getDoctorSuggestionsService(q.trim());

  res.status(200).json({
    success: true,
    suggestions,
  });
});

export const getDoctorById = asyncHandler(async (req, res) => {
  // 1. Get id
  const { id } = req.params;

  // 2. Call service
  const response = await getDoctorByIdService(id);

  // 3. Return response
  res.status(200).json({
    success: true,
    doctor: response.doctor,
  });
});

export const updateDoctorProfile = asyncHandler(async (req, res) => {
  // 1. Get logged-in user id
  const userId = req.user._id;

  // 2. Update profile
  const response = await updateDoctorProfileService(userId, req.body);

  // 3. Return response
  res.status(200).json({
    success: true,
    message: response.message,
    doctor: response.doctor,
  });
});

export const getPendingDoctors = asyncHandler(async (req, res) => {
  // 1. Get pending doctors
  const response = await getPendingDoctorsService();

  // 2. Return response
  res.status(200).json({
    success: true,
    doctors: response.doctors,
  });
});
