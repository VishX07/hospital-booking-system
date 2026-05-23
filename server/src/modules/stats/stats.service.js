import User from '../../models/User.model.js';
import Doctor from '../../models/Doctor.model.js';
import Appointment from '../../models/Appointment.model.js';
import Department from '../../models/Department.model.js';

export const getPublicStatsService = async () => {
  const [patients, doctors, appointments, departments] = await Promise.all([
    User.countDocuments({
      role: 'patient',
    }),

    Doctor.countDocuments({
      approvalStatus: 'approved',
      isActive: true,
    }),

    Appointment.countDocuments(),

    Department.countDocuments(),
  ]);

  return {
    success: true,

    stats: {
      patients,
      doctors,
      appointments,
      departments,
    },
  };
};
