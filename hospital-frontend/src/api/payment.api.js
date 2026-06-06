import api from './axios.instance.js';

export const createPaymentOrder = (doctorId) =>
  api.post('/payments/create-order', { doctorId });

export const verifyPayment = (data) => api.post('/payments/verify', data);

export const bookOfflineAppointment = (appointmentData) =>
  api.post('/payments/book-offline', { appointmentData });
