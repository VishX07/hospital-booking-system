import api from './axios.instance.js';

// Get all doctors
export const getAllDoctors = (params) =>
  api.get('/doctors', {
    params,
  });

// Get single doctor
export const getDoctorById = (id) => api.get(`/doctors/${id}`);

// Doctor suggestions
export const getDoctorSuggestions = (q) =>
  api.get('/doctors/suggestions', {
    params: {
      q,
    },
  });
