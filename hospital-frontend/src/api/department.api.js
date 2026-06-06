import api from './axios.instance.js';

// Get all departments
export const getDepartments = () => api.get('/departments');
