import api from "./axios.instance.js";

export const createPrescription  = (data) => api.post("/prescriptions", data);
export const getMyPrescriptions  = ()     => api.get("/prescriptions/my");
export const getPrescriptionById = (id)   => api.get(`/prescriptions/${id}`);
export const downloadPrescription= (id)   => api.get(`/prescriptions/${id}/download`, {
  responseType: "blob",
});
