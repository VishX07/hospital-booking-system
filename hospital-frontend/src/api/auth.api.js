import api from './axios.instance.js';

// Signup
export const signup = (data) => api.post('/auth/signup', data);

// Verify OTP
export const verifyOTP = (data) => api.post('/auth/verify-otp', data);

// Login
export const login = (data) => api.post('/auth/login', data);

// Logout
export const logout = () => api.post('/auth/logout');

// Current User
export const getCurrentUser = () => api.get('/auth/me');

// Forgot Password
export const forgotPassword = (data) =>
  api.post('/auth/send-password-reset-otp', data);

// Update Forgot Password
export const updatePassword = (data) =>
  api.patch('/auth/update-password', data);

// Send OTP for logged user
export const changePassword = () => api.post('/auth/send-change-password-otp');

// Verify OTP + change
export const changeNewPassword = (data) =>
  api.patch('/auth/change-password', data);

// user.api.js

export const updateProfile = (data) => api.patch('/users/update-profile', data);

export const updateProfilePhoto = (formData) =>
  api.patch('/users/profile-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const googleLogin = (data) => api.post('/auth/google-login', data);
export const googleLoginWithToken = (accessToken) =>
  api.post('/auth/google-login-token', { accessToken });
