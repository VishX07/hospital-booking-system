import Schedule from '../../models/Schedule.model.js';
import Doctor from '../../models/Doctor.model.js';
import ApiError from '../../utils/ApiError.js';
import Appointment from '../../models/Appointment.model.js';

export const createScheduleService = async (userId, scheduleData) => {
  // 1. Find doctor profile
  const doctor = await Doctor.findOne({
    userId,
  });

  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  // 2. Check approval status
  if (doctor.approvalStatus !== 'approved') {
    throw new ApiError(403, 'Doctor profile is not approved yet');
  }
  // 3. Check active status
  if (!doctor.isActive) {
    throw new ApiError(403, 'Doctor profile is inactive');
  }
  // 3. Check duplicate schedule
  const existing = await Schedule.findOne({
    doctorId: doctor._id,
    dayOfWeek: scheduleData.dayOfWeek,
  });

  if (existing) {
    throw new ApiError(409, 'Schedule already exists for this day');
  }

  // 4. Get schedule data
  const { startTime, endTime, breakStart, breakEnd } = scheduleData;

  // 5. Validate break pair
  if ((breakStart && !breakEnd) || (!breakStart && breakEnd)) {
    throw new ApiError(400, 'Break start and break end must both be provided');
  }

  // 6. Validate time order
  if (startTime >= endTime) {
    throw new ApiError(400, 'End time must be after start time');
  }

  // 7. Validate break range
  if (breakStart && breakEnd) {
    if (
      breakStart < startTime ||
      breakEnd > endTime ||
      breakStart >= breakEnd
    ) {
      throw new ApiError(400, 'Invalid break time');
    }
  }

  // 8. Create schedule
  const schedule = await Schedule.create({
    ...scheduleData,
    doctorId: doctor._id,
  });

  // 9. Return response
  return {
    message: 'Schedule created successfully.',
    schedule,
  };
};
export const getMySchedulesService = async (userId) => {
  // 1. Find doctor profile
  const doctor = await Doctor.findOne({
    userId,
  });

  // 2. Doctor not found
  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  // 3. Get schedules
  const schedules = await Schedule.find({
    doctorId: doctor._id,
  }).sort({
    createdAt: 1,
  });

  // 4. Return response
  return {
    schedules,
  };
};

export const getDoctorSchedulesService = async (doctorId) => {
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

  // 3. Get schedules
  const schedules = await Schedule.find({
    doctorId,
    isAvailable: true,
  }).sort({
    dayOfWeek: 1,
  });

  // 4. Return response
  return {
    schedules,
  };
};

//update my schedule
export const updateScheduleService = async (userId, scheduleId, updateData) => {
  // 1. Find doctor
  const doctor = await Doctor.findOne({
    userId,
  });

  // 2. Doctor not found
  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  // 3. Find schedule
  const schedule = await Schedule.findById(scheduleId);

  // 4. Schedule not found
  if (!schedule) {
    throw new ApiError(404, 'Schedule not found');
  }

  // 5. Ownership check
  if (schedule.doctorId.toString() !== doctor._id.toString()) {
    throw new ApiError(403, 'Unauthorized access');
  }

  // 6. Update schedule
  const updatedSchedule = await Schedule.findByIdAndUpdate(
    scheduleId,
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
    message: 'Schedule updated successfully.',
    schedule: updatedSchedule,
  };
};

export const toggleScheduleAvailabilityService = async (userId, scheduleId) => {
  // 1. Find doctor profile
  const doctor = await Doctor.findOne({
    userId,
  });

  // 2. Doctor not found
  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  // 3. Find schedule
  const schedule = await Schedule.findById(scheduleId);

  // 4. Schedule not found
  if (!schedule) {
    throw new ApiError(404, 'Schedule not found');
  }

  // 5. Ownership check
  if (schedule.doctorId.toString() !== doctor._id.toString()) {
    throw new ApiError(403, 'Unauthorized access');
  }
  const DAYS = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  // Only when disabling
  if (schedule.isAvailable) {
    const existingAppointments = await Appointment.find({
      doctorId: doctor._id,

      status: {
        $in: ['pending', 'confirmed'],
      },
    });

    const hasConflict = existingAppointments.some((appointment) => {
      const appointmentDay =
        DAYS[new Date(appointment.appointmentDate).getDay()];

      return appointmentDay === schedule.dayOfWeek;
    });

    if (hasConflict) {
      throw new ApiError(
        400,
        `Cannot disable ${schedule.dayOfWeek}.
Appointments already exist.`,
      );
    }
  }

  // 6. Toggle availability
  schedule.isAvailable = !schedule.isAvailable;

  await schedule.save();

  // 7. Return response
  return {
    message: `Schedule ${
      schedule.isAvailable ? 'enabled' : 'disabled'
    } successfully.`,
    schedule,
  };
};
