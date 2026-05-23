import asyncHandler from '../../utils/asyncHandler.js';
import {
  bookAppointmentService,
  cancelAppointmentService,
  completeAppointmentService,
  confirmAppointmentService,
  getAppointmentByIdService,
  getAvailableSlotsService,
  getDoctorAppointmentsService,
  getDoctorAvailableDatesService,
  getMyAppointmentsService,
  rejectAppointmentService,
  rescheduleAppointmentService,
} from './appointment.service.js';

export const bookAppointment = asyncHandler(async (req, res) => {
  // 1. Get logged-in user id
  const userId = req.user._id;

  // 2. Book appointment
  const response = await bookAppointmentService(userId, req.body);

  // 3. Return response
  res.status(201).json({
    success: true,
    message: response.message,
    appointment: response.appointment,
  });
});

export const getMyAppointments = asyncHandler(async (req, res) => {
  // 1. Get logged-in user id
  const userId = req.user._id;

  // 2. Get appointments
  const response = await getMyAppointmentsService(userId, req.query);

  // 3. Return response
  res.status(200).json({
    success: true,
    appointments: response.appointments,
  });
});

export const getDoctorAppointments = asyncHandler(async (req, res) => {
  // 1. Get logged-in user id
  const userId = req.user._id;

  // 2. Get doctor appointments
  const response = await getDoctorAppointmentsService(userId, req.query);

  // 3. Return response
  res.status(200).json({
    success: true,
    appointments: response.appointments,
  });
});

export const getAppointmentById = asyncHandler(async (req, res) => {
  // 1. Get logged-in user id
  const userId = req.user._id;

  // 2. Get appointment id
  const { id } = req.params;

  // 3. Get appointment
  const response = await getAppointmentByIdService(userId, id);

  // 4. Return response
  res.status(200).json({
    success: true,
    appointment: response.appointment,
  });
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  // 1. Get user id
  const userId = req.user._id;

  // 2. Get appointment id
  const { id } = req.params;

  // 3. Get cancel reason
  const { cancelReason } = req.body;

  // 4. Cancel appointment
  const response = await cancelAppointmentService(userId, id, cancelReason);

  // 5. Return response
  res.status(200).json({
    success: true,
    message: response.message,
    appointment: response.appointment,
  });
});

export const confirmAppointment = asyncHandler(async (req, res) => {
  // 1. Get logged-in user id
  const userId = req.user._id;

  // 2. Get appointment id
  const { id } = req.params;

  // 3. Confirm appointment
  const response = await confirmAppointmentService(userId, id);

  // 4. Return response
  res.status(200).json({
    success: true,
    message: response.message,
    appointment: response.appointment,
  });
});

export const rejectAppointment = asyncHandler(async (req, res) => {
  // 1. Get logged-in user id
  const userId = req.user._id;

  // 2. Get appointment id
  const { id } = req.params;

  // 3. Get reject reason
  const { cancelReason } = req.body;

  // 4. Reject appointment
  const response = await rejectAppointmentService(userId, id, cancelReason);

  // 5. Return response
  res.status(200).json({
    success: true,
    message: response.message,
    appointment: response.appointment,
  });
});

export const completeAppointment = asyncHandler(async (req, res) => {
  // 1. Get logged-in user id
  const userId = req.user._id;

  // 2. Get appointment id
  const { id } = req.params;

  // 3. Complete appointment
  const response = await completeAppointmentService(userId, id);

  // 4. Return response
  res.status(200).json({
    success: true,
    message: response.message,
    appointment: response.appointment,
  });
});

export const getAvailableSlots = asyncHandler(async (req, res) => {
  // 1. Get doctor id
  const { doctorId } = req.params;

  // 2. Get selected date
  const { date } = req.query;

  // 3. Get available slots
  const response = await getAvailableSlotsService(doctorId, date);

  // 4. Return response
  res.status(200).json({
    success: true,
    slots: response.slots,
  });
});

//*********reschedule ********* */
export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const { id } = req.params;

  const response = await rescheduleAppointmentService(userId, id, req.body);

  res.status(200).json({
    success: true,

    message: response.message,

    appointment: response.appointment,
  });
});

// Get doctor available dates
export const getDoctorAvailableDates = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const { month, year } = req.query;

  const response = await getDoctorAvailableDatesService(
    doctorId,
    Number(month),
    Number(year),
  );

  res.status(200).json({
    success: true,

    ...response,
  });
});
