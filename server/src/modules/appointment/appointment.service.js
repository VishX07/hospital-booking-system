import Appointment from '../../models/Appointment.model.js';
import Doctor from '../../models/Doctor.model.js';
import Schedule from '../../models/Schedule.model.js';
import User from '../../models/User.model.js';
import ApiError from '../../utils/ApiError.js';
import { createNotification } from '../notification/notification.service.js';
import DoctorLeave from '../../models/DoctorLeave.model.js';
import {
  sendAppointmentCancelledEmail,
  sendAppointmentConfirmedEmail,
  sendAppointmentRejectedEmail,
} from '../../services/email.service.js';
const DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
};

export const bookAppointmentService = async (userId, appointmentData) => {
  const { doctorId, appointmentDate, timeSlot, consultationType } =
    appointmentData;
  // Prevent past date booking
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const bookingDate = new Date(appointmentDate);

  bookingDate.setHours(0, 0, 0, 0);

  if (bookingDate < today) {
    throw new ApiError(400, 'Cannot book appointment for past date');
  }
  // 1. Check patient exists
  const patient = await User.findById(userId);

  if (!patient) {
    throw new ApiError(404, 'User not found');
  }

  // 2. Check role
  if (patient.role !== 'patient') {
    throw new ApiError(403, 'Only patients can book appointments');
  }

  // 3. Find doctor
  const doctor = await Doctor.findOne({
    _id: doctorId,
    approvalStatus: 'approved',
    isActive: true,
  });

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }
  // Check doctor leave
  const selectedDate = new Date(appointmentDate);

  selectedDate.setHours(0, 0, 0, 0);

  const doctorLeave = await DoctorLeave.findOne({
    doctorId: doctorId,

    startDate: {
      $lte: selectedDate,
    },

    endDate: {
      $gte: selectedDate,
    },
  });

  // Doctor unavailable
  if (doctorLeave) {
    throw new ApiError(400, 'Doctor is unavailable on selected date');
  }

  // 4. Validate consultation type
  const mode = doctor.consultationMode;

  const isAllowed = mode === 'both' || mode === consultationType;

  if (!isAllowed) {
    throw new ApiError(400, 'Selected consultation type is not available');
  }

  // 5. Get day of week
  const dayOfWeek = DAYS[new Date(appointmentDate).getDay()];

  // 6. Find doctor schedule
  const schedule = await Schedule.findOne({
    doctorId: doctor._id,
    dayOfWeek,
    isAvailable: true,
  });

  if (!schedule) {
    throw new ApiError(404, 'Doctor is not available on selected day');
  }

  // 7. Convert time to minutes
  const slotMins = timeToMinutes(timeSlot);

  const startMins = timeToMinutes(schedule.startTime);

  const endMins = timeToMinutes(schedule.endTime);

  // 8. Check slot inside working hours
  if (slotMins < startMins || slotMins >= endMins) {
    throw new ApiError(400, 'Selected time slot is invalid');
  }

  // 9. Validate slot duration
  const slotDuration = schedule.slotDuration;

  if ((slotMins - startMins) % slotDuration !== 0) {
    throw new ApiError(400, 'Selected time slot is invalid');
  }

  // 10. Validate break time
  if (schedule.breakStart && schedule.breakEnd) {
    const breakStartMins = timeToMinutes(schedule.breakStart);

    const breakEndMins = timeToMinutes(schedule.breakEnd);

    if (slotMins >= breakStartMins && slotMins < breakEndMins) {
      throw new ApiError(400, 'Selected time slot is invalid');
    }
  }

  // 11. Prevent double booking
  const existing = await Appointment.findOne({
    doctorId: doctor._id,
    appointmentDate,
    timeSlot,
    status: {
      $nin: ['cancelled'],
    },
  });

  if (existing) {
    throw new ApiError(409, 'Time slot already booked');
  }

  // 12. Create appointment
  const appointment = await Appointment.create({
    ...appointmentData,
    patientId: userId,
    doctorId: doctor._id,
    amount: doctor.consultationFee,
  });

  //create notification for doctor about new appointment request
  await createNotification({
    userId: doctor.userId,

    title: 'New Appointment Request',

    message: `${patient.fullName}
 requested an appointment
 on ${appointmentDate}
 at ${timeSlot}.`,

    type: 'appointment',

    metadata: {
      appointmentId: appointment._id,

      doctorId: doctor._id,
    },
  });

  // 13. Return response
  return {
    message: 'Appointment booked successfully.',
    appointment,
  };
};

