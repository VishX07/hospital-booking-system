import asyncHandler from '../../utils/asyncHandler.js';

import {
  createPrescriptionService,
  downloadPrescriptionPdfService,
  getFollowUpDataService,
  getMyPrescriptionsService,
  getPatientPrescriptionHistoryService,
  getPrescriptionByAppointmentService,
  updatePrescriptionService,
} from './prescription.service.js';

// Create prescription
export const createPrescription = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const response = await createPrescriptionService(userId, req.body);

  res.status(201).json({
    success: true,

    message: response.message,

    prescription: response.prescription,
  });
});

// Get prescription
export const getPrescriptionByAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const response = await getPrescriptionByAppointmentService(appointmentId);

  res.status(200).json({
    success: true,

    prescription: response.prescription,
  });
});

// Get my prescriptions
export const getMyPrescriptions = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const response = await getMyPrescriptionsService(userId);

  res.status(200).json({
    success: true,

    prescriptions: response.prescriptions,
  });
});

//update prescription
// Update prescription
export const updatePrescription = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const { id } = req.params;

  const response = await updatePrescriptionService(userId, id, req.body);

  res.status(200).json({
    success: true,

    message: response.message,

    prescription: response.prescription,
  });
});

// Download prescription PDF
export const downloadPrescriptionPdf = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await downloadPrescriptionPdfService(id, res);
});

//follow up booking
// Get follow-up booking data
export const getFollowUpData = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const { id } = req.params;

  const response = await getFollowUpDataService(id, userId);

  res.status(200).json({
    success: true,

    followUpData: response,
  });
});

export const getPatientPrescriptionHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const response = await getPatientPrescriptionHistoryService(patientId);

  res.status(200).json({
    success: true,

    prescriptions: response,
  });
});
