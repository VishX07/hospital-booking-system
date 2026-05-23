import api from './axios.instance.js';

export const bookAppointment = (data) => api.post('/appointments', data);

export const getMyAppointments = (params) =>
  api.get('/appointments/my', { params });
export const getAppointmentById = (id) => api.get(`/appointments/${id}`);

export const cancelAppointment = (id) =>
  api.patch(`/appointments/${id}/cancel`);

export const rescheduleAppointment = (id, d) =>
  api.patch(`/appointments/${id}/reschedule`, d);

export const getAvailableSlots = (doctorId, date) =>
  api.get(`/appointments/slots`, { params: { doctorId, date } });