//get my appointments
// get my appointments
export const getMyAppointmentsService = async (userId, filters) => {
  const { status, type } = filters;

  // 1. Check patient exists
  const patient = await User.findById(userId);

  if (!patient) {
    throw new ApiError(404, 'User not found');
  }

  // 2. Check role
  if (patient.role !== 'patient') {
    throw new ApiError(403, 'Only patients can access appointments');
  }

  // 3. Base query
  const query = {
    patientId: userId,
  };

  // 4. Status filter
  if (status) {
    query.status = status;
  }

  // 5. Time filter
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (type === 'history') {
    query.appointmentDate = {
      $lt: today,
    };
  }

  if (type === 'upcoming') {
    query.appointmentDate = {
      $gte: today,
    };
  }

  // 6. Get appointments
  const appointments = await Appointment.find(query)
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
    .populate(
      'patientId',
      'fullName email phoneNumber profilePicture gender dateOfBirth',
    )
    .sort({
      appointmentDate: -1,
      timeSlot: 1,
    });

  // 7. Return response
  return {
    appointments,
  };
};
export const getDoctorAppointmentsService = async (userId, filters) => {
  const { status, type } = filters;

  // 1. Find doctor profile
  const doctor = await Doctor.findOne({
    userId,
    approvalStatus: 'approved',
    isActive: true,
  });

  // 2. Doctor not found
  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  // 3. Base query
  const query = {
    doctorId: doctor._id,
  };

  // 4. Status filter
  if (status) {
    query.status = status;
  }

  // 5. Time filter
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (type === 'history') {
    query.appointmentDate = {
      $lt: today,
    };
  }

  if (type === 'upcoming') {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    query.appointmentDate = {
      $gte: today,
    };

    query.status = {
      $in: ['pending', 'confirmed'],
    };
  }

  // 6. Get appointments
  const appointments = await Appointment.find(query)
    .populate(
      'patientId',
      'fullName email phoneNumber profilePicture gender dateOfBirth',
    )
    .populate({
      path: 'doctorId',
      populate: [
        {
          path: 'userId',
          select: 'fullName email phoneNumber profilePicture',
        },
        {
          path: 'department',
          select: 'name',
        },
      ],
    })
    .sort({
      appointmentDate: 1,
      timeSlot: 1,
    });

  // 7. Return response
  return {
    appointments,
  };
};

export const getAppointmentByIdService = async (userId, appointmentId) => {
  // 1. Find appointment
  const appointment = await Appointment.findById(appointmentId)
    .populate({
      path: 'doctorId',
      populate: [
        {
          path: 'userId',
          select: 'fullName email phoneNumber profilePicture',
        },
        {
          path: 'department',
          select: 'name',
        },
      ],
    })
    .populate('patientId', 'fullName email phoneNumber gender profilePicture');

  // 2. Appointment not found
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  // 3. Check access
  const isPatient = appointment.patientId._id.toString() === userId.toString();

  const doctor = await Doctor.findOne({
    userId,
  });

  const isDoctor =
    doctor && appointment.doctorId._id.toString() === doctor._id.toString();

  if (!isPatient && !isDoctor) {
    throw new ApiError(403, 'Unauthorized access');
  }

  // 4. Return response
  return {
    appointment,
  };
};

