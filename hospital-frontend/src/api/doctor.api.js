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

export const getMyPatients = () => api.get('/doctors/my-patients');

export const getPatientDetails = async (patientId) => {
  return await api.get(`/doctors/patients/${patientId}`);
};

export const createDoctorProfile = (formData) =>
  api.post('/doctors/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const updateDoctorProfile = (data) =>
  api.patch('/doctors/profile', data);
