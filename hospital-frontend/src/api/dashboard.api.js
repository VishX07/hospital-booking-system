// dashboard.api.js

import api from './axios.instance';

export const getPatientDashboard = () => api.get('/dashboard/patient');
export const getDoctorDashboard = () => api.get('/dashboard/doctor');
