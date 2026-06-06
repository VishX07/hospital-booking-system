import api from './axios.instance.js';

// Get doctor schedules
export const getDoctorSchedules = (doctorId) =>
  api.get(`/schedules/doctor/${doctorId}`);

export const getSchedules = () => api.get('/schedules/my');

export const createSchedule = (data) => api.post('/schedules', data);

export const updateSchedule = (scheduleId, data) =>
  api.patch(`/schedules/${scheduleId}`, data);

export const toggleSchedule = (scheduleId) =>
  api.patch(`/schedules/${scheduleId}/toggle`);

export const getDoctorLeaves = () => api.get('/doctor-leaves/my');

export const createDoctorLeave = (data) => api.post('/doctor-leaves', data);

export const deleteDoctorLeave = (leaveId) =>
  api.delete(`/doctor-leaves/${leaveId}`);

//update doctor schedule
export const updateDoctorSchedule = (scheduleId, data) =>
  api.patch(`/schedules/${scheduleId}`, data);
