import Appointment from '../../models/Appointment.model.js';
import Doctor from '../../models/Doctor.model.js';
import Prescription from '../../models/Prescription.model.js';
import ApiError from '../../utils/ApiError.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

import { generatePrescriptionPDF } from '../../utils/generatePrescriptionPDF.js';
import { sendPrescriptionEmail } from '../../services/email.service.js';
import User from '../../models/User.model.js';

// Create prescription
export const createPrescriptionService = async (userId, prescriptionData) => {
  const { appointmentId, diagnosis, medicines, notes, followUpDate } =
    prescriptionData;

  // 1. Find doctor
  const doctor = await Doctor.findOne({
    userId,
  });

  // 2. Doctor not found
  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  // 3. Find appointment
  const appointment = await Appointment.findById(appointmentId);

  // 4. Appointment not found
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  // 5. Ownership check
  if (appointment.doctorId.toString() !== doctor._id.toString()) {
    throw new ApiError(403, 'Unauthorized access');
  }

  // 6. Appointment must be completed
  if (appointment.status !== 'completed') {
    throw new ApiError(
      400,
      'Prescription can only be added to completed appointments',
    );
  }

  // 7. Check already exists
  const existingPrescription = await Prescription.findOne({
    appointmentId,
  });

  if (existingPrescription) {
    throw new ApiError(409, 'Prescription already exists for this appointment');
  }

  // 8. Create prescription
  const prescription = await Prescription.create({
    appointmentId,

    patientId: appointment.patientId,

    doctorId: doctor._id,

    diagnosis,

    medicines,

    notes,

    followUpDate,
  });

  //send email to patient with prescription details
  // Get full prescription
  const populatedPrescription = await Prescription.findById(prescription._id)
    .populate('patientId', 'fullName email')
    .populate({
      path: 'doctorId',

      populate: {
        path: 'userId',

        select: 'fullName',
      },
    })
    .populate('appointmentId', 'appointmentDate timeSlot');

  // Generate PDF buffer
  const pdfBuffer = await generatePrescriptionPDF(populatedPrescription);

  // Send email
  await sendPrescriptionEmail({
    email: populatedPrescription.patientId.email,

    patientName: populatedPrescription.patientId.fullName,

    doctorName: populatedPrescription.doctorId.userId.fullName,

    pdfBuffer,

    prescriptionId: prescription._id,
  });

  // 9. Return response
  return {
    message: 'Prescription created successfully.',

    prescription,
  };
};

// get prescriptions by patient id
// Get prescription by appointment
export const getPrescriptionByAppointmentService = async (appointmentId) => {
  console.log('appointmentId =>', appointmentId);
  // 1. Find prescription
  const prescription = await Prescription.findOne({
    appointmentId,
  })
    .populate('patientId', 'fullName')
    .populate({
      path: 'doctorId',

      populate: {
        path: 'userId',

        select: 'fullName',
      },
    });

  // 2. Not found
  if (!prescription) {
    throw new ApiError(404, 'Prescription not found');
  }

  // 3. Return response
  return {
    prescription,
  };
};

// Get my prescriptions
export const getMyPrescriptionsService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  let query = {};

  if (user.role === 'patient') {
    query.patientId = userId;
  }

  if (user.role === 'doctor') {
    const doctor = await Doctor.findOne({
      userId,
    });

    if (!doctor) {
      throw new ApiError(404, 'Doctor profile not found');
    }

    query.doctorId = doctor._id;
  }

  const prescriptions = await Prescription.find(query)
    .populate({
      path: 'doctorId',
      populate: [
        {
          path: 'userId',
          select: 'fullName profilePicture email phoneNumber',
        },
        {
          path: 'department',
          select: 'name',
        },
      ],
    })
    .populate('appointmentId', 'appointmentDate timeSlot')
    .populate(
      'patientId',
      'fullName email phoneNumber profilePicture gender dateOfBirth',
    )
    .sort({
      createdAt: -1,
    });

  return {
    prescriptions,
  };
};

//update prescription
// Update prescription
export const updatePrescriptionService = async (
  userId,
  prescriptionId,
  updateData,
) => {
  // 1. Find doctor
  const doctor = await Doctor.findOne({
    userId,
  });

  // 2. Doctor not found
  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  // 3. Find prescription
  const prescription = await Prescription.findById(prescriptionId);

  // 4. Prescription not found
  if (!prescription) {
    throw new ApiError(404, 'Prescription not found');
  }

  // 5. Ownership check
  if (prescription.doctorId.toString() !== doctor._id.toString()) {
    throw new ApiError(403, 'Unauthorized access');
  }

  // 6. Update prescription
  const updatedPrescription = await Prescription.findByIdAndUpdate(
    prescriptionId,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  // 7. Return response
  return {
    message: 'Prescription updated successfully.',

    prescription: updatedPrescription,
  };
};

// Download prescription PDF
export const downloadPrescriptionPdfService = async (prescriptionId, res) => {
  // 1. Find prescription
  const prescription = await Prescription.findById(prescriptionId)
    .populate(
      'patientId',
      'fullName email email phoneNumber gender profilePicture dateOfBirth',
    )
    .populate({
      path: 'doctorId',

      populate: [
        {
          path: 'userId',

          select:
            'fullName email phoneNumber phoneNumber gender dateOfBirth profilePicture',
        },

        {
          path: 'department',

          select: 'name',
        },
      ],
    })
    .populate('appointmentId', 'appointmentDate timeSlot');

  // 2. Prescription not found
  if (!prescription) {
    throw new ApiError(404, 'Prescription not found');
  }

  // 3. Generate PDF
  // generatePrescriptionPDF(prescription, res);

  const pdfBuffer = await generatePrescriptionPDF(prescription);

  res.setHeader('Content-Type', 'application/pdf');

  res.setHeader(
    'Content-Disposition',
    `inline; filename="prescription-${prescription._id}.pdf"`,
  );

  res.send(pdfBuffer);
};

//follow up booking
// Get follow-up booking data
export const getFollowUpDataService = async (prescriptionId, userId) => {
  // 1. Find prescription
  const prescription =
    await Prescription.findById(prescriptionId).populate('appointmentId');

  // 2. Not found
  if (!prescription) {
    throw new ApiError(404, 'Prescription not found');
  }

  // 3. Ownership check
  if (prescription.patientId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Unauthorized access');
  }

  // 4. Appointment must be completed
  if (prescription.appointmentId?.status !== 'completed') {
    throw new ApiError(
      400,
      'Follow-up can only be booked after appointment completion',
    );
  }

  // 5. Return prefill data
  return {
    doctorId: prescription.doctorId,

    consultationType: prescription.appointmentId.consultationType,

    reasonForVisit: `Follow-up for ${prescription.diagnosis}`,
  };
};

export const getPatientPrescriptionHistoryService = async (patientId) => {
  const prescriptions = await Prescription.find({
    patientId,
  })
    .populate('doctorId', 'specialization')
    .sort({
      createdAt: -1,
    });

  return prescriptions;
};

export const getPrescriptionByIdService = async (prescriptionId) => {
  const prescription = await Prescription.findById(prescriptionId)
    .populate(
      'patientId',
      'fullName email phoneNumber profilePicture gender dateOfBirth',
    )
    .populate('doctorId', 'specialization qualification experience');

  if (!prescription) {
    throw new ApiError(404, 'Prescription not found');
  }

  return {
    prescription,
  };
};
