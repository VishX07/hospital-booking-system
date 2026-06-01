import api from './axios.instance.js';

// Get doctor schedules
export const getDoctorSchedules = (doctorId) =>
  api.get(`/schedules/doctor/${doctorId}`);
