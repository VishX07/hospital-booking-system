import api from "./axios.instance.js";

export const initiateMockPayment = (data) => api.post("/payments/mock", data);
export const getPaymentByAppointment = (appointmentId) =>
  api.get(`/payments/appointment/${appointmentId}`);
