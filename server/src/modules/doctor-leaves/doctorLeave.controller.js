import asyncHandler from '../../utils/asyncHandler.js';

import {
  createDoctorLeaveService,
  getMyLeavesService,
  deleteDoctorLeaveService,
} from './doctorLeave.service.js';

// Create leave
export const createDoctorLeave = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const response = await createDoctorLeaveService(userId, req.body);

  res.status(201).json({
    success: true,
    message: response.message,
    appointmentCount: response.appointmentCount,
    leave: response.leave,
  });
});

// Get my leaves
export const getMyLeaves = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const response = await getMyLeavesService(userId);

  res.status(200).json({
    success: true,

    leaves: response.leaves,
  });
});

// Delete leave
export const deleteDoctorLeave = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const { id } = req.params;

  const response = await deleteDoctorLeaveService(userId, id);

  res.status(200).json({
    success: true,

    message: response.message,
  });
});