export const cancelAppointmentService = async (
  userId,
  appointmentId,
  cancelReason,
) => {
  // 1. Find appointment
  const appointment = await Appointment.findById(appointmentId);

  // 2. Appointment not found
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  // 3. Check patient ownership
  const isPatient = appointment.patientId.toString() === userId.toString();

  // 4. Check doctor ownership
  const doctor = await Doctor.findOne({
    userId,
  }).populate('userId', 'fullName');

  const isDoctor =
    doctor && appointment.doctorId.toString() === doctor._id.toString();

  // 5. Unauthorized access
  if (!isPatient && !isDoctor) {
    throw new ApiError(403, 'Unauthorized access');
  }

  // 6. Already cancelled
  if (appointment.status === 'cancelled') {
    throw new ApiError(400, 'Appointment already cancelled');
  }

  // 7. Cannot cancel completed appointment
  if (appointment.status === 'completed') {
    throw new ApiError(400, 'Completed appointment cannot be cancelled');
  }

  // 8. Determine cancelledBy
  let cancelledBy = 'patient';

  if (isDoctor) {
    cancelledBy = 'doctor';
  }

  // 9. Cancel appointment
  appointment.status = 'cancelled';

  appointment.cancelledBy = cancelledBy;

  appointment.cancelReason = cancelReason;

  await appointment.save();

  //cancel appointment email
  // Get patient info
  // const patient1 = await User.findById(appointment.patientId).select(
  //   'fullName email',
  // );

  // Send cancellation email
  // Get patient info
  const patient1 = await User.findById(appointment.patientId).select(
    'fullName email',
  );

  // Get appointment doctor
  const appointmentDoctor1 = await Doctor.findById(
    appointment.doctorId,
  ).populate('userId', 'fullName email');

  // Patient cancelled → email doctor
  if (cancelledBy === 'patient') {
    await sendAppointmentCancelledEmail({
      email: appointmentDoctor1.userId.email,

      receiverName: appointmentDoctor1.userId.fullName,

      cancelledBy,

      cancellerName: patient1.fullName,

      appointmentDate: appointment.appointmentDate,

      timeSlot: appointment.timeSlot,

      cancelReason,
    });
  }

  // Doctor cancelled → email patient
  if (cancelledBy === 'doctor') {
    await sendAppointmentCancelledEmail({
      email: patient1.email,

      receiverName: patient1.fullName,

      cancelledBy,

      cancellerName: appointmentDoctor1.userId.fullName,

      appointmentDate: appointment.appointmentDate,

      timeSlot: appointment.timeSlot,

      cancelReason,
    });
  }

  //**********create notification for doctor about appointment cancellation
  // 10. Find appointment doctor
  const appointmentDoctor = await Doctor.findById(
    appointment.doctorId,
  ).populate('userId', 'fullName');

  // 11. Find patient
  const patient = await User.findById(appointment.patientId).select('fullName');

  // 12. Patient cancelled
  if (cancelledBy === 'patient') {
    await createNotification({
      userId: appointmentDoctor.userId._id,

      title: 'Appointment Cancelled',

      message: `${patient.fullName}
 cancelled appointment
 on ${appointment.appointmentDate.toLocaleDateString()}
 at ${appointment.timeSlot}.

 Reason:
 ${cancelReason}`,

      type: 'appointment',

      metadata: {
        appointmentId: appointment._id,

        doctorId: appointmentDoctor._id,
      },
    });
  }

  // 13. Doctor cancelled
  if (cancelledBy === 'doctor') {
    await createNotification({
      userId: appointment.patientId,

      title: 'Appointment Cancelled',

      message: `Dr ${appointmentDoctor.userId.fullName} cancelled your
 appointment on
 ${appointment.appointmentDate.toLocaleDateString()}
 at ${appointment.timeSlot}.

 Reason:
 ${cancelReason}`,

      type: 'appointment',

      metadata: {
        appointmentId: appointment._id,

        doctorId: appointmentDoctor._id,
      },
    });
  }

  // 10. Return response
  return {
    message: 'Appointment cancelled successfully.',
    appointment,
  };
};

