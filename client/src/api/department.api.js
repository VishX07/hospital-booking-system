import api from "./axios.instance.js";

export const getAllDepartments = () => api.get("/departments");
