import api from './axios.instance.js';

// Update profile photo
export const updateProfilePhoto = (formData) =>
  api.patch('/users/profile-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
