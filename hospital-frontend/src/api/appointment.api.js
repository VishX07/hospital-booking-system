import api from './axios.instance.js';

// Book appointment
export const bookAppointment = (data) => api.post('/appointments', data);

export const getMyAppointments = () => api.get('/appointments/my');

export const getAppointmentById = (appointmentId) =>
  api.get(`/appointments/${appointmentId}`);

export const cancelAppointment = (appointmentId, data) =>
  api.patch(`/appointments/${appointmentId}/cancel`, data);
export const getPrescriptionsByAppointmentId = (appointmentId) =>
  api.get(`/prescriptions/appointment/${appointmentId}`);
