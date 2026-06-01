import { createBrowserRouter } from 'react-router-dom';

import ROUTES from '../constants/routes.js';

import ProtectedRoute from '../components/common/ProtectedRoute.jsx';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage.jsx';
import SignupPage from '../pages/auth/SignupPage.jsx';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';

// Common Pages
import HomePage from '../pages/common/HomePage.jsx';
import UnauthorizedPage from '../pages/common/UnauthorizedPage.jsx';
import NotFoundPage from '../pages/common/NotFoundPage.jsx';

// Patient Pages
import PatientDashboardPage from '../pages/patient/DashboardPage.jsx';
import AppointmentsPage from '../pages/patient/AppointmentsPage.jsx';
import PrescriptionsPage from '../pages/patient/PrescriptionsPage.jsx';
import AppointmentDetailsPage from '../pages/patient/AppointmentDetailsPage.jsx';
// Doctor Pages
import DoctorDashboardPage from '../pages/doctor/DashboardPage.jsx';
import PublicRoute from '../components/common/PublicRoute.jsx';
import ChangePasswordPage from '../pages/settings/ChangePasswordPage.jsx';
import RoleProtectedRoute from '../components/common/RoleProtectedRoute.jsx';
import DoctorsPage from '../pages/patient/DoctorsPage.jsx';
import DoctorDetailsPage from '../pages/patient/DoctorDetailsPage.jsx';
import PrescriptionDetailsPage from '../pages/patient/PrescriptionDetailsPage.jsx';
import PatientSettingsPage from '../pages/patient/SettingsPage.jsx';
import NotificationsPage from '../pages/common/Notification.jsx';

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,

    element: <HomePage />,
  },

  {
    path: ROUTES.LOGIN,

    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },

  {
    path: ROUTES.SIGNUP,

    element: (
      <PublicRoute>
        <SignupPage />
      </PublicRoute>
    ),
  },

  {
    path: ROUTES.VERIFY_OTP,

    element: (
      <PublicRoute>
        <VerifyOtpPage />
      </PublicRoute>
    ),
  },

  {
    path: ROUTES.FORGOT_PASSWORD,

    element: (
      <PublicRoute>
        <ForgotPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.CHANGE_PASSWORD,

    element: (
      <ProtectedRoute>
        <ChangePasswordPage />
      </ProtectedRoute>
    ),
  },
  // Patient Dashboard
  {
    path: ROUTES.PATIENT_DASHBOARD,

    element: (
      <RoleProtectedRoute allowedRole="patient">
        <PatientDashboardPage />
      </RoleProtectedRoute>
    ),
  },
  // Doctor Dashboard
  {
    path: ROUTES.DOCTOR_DASHBOARD,

    element: (
      <RoleProtectedRoute allowedRole="doctor">
        <DoctorDashboardPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: ROUTES.DOCTORS,

    element: (
      <RoleProtectedRoute allowedRole="patient">
        <DoctorsPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: ROUTES.DOCTOR_DETAILS,

    element: (
      <RoleProtectedRoute allowedRole="patient">
        <DoctorDetailsPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: ROUTES.PATIENT_APPOINTMENTS,

    element: (
      <RoleProtectedRoute allowedRole="patient">
        <AppointmentsPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: ROUTES.PATIENT_APPOINTMENT_DETAILS,

    element: (
      <RoleProtectedRoute allowedRole="patient">
        <AppointmentDetailsPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: ROUTES.PATIENT_PRESCRIPTIONS,

    element: (
      <RoleProtectedRoute allowedRole="patient">
        <PrescriptionsPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: ROUTES.PATIENT_PRESCRIPTION_DETAILS,
    element: (
      <RoleProtectedRoute allowedRole="patient">
        <PrescriptionDetailsPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: ROUTES.PATIENT_SETTINGS,
    element: (
      <RoleProtectedRoute allowedRole="patient">
        <PatientSettingsPage />
      </RoleProtectedRoute>
    ),
  },
  {
    path: ROUTES.NOTIFICATIONS,
    element: (
      <ProtectedRoute>
        <NotificationsPage />
      </ProtectedRoute>
    ),
  },

  {
    path: ROUTES.UNAUTHORIZED,

    element: <UnauthorizedPage />,
  },

  {
    path: '*',

    element: <NotFoundPage />,
  },
]);

export default router;
