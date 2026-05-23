import Appointment from '../../models/Appointment.model.js';
import Doctor from '../../models/Doctor.model.js';
import DoctorLeave from '../../models/DoctorLeave.model.js';
import ApiError from '../../utils/ApiError.js';
import { createNotification } from '../notification/notification.service.js';
// Create leave
export const createDoctorLeaveService = async (userId, leaveData) => {
  const { startDate, endDate, reason, forceCreate = false } = leaveData;

  // 1. Find doctor
  const doctor = await Doctor.findOne({
    userId,
  });

  // 2. Doctor not found
  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  // 3. Validate dates
  if (new Date(startDate) > new Date(endDate)) {
    throw new ApiError(400, 'Start date cannot be after end date');
  }

  // 4. Check overlapping leave
  const existingLeave = await DoctorLeave.findOne({
    doctorId: doctor._id,

    startDate: {
      $lte: endDate,
    },

    endDate: {
      $gte: startDate,
    },
  });

  // 5. Leave already exists
  if (existingLeave) {
    throw new ApiError(409, 'Leave already exists for selected dates');
  }

  // 6. Check conflicting appointments
  const conflictingAppointments = await Appointment.find({
    doctorId: doctor._id,

    status: {
      $in: ['pending', 'confirmed'],
    },

    appointmentDate: {
      $gte: new Date(startDate),

      $lte: new Date(endDate),
    },
  });

  // 7. Return warning if conflicts found
  if (conflictingAppointments.length > 0 && !forceCreate) {
    return {
      requiresConfirmation: true,

      appointmentCount: conflictingAppointments.length,

      message: `You have ${conflictingAppointments.length} appointments during selected dates. Continue anyway?`,
    };
  }

  // 8. Create leave
  const leave = await DoctorLeave.create({
    doctorId: doctor._id,

    startDate,

    endDate,

    reason,
  });

  // 9. Cancel affected appointments
  for (const appointment of conflictingAppointments) {
    // Cancel appointment
    appointment.status = 'cancelled';

    appointment.cancelledBy = 'doctor';

    appointment.cancelReason = `Doctor unavailable due to leave: ${reason}`;

    await appointment.save();

    // Send notification
    await createNotification({
      userId: appointment.patientId,

      title: 'Appointment Cancelled',

      message: `Your appointment on
      ${appointment.appointmentDate.toLocaleDateString()}
      at ${appointment.timeSlot}
      was cancelled because the doctor is on leave.

      Reason:
      ${reason}

      Please book another slot.`,

      type: 'appointment',

      metadata: {
        appointmentId: appointment._id,

        doctorId: doctor._id,
      },
    });
  }

  // 9. Cancel affected appointments
  for (const appointment of conflictingAppointments) {
    // Cancel appointment
    appointment.status = 'cancelled';

    appointment.cancelledBy = 'doctor';

    appointment.cancelReason = `Doctor unavailable due to leave: ${reason}`;

    await appointment.save();

    // Send notification
    await createNotification({
      userId: appointment.patientId,

      title: 'Appointment Cancelled',

      message: `Your appointment on
${appointment.appointmentDate.toLocaleDateString()}
at ${appointment.timeSlot}
was cancelled because the doctor is on leave.

Reason:
${reason}

Please book another slot.`,

      type: 'appointment',

      metadata: {
        appointmentId: appointment._id,

        doctorId: doctor._id,
      },
    });
  }

  // 9. Return response
  return {
    message: 'Leave added successfully.',

    leave,
  };
};

// Get my leaves
export const getMyLeavesService = async (userId) => {
  // 1. Find doctor
  const doctor = await Doctor.findOne({
    userId,
  });

  // 2. Doctor not found
  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  // 3. Get leaves
  const leaves = await DoctorLeave.find({
    doctorId: doctor._id,
  }).sort({
    startDate: 1,
  });

  // 4. Return response
  return {
    leaves,
  };
};

// Delete leave
export const deleteDoctorLeaveService = async (userId, leaveId) => {
  // 1. Find doctor
  const doctor = await Doctor.findOne({
    userId,
  });

  // 2. Doctor not found
  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  // 3. Find leave
  const leave = await DoctorLeave.findById(leaveId);

  // 4. Leave not found
  if (!leave) {
    throw new ApiError(404, 'Leave not found');
  }

  // 5. Ownership check
  if (leave.doctorId.toString() !== doctor._id.toString()) {
    throw new ApiError(403, 'Unauthorized access');
  }

  // 6. Delete leave
  await leave.deleteOne();

  // 7. Return response
  return {
    message: 'Leave deleted successfully.',
  };
};
