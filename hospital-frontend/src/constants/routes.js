const ROUTES = {
  // Public
  HOME: '/',

  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY_OTP: '/verify-otp',

  FORGOT_PASSWORD: '/forgot-password',
  CHANGE_PASSWORD: '/change-password',

  UNAUTHORIZED: '/unauthorized',

  // Patient
  PATIENT_DASHBOARD: '/patient/dashboard',

  PATIENT_APPOINTMENTS: '/patient/appointments',
  PATIENT_APPOINTMENT_DETAILS: '/patient/appointments/:id',

  PATIENT_PRESCRIPTIONS: '/patient/prescriptions',

  PATIENT_PRESCRIPTION_DETAILS: '/patient/prescriptions/:id',

  PATIENT_SETTINGS: '/patient/settings',

  UPDATE_PROFILE: '/profile/update',

  // Doctors Listing
  DOCTORS: '/doctors',
  DOCTOR_DETAILS: '/doctors/:id',

  // Doctor
  DOCTOR_DASHBOARD: '/doctor/dashboard',

  DOCTOR_APPOINTMENTS: '/doctor/appointments',

  DOCTOR_APPOINTMENT_DETAILS: '/doctor/appointments/:id',

  DOCTOR_SCHEDULE: '/doctor/schedule',

  DOCTOR_PRESCRIPTIONS: '/doctor/prescriptions',

  DOCTOR_PRESCRIPTION_DETAILS: '/doctor/prescriptions/:id',

  DOCTOR_SETTINGS: '/doctor/settings',

  CREATE_PROFILE: '/doctor/create-profile',

  WAITING_APPROVAL: '/doctor/waiting',

  REJECTED: '/doctor/rejected',

  // Shared
  NOTIFICATIONS: '/notifications',
};

export default ROUTES;
