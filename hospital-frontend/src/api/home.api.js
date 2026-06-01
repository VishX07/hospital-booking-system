// home.api.js

import api from './axios.instance.js';

export const getPublicStats = () => api.get('/stats/public');

export const getDepartments = () => api.get('/departments');

export const getAllDoctors = () => api.get('/doctors');
