import api from './axios.instance';

export const downloadPrescription = (prescriptionId) =>
  api.get(`/prescriptions/${prescriptionId}/download`, {
    responseType: 'blob',
  });

export const getMyPrescriptions = () => api.get('/prescriptions/my');
