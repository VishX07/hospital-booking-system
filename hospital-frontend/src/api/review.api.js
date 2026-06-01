import api from './axios.instance.js';

export const getDoctorReviews = (doctorId) =>
  api.get(`/reviews/doctor/${doctorId}`);
