import Doctor from '../../models/Doctor.model.js';
import Appointment from '../../models/Appointment.model.js';
import Schedule from '../../models/Schedule.model.js';
import ApiError from '../../utils/ApiError.js';
import User from '../../models/User.model.js';

const DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

//********DOCTOR DASHBOARD SERVICES******** //

export const getDoctorDashboardService = async (userId) => {
  // 1. Find doctor
  const doctor = await Doctor.findOne({
    userId,
  });

  // 2. Doctor not found
  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found');
  }

  // 3. Today date
  const today = new Date();

  const startOfDay = new Date(today.setHours(0, 0, 0, 0));

  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  // 4. Today's appointments
  const todayAppointments = await Appointment.countDocuments({
    doctorId: doctor._id,

    appointmentDate: {
      $gte: startOfDay,

      $lte: endOfDay,
    },

    status: {
      $nin: ['cancelled', 'rejected'],
    },
  });

  // 5. Pending appointments
  const pendingAppointments = await Appointment.countDocuments({
    doctorId: doctor._id,

    status: 'pending',
  });

  // 6. Completed appointments
  const completedAppointments = await Appointment.countDocuments({
    doctorId: doctor._id,

    status: 'completed',
  });

  // 7. Total unique patients
  const patients = await Appointment.distinct('patientId', {
    doctorId: doctor._id,
  });

  const totalPatients = patients.length;

  // 8. Today's schedule
  const todayDay = DAYS[new Date().getDay()];

  const todaySchedule = await Schedule.findOne({
    doctorId: doctor._id,

    dayOfWeek: todayDay,

    isAvailable: true,
  });

  // 9. Upcoming appointments
  const upcomingAppointments = await Appointment.find({
    doctorId: doctor._id,

    appointmentDate: {
      $gte: startOfDay,
    },

    status: 'confirmed',
  })
    .populate('patientId', 'fullName profilePicture')
    .sort({
      appointmentDate: 1,
    })
    .limit(5);

  // 10. Return response
  return {
    dashboard: {
      todayAppointments,

      pendingAppointments,

      completedAppointments,

      totalPatients,

      todaySchedule,

      upcomingAppointments,
    },
  };
};

//********PATIENT DASHBOARD SERVICES******** //
export const getPatientDashboardService = async (userId) => {
  // 1. Check patient exists
  const patient = await User.findById(userId);

  // 2. Patient not found
  if (!patient) {
    throw new ApiError(404, 'User not found');
  }

  // 3. Check role
  if (patient.role !== 'patient') {
    throw new ApiError(403, 'Only patients can access dashboard');
  }

  // 4. Today's date
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  // 5. Upcoming appointments
  const upcomingAppointments = await Appointment.countDocuments({
    patientId: userId,

    appointmentDate: {
      $gte: today,
    },

    status: {
      $nin: ['cancelled', 'rejected', 'completed'],
    },
  });

  // 6. Completed appointments
  const completedAppointments = await Appointment.countDocuments({
    patientId: userId,

    status: 'completed',
  });

  // 7. Cancelled appointments
  const cancelledAppointments = await Appointment.countDocuments({
    patientId: userId,

    status: 'cancelled',
  });

  // 8. Pending appointments
  const pendingAppointments = await Appointment.countDocuments({
    patientId: userId,

    status: 'pending',
  });

  // 9. Recent appointments
  const recentAppointments = await Appointment.find({
    patientId: userId,
  })
    .populate({
      path: 'doctorId',

      populate: [
        {
          path: 'userId',

          select: 'fullName profilePicture',
        },

        {
          path: 'department',

          select: 'name',
        },
      ],
    })
    .sort({
      appointmentDate: -1,
      timeSlot: 1,
    })
    .limit(5);

  // 10. Return response
  return {
    dashboard: {
      upcomingAppointments,

      completedAppointments,

      cancelledAppointments,

      pendingAppointments,

      recentAppointments,
    },
  };
};

//********ADMIN DASHBOARD SERVICES******** //

export const getAdminDashboardService = async () => {
  // 1. Today start/end
  const today = new Date();

  const startOfDay = new Date(today.setHours(0, 0, 0, 0));

  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  // 2. Total doctors
  const totalDoctors = await Doctor.countDocuments();

  // 3. Approved doctors
  const approvedDoctors = await Doctor.countDocuments({
    approvalStatus: 'approved',
  });

  // 4. Pending doctors
  const pendingDoctors = await Doctor.countDocuments({
    approvalStatus: 'pending',
  });

  // 5. Total patients
  const totalPatients = await User.countDocuments({
    role: 'patient',
  });

  // 6. Total appointments
  const totalAppointments = await Appointment.countDocuments();

  // 7. Today's appointments
  const todayAppointments = await Appointment.countDocuments({
    appointmentDate: {
      $gte: startOfDay,

      $lte: endOfDay,
    },

    status: {
      $nin: ['cancelled', 'rejected'],
    },
  });

  // 8. Recent pending doctors
  const recentPendingDoctors = await Doctor.find({
    approvalStatus: 'pending',
  })
    .populate('userId', 'fullName email profilePicture')
    .populate('department', 'name')
    .sort({
      createdAt: -1,
    })
    .limit(5);

  // 9. Return response
  return {
    dashboard: {
      totalDoctors,

      approvedDoctors,

      pendingDoctors,

      totalPatients,

      totalAppointments,

      todayAppointments,

      recentPendingDoctors,
    },
  };
};