export const confirmAppointmentService = async (userId, appointmentId) => {
  // 1. Find doctor profile
  const doctor = await Doctor.findOne({
    userId,
    approvalStatus: 'approved',
    isActive: true,
  }).populate('userId', 'fullName email');

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

  // 5. Check ownership
  if (appointment.doctorId.toString() !== doctor._id.toString()) {
    throw new ApiError(403, 'Unauthorized access');
  }

  // 6. Only pending appointment can be confirmed
  if (appointment.status !== 'pending') {
    throw new ApiError(400, 'Only pending appointments can be confirmed');
  }

  // 7. Confirm appointment
  appointment.status = 'confirmed';

  // Auto generate meeting link
  if (appointment.consultationType === 'online') {
    const roomId = `alpha-hospital-${appointment._id}`;

    appointment.meetingLink = `https://meet.jit.si/${roomId}`;
  }
  await appointment.save();
  // Get patient info
  const patient = await User.findById(appointment.patientId).select(
    'fullName email',
  );

  // Get doctor info

  // Send email
  await sendAppointmentConfirmedEmail({
    email: patient.email,

    patientName: patient.fullName,

    doctorName: doctor.userId.fullName,

    appointmentDate: appointment.appointmentDate,

    timeSlot: appointment.timeSlot,

    consultationType: appointment.consultationType,

    meetingLink: appointment.meetingLink,
  });

  //create notification for patient about appointment confirmation
  await createNotification({
    userId: appointment.patientId,

    title: 'Appointment Confirmed',

    message:
      appointment.consultationType === 'online'
        ? `Your online appointment on
${appointment.appointmentDate.toLocaleDateString()}
at ${appointment.timeSlot}
has been confirmed.

Meeting link is ready.`
        : `Your appointment on
${appointment.appointmentDate.toLocaleDateString()}
at ${appointment.timeSlot}
has been confirmed.`,

    type: 'appointment',

    metadata: {
      appointmentId: appointment._id,
    },
  });

  // 8. Return response
  return {
    message: 'Appointment confirmed successfully.',
    appointment,
  };
};

