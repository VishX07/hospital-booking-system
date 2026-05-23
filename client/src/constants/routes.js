const ROUTES = Object.freeze({
  HOME: '/',

  DOCTORS: '/doctors',
  DOCTOR_DETAIL: '/doctors/:id',

  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  ONBOARDING_CREATE: '/onboarding/create-profile',

  ONBOARDING_WAITING: '/onboarding/waiting',

  ONBOARDING_REJECTED: '/onboarding/rejected',

  PATIENT_DASHBOARD: '/patient/dashboard',

  PATIENT_APPOINTMENTS: '/patient/appointments',

  PATIENT_PRESCRIPTIONS: '/patient/prescriptions',

  PATIENT_SETTINGS: '/patient/settings',

  PATIENT_NOTIFICATIONS: '/patient/notifications',

  DOCTOR_DASHBOARD: '/doctor/dashboard',

  DOCTOR_APPOINTMENTS: '/doctor/appointments',

  DOCTOR_SCHEDULE: '/doctor/schedule',

  DOCTOR_PRESCRIPTIONS: '/doctor/prescriptions',

  DOCTOR_SETTINGS: '/doctor/settings',

  DOCTOR_NOTIFICATIONS: '/doctor/notifications',

  CONSULTATION: '/consultation/:appointmentId',

  UNAUTHORIZED: '/unauthorized',
});

export default ROUTES;
