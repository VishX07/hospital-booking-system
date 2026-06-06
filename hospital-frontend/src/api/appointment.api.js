import api from './axios.instance.js';

// Book appointment
export const bookAppointment = (data) => api.post('/appointments', data);

// export const getMyAppointments = () => api.get('/appointments/my');
export const getMyAppointments = (filters = '') =>
  api.get(`/appointments/my${filters ? `?${filters}` : ''}`);

export const getAppointmentById = (appointmentId) =>
  api.get(`/appointments/${appointmentId}`);

export const cancelAppointment = (appointmentId, data) =>
  api.patch(`/appointments/${appointmentId}/cancel`, data);
export const getPrescriptionsByAppointmentId = (appointmentId) =>
  api.get(`/prescriptions/appointment/${appointmentId}`);

// export const getDoctorAppointments = (status = '') =>
//   api.get(`/appointments/doctor${status ? `?status=${status}` : ''}`);

export const getDoctorAppointments = (filters = '') =>
  api.get(`/appointments/doctor${filters ? `?${filters}` : ''}`);

export const updateAppointmentStatus = (appointmentId, data) =>
  api.patch(`/appointments/${appointmentId}/status`, data);

export const confirmAppointment = (appointmentId) =>
  api.patch(`/appointments/${appointmentId}/confirm`);

export const rejectAppointment = (appointmentId) =>
  api.patch(`/appointments/${appointmentId}/reject`);
export const completeAppointment = (appointmentId) =>
  api.patch(`/appointments/${appointmentId}/complete`);

export const rescheduleAppointment = (appointmentId, data) =>
  api.patch(`/appointments/${appointmentId}/reschedule`, data);
export const getAvailableSlots = (doctorId, date) =>
  api.get(`/appointments/doctor/${doctorId}/slots?date=${date}`);
