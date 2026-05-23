import api from "./axios.instance.js";

export const signup          = (data)  => api.post("/auth/signup", data);
export const verifyOTP       = (data)  => api.post("/auth/verify-otp", data);
export const resendOTP       = (data)  => api.post("/auth/resend-otp", data);
export const login           = (data)  => api.post("/auth/login", data);
export const logout          = ()      => api.post("/auth/logout");
export const getCurrentUser  = ()      => api.get("/auth/me");
export const forgotPassword  = (data)  => api.post("/auth/forgot-password", data);
export const resetPassword   = (data)  => api.post("/auth/reset-password", data);
