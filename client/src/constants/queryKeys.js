const QUERY_KEYS = Object.freeze({
  currentUser: ['currentUser'],

  // Doctors
  doctors: (filters) => ['doctors', filters],

  doctorById: (id) => ['doctor', id],

  // Appointments
  appointments: (userId) => ['appointments', userId],

  appointmentById: (id) => ['appointment', id],

  availableSlots: (doctorId, date) => ['slots', doctorId, date],

  // Schedule
  schedule: (doctorId) => ['schedule', doctorId],

  // Prescriptions
  prescriptions: (userId) => ['prescriptions', userId],

  prescriptionById: (id) => ['prescription', id],

  // Departments
  departments: ['departments'],

  // Notifications
  notifications: (userId) => ['notifications', userId],
});

export default QUERY_KEYS;
