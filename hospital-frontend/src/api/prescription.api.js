import api from './axios.instance';

export const createPrescription = (data) => api.post('/prescriptions', data);

export const getPrescriptionByAppointment = (appointmentId) =>
  api.get(`/prescriptions/appointment/${appointmentId}`);

export const getMyPrescriptions = () => api.get('/prescriptions/my');

export const updatePrescription = (prescriptionId, data) =>
  api.patch(`/prescriptions/${prescriptionId}`, data);

export const downloadPrescription = (prescriptionId) =>
  api.get(`/prescriptions/${prescriptionId}/download`, {
    responseType: 'blob',
  });

export const getFollowUpData = (prescriptionId) =>
  api.get(`/prescriptions/${prescriptionId}/follow-up-data`);

export const getPatientPrescriptions = (patientId) =>
  api.get(`/prescriptions/patient/${patientId}`);

export const getPatientPrescriptionHistory = (patientId) =>
  api.get(`/prescriptions/patient/${patientId}`);

export const getPrescriptionById = (prescriptionId) => {
  console.log('prescriptionId:', prescriptionId);
  return api.get(`/prescriptions/${prescriptionId}`);
};
