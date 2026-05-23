import asyncHandler from '../../utils/asyncHandler.js';

import {
  getAdminDashboardService,
  getDoctorDashboardService,
  getPatientDashboardService,
} from './dashboard.service.js';

//********DOCTOR DASHBOARD SERVICES******** //

export const getDoctorDashboard = asyncHandler(async (req, res) => {
  // 1. Get user id
  const userId = req.user._id;

  // 2. Get dashboard data
  const response = await getDoctorDashboardService(userId);

  // 3. Return response
  res.status(200).json({
    success: true,
    dashboard: response.dashboard,
  });
});

//********PATIENT DASHBOARD SERVICES******** //
export const getPatientDashboard = asyncHandler(async (req, res) => {
  // 1. Get user id
  const userId = req.user._id;

  // 2. Get dashboard data
  const response = await getPatientDashboardService(userId);

  // 3. Return response
  res.status(200).json({
    success: true,
    dashboard: response.dashboard,
  });
});

//********ADMIN DASHBOARD SERVICES******** //
export const getAdminDashboard = asyncHandler(async (req, res) => {
  // 1. Get dashboard data
  const response = await getAdminDashboardService();

  // 2. Return response
  res.status(200).json({
    success: true,
    dashboard: response.dashboard,
  });
});
