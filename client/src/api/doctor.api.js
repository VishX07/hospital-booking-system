import api from './axios.instance.js';

export const getAllDoctors = (params) => api.get('/doctors', { params });
export const getDoctorById = (id) => api.get(`/doctors/${id}`);
export const createDoctorProfile = (data) => api.post('/doctors/profile', data);
export const getDoctorProfile = () => api.get('/doctors/me');
export const updateDoctorProfile = (data) => api.put('/doctors/profile', data);
export const getDoctorSuggestions = (q) =>
  api.get('/doctors/suggestions', {
    params: { q },
  });
