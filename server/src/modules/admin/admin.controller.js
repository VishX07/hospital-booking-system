import asyncHandler from '../../utils/asyncHandler.js';

import {
  getAllAppointmentsAdminService,
  getAllDoctorsAdminService,
  getAllPatientsAdminService,
  toggleDoctorStatusService,
} from './admin.service.js';

export const getAllDoctorsAdmin = asyncHandler(async (req, res) => {
  // 1. Get doctors
  const response = await getAllDoctorsAdminService(req.query);

  // 2. Return response
  res.status(200).json({
    success: true,

    doctors: response.doctors,

    pagination: response.pagination,
  });
});

//*********ADMIN TOGGLE DOCTOR STATUS CONTROLLER*********//
export const toggleDoctorStatus = asyncHandler(async (req, res) => {
  // 1. Get doctor id
  const { id } = req.params;

  // 2. Toggle doctor
  const response = await toggleDoctorStatusService(id);

  // 3. Return response
  res.status(200).json({
    success: true,
    message: response.message,
    doctor: response.doctor,
  });
});

//*********ADMIN GET ALL PATIENTS CONTROLLER*********//
export const getAllPatientsAdmin = asyncHandler(async (req, res) => {
  // 1. Get patients
  const response = await getAllPatientsAdminService(req.query);

  // 2. Return response
  res.status(200).json({
    success: true,

    patients: response.patients,

    pagination: response.pagination,
  });
});

//*********ADMIN GET ALL APPOINTMENTS CONTROLLER*********//
export const getAllAppointmentsAdmin = asyncHandler(async (req, res) => {
  // 1. Get appointments
  const response = await getAllAppointmentsAdminService(req.query);

  // 2. Return response
  res.status(200).json({
    success: true,

    appointments: response.appointments,

    pagination: response.pagination,
  });
});