export const rejectAppointmentService = async (
  userId,
  appointmentId,
  cancelReason,
) => {
  // 1. Find doctor profile
  const doctor = await Doctor.findOne({
    userId,
    approvalStatus: 'approved',
    isActive: true,
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

  // 5. Check ownership
  if (appointment.doctorId.toString() !== doctor._id.toString()) {
    throw new ApiError(403, 'Unauthorized access');
  }

  // 6. Only pending appointment can be rejected
  if (appointment.status !== 'pending') {
    throw new ApiError(400, 'Only pending appointments can be rejected');
  }

  // 7. Reject appointment
  appointment.status = 'rejected';

  appointment.cancelledBy = 'doctor';

  appointment.cancelReason = cancelReason;

  await appointment.save();
  //reject appointment email
  // Get patient info
  const patient = await User.findById(appointment.patientId).select(
    'fullName email',
  );

  await doctor.populate('userId', 'fullName');

  // Send rejection email
  await sendAppointmentRejectedEmail({
    email: patient.email,

    patientName: patient.fullName,

    doctorName: doctor.userId.fullName,

    rejectionReason: appointment.rejectionReason,
  });
  //reject appointment email end

  //create notification for patient about appointment rejection
  await createNotification({
    userId: appointment.patientId,

    title: 'Appointment Rejected',

    message: `Your appointment on
  ${appointment.appointmentDate.toLocaleDateString()}
  at ${appointment.timeSlot}
  was rejected.

  Reason:
  ${cancelReason}`,

    type: 'appointment',

    metadata: {
      appointmentId: appointment._id,
    },
  });

  // 8. Return response
  return {
    message: 'Appointment rejected successfully.',
    appointment,
  };
};

export const completeAppointmentService = async (userId, appointmentId) => {
  // 1. Find doctor profile
  const doctor = await Doctor.findOne({
    userId,
    approvalStatus: 'approved',
    isActive: true,
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

  // 5. Check ownership
  if (appointment.doctorId.toString() !== doctor._id.toString()) {
    throw new ApiError(403, 'Unauthorized access');
  }

  // 6. Only confirmed appointment can be completed
  if (appointment.status !== 'confirmed') {
    throw new ApiError(400, 'Only confirmed appointments can be completed');
  }

  // 7. Complete appointment
  appointment.status = 'completed';

  await appointment.save();

  //create notification for patient about appointment completion
  await createNotification({
    userId: appointment.patientId,

    title: 'Appointment Completed',

    message: `Your appointment on
  ${appointment.appointmentDate.toLocaleDateString()}
  at ${appointment.timeSlot}
  has been completed.`,

    type: 'appointment',

    metadata: {
      appointmentId: appointment._id,
    },
  });
  // 8. Return response
  return {
    message: 'Appointment completed successfully.',
    appointment,
  };
};

export const getAvailableSlotsService = async (doctorId, selectedDate) => {
  // 1. Find doctor
  const doctor = await Doctor.findOne({
    _id: doctorId,
    approvalStatus: 'approved',
    isActive: true,
  });

  // 2. Doctor not found
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }
  // 3. Prevent past date booking
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const bookingDate = new Date(selectedDate);

  bookingDate.setHours(0, 0, 0, 0);

  if (bookingDate < today) {
    throw new ApiError(400, 'Cannot book appointment for past date');
  }
  // 3. Get day of week
  const dayOfWeek = DAYS[new Date(selectedDate).getDay()];

  // 4. Find schedule
  const schedule = await Schedule.findOne({
    doctorId,
    dayOfWeek,
    isAvailable: true,
  });

  console.log({
    selectedDate,

    dayOfWeek,

    doctorId,
  });

  // 5. Doctor unavailable
  if (!schedule) {
    throw new ApiError(404, 'Doctor is not available on selected day');
  }

  // 6. Convert to minutes
  const startMins = timeToMinutes(schedule.startTime);

  const endMins = timeToMinutes(schedule.endTime);

  const breakStartMins = schedule.breakStart
    ? timeToMinutes(schedule.breakStart)
    : null;

  const breakEndMins = schedule.breakEnd
    ? timeToMinutes(schedule.breakEnd)
    : null;

  // 7. Generate slots
  const slots = [];

  for (let mins = startMins; mins < endMins; mins += schedule.slotDuration) {
    // Skip break time
    if (
      breakStartMins !== null &&
      breakEndMins !== null &&
      mins >= breakStartMins &&
      mins < breakEndMins
    ) {
      continue;
    }

    const hours = Math.floor(mins / 60)
      .toString()
      .padStart(2, '0');

    const minutes = (mins % 60).toString().padStart(2, '0');

    slots.push(`${hours}:${minutes}`);
  }

  // 8. Get booked slots
  const bookedAppointments = await Appointment.find({
    doctorId,
    appointmentDate: new Date(selectedDate),
    status: {
      $nin: ['cancelled', 'rejected'],
    },
  }).select('timeSlot');

  const bookedSlots = bookedAppointments.map(
    (appointment) => appointment.timeSlot,
  );

  // 9. Remove booked slots
  // 9. Remove booked slots
  let availableSlots = slots.filter((slot) => !bookedSlots.includes(slot));

  // 10. Block past slots for today
  // const today = new Date();
  // Block past slots for today
  const now = new Date();

  const selected = new Date(selectedDate);

  selected.setHours(0, 0, 0, 0);

  const todayDate = new Date();

  todayDate.setHours(0, 0, 0, 0);

  // Same day check
  const isToday = selected.getTime() === todayDate.getTime();

  if (isToday) {
    const currentMins = now.getHours() * 60 + now.getMinutes() + 15;

    availableSlots = availableSlots.filter((slot) => {
      const slotMins = timeToMinutes(slot);

      return slotMins > currentMins;
    });
  }
  // 10. Return response
  return {
    slots: availableSlots,
  };
};

//***********appointment rescheduling ********** */
export const rescheduleAppointmentService = async (
  userId,
  appointmentId,
  rescheduleData,
) => {
  const { appointmentDate, timeSlot } = rescheduleData;

  // 1. Find appointment
  const appointment = await Appointment.findById(appointmentId);

  // 2. Appointment not found
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  // 3. Ownership check
  if (appointment.patientId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Unauthorized access');
  }

  // 4. Status validation
  if (['completed', 'rejected'].includes(appointment.status)) {
    throw new ApiError(400, 'Appointment cannot be rescheduled');
  }

  // 5. Find doctor
  const doctor = await Doctor.findOne({
    _id: appointment.doctorId,

    approvalStatus: 'approved',

    isActive: true,
  });

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  // Save old values
  const oldDate = appointment.appointmentDate;

  const oldTime = appointment.timeSlot;

  // 6. Check doctor leave
  const selectedDate = new Date(appointmentDate);

  selectedDate.setHours(0, 0, 0, 0);

  const doctorLeave = await DoctorLeave.findOne({
    doctorId: doctor._id,

    startDate: {
      $lte: selectedDate,
    },

    endDate: {
      $gte: selectedDate,
    },
  });

  if (doctorLeave) {
    throw new ApiError(400, 'Doctor is unavailable on selected date');
  }

  // 7. Prevent double booking
  const existing = await Appointment.findOne({
    doctorId: doctor._id,

    appointmentDate,

    timeSlot,

    status: {
      $nin: ['cancelled'],
    },

    _id: {
      $ne: appointmentId,
    },
  });

  if (existing) {
    throw new ApiError(409, 'Time slot already booked');
  }

  // 8. Update appointment
  appointment.appointmentDate = appointmentDate;

  appointment.timeSlot = timeSlot;

  appointment.status = 'pending';

  appointment.isRescheduled = true;

  await appointment.save();

  // 9. Notify doctor
  const patient = await User.findById(userId);

  await createNotification({
    userId: doctor.userId,

    title: 'Appointment Reschedule Request',

    message: `${patient.fullName}
requested to reschedule appointment.

Old:
${new Date(oldDate).toLocaleDateString()}
at ${oldTime}

New:
${new Date(appointmentDate).toLocaleDateString()}
at ${timeSlot}`,

    type: 'appointment',

    metadata: {
      appointmentId: appointment._id,

      doctorId: doctor._id,
    },
  });

  // 10. Return response
  return {
    message: 'Reschedule request sent successfully.',

    appointment,
  };
};

//get appointments dates
export const getDoctorAvailableDatesService = async (doctorId, month, year) => {
  // Doctor check
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  const availableDates = [];

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  // Month start & end
  const startDate = new Date(year, month - 1, 1);

  const endDate = new Date(year, month, 0);

  // Get doctor schedule
  const schedules = await Schedule.find({
    doctorId,
    isAvailable: true,
  });

  const availableDays = schedules.map((schedule) =>
    schedule.dayOfWeek.toLowerCase(),
  );

  // Doctor leaves
  const leaves = await DoctorLeave.find({
    doctorId,
  });

  // Loop all month dates
  for (let day = 1; day <= endDate.getDate(); day++) {
    const currentDate = new Date(year, month - 1, day);

    currentDate.setHours(0, 0, 0, 0);

    // Skip past dates
    if (currentDate < today) {
      continue;
    }

    // Correct day name
    const dayName = DAYS[currentDate.getDay()].toLowerCase();

    console.log({
      date: currentDate.toLocaleDateString('en-CA'),

      dayName,

      availableDays,
    });
    // Not scheduled
    if (!availableDays.includes(dayName)) {
      continue;
    }

    // Leave check
    const isOnLeave = leaves.some((leave) => {
      const leaveStart = new Date(leave.startDate);

      const leaveEnd = new Date(leave.endDate);

      leaveStart.setHours(0, 0, 0, 0);

      leaveEnd.setHours(0, 0, 0, 0);

      return currentDate >= leaveStart && currentDate <= leaveEnd;
    });

    if (isOnLeave) {
      continue;
    }

    // Add available date
    // availableDates.push(currentDate.toISOString().split('T')[0]);
    const formattedDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1,
    ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

    availableDates.push(formattedDate);
  }

  return {
    availableDates,
  };
};
