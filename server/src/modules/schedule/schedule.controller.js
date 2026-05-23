import asyncHandler from '../../utils/asyncHandler.js';
import {
  createScheduleService,
  getDoctorSchedulesService,
  getMySchedulesService,
  toggleScheduleAvailabilityService,
  updateScheduleService,
} from './schedule.service.js';

export const createSchedule = asyncHandler(async (req, res) => {
  // 1. Get logged-in user id
  const userId = req.user._id;

  // 2. Create schedule
  const response = await createScheduleService(userId, req.body);

  // 3. Return response
  res.status(201).json({
    success: true,
    message: response.message,
    schedule: response.schedule,
  });
});

export const getMySchedules = asyncHandler(async (req, res) => {
  // 1. Get logged-in user id
  const userId = req.user._id;

  // 2. Get schedules
  const response = await getMySchedulesService(userId);

  // 3. Return response
  res.status(200).json({
    success: true,
    schedules: response.schedules,
  });
});

export const getDoctorSchedules = asyncHandler(async (req, res) => {
  // 1. Get doctor id
  const { doctorId } = req.params;

  // 2. Get schedules
  const response = await getDoctorSchedulesService(doctorId);

  // 3. Return response
  res.status(200).json({
    success: true,
    schedules: response.schedules,
  });
});

export const updateSchedule = asyncHandler(async (req, res) => {
  // 1. Get user id
  const userId = req.user._id;

  // 2. Get schedule id
  const { id } = req.params;

  // 3. Update schedule
  const response = await updateScheduleService(userId, id, req.body);

  // 4. Return response
  res.status(200).json({
    success: true,
    message: response.message,
    schedule: response.schedule,
  });
});

//toggle the availability of the schedule
export const toggleScheduleAvailability = asyncHandler(async (req, res) => {
  // 1. Get user id
  const userId = req.user._id;

  // 2. Get schedule id
  const { id } = req.params;

  // 3. Toggle schedule
  const response = await toggleScheduleAvailabilityService(userId, id);

  // 4. Return response
  res.status(200).json({
    success: true,
    message: response.message,
    schedule: response.schedule,
  });
});
