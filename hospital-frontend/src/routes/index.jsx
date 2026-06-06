import { createBrowserRouter } from 'react-router-dom';

import ROUTES from '../constants/routes.js';

// Route Guards
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';
import PublicRoute from '../components/common/PublicRoute.jsx';
import RoleProtectedRoute from '../components/common/RoleProtectedRoute.jsx';
import DoctorApprovalRoute from '../components/common/DoctorApprovalRoute.jsx';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage.jsx';
import SignupPage from '../pages/auth/SignupPage.jsx';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';

// Public Pages
import HomePage from '../pages/common/HomePage.jsx';

// Common Pages
import ChangePasswordPage from '../pages/settings/ChangePasswordPage.jsx';
import NotificationsPage from '../pages/common/Notification.jsx';
import UnauthorizedPage from '../pages/common/UnauthorizedPage.jsx';
import NotFoundPage from '../pages/common/NotFoundPage.jsx';

// Patient Pages
import PatientDashboardPage from '../pages/patient/DashboardPage.jsx';
import DoctorsPage from '../pages/patient/DoctorsPage.jsx';
import DoctorDetailsPage from '../pages/patient/DoctorDetailsPage.jsx';
import AppointmentsPage from '../pages/patient/AppointmentsPage.jsx';
import AppointmentDetailsPage from '../pages/patient/AppointmentDetailsPage.jsx';
import PrescriptionsPage from '../pages/patient/PrescriptionsPage.jsx';
import PrescriptionDetailsPage from '../pages/patient/PrescriptionDetailsPage.jsx';
import PatientSettingsPage from '../pages/patient/SettingsPage.jsx';

// Doctor Onboarding
import CreateDoctorProfilePage from '../pages/onboarding/CreateDoctorProfilePage.jsx';

// Doctor Pages
import DoctorDashboardPage from '../pages/doctor/DashboardPage.jsx';
import DoctorAppointmentsPage from '../pages/doctor/AppointmentsPage.jsx';
import DoctorAppointmentDetailsPage from '../pages/doctor/DoctorAppointmentDetailsPage.jsx';
import DoctorAvailabilityPage from '../pages/doctor/SchedulePage.jsx';
import MyPatientsPage from '../pages/doctor/MyPatient.jsx';
import PatientDetailsPage from '../pages/doctor/PatientDetailsPage.jsx';
import DoctorPrescriptionsPage from '../pages/doctor/DoctorPrescriptionPage.jsx';
import PrescriptionDetailsForDoctor from '../pages/doctor/PrescriptionDetailsForDoctor.jsx';
import DoctorSettingsPage from '../pages/doctor/SettingsPage.jsx';

// Unused Imports (remove if not needed)
import OnboardingPage from '../pages/doctor/OnboardingPage.jsx';

const router = createBrowserRouter([
  // AUTH
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

  // PUBLIC
  {
    path: ROUTES.HOME,
    element: <HomePage />,
  },

  // COMMON
  {
    path: ROUTES.CHANGE_PASSWORD,
    element: (
      <ProtectedRoute>
        <ChangePasswordPage />
      </ProtectedRoute>
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

  // PATIENT

  {
    path: ROUTES.PATIENT_DASHBOARD,
    element: (
      <RoleProtectedRoute allowedRole="patient">
        <PatientDashboardPage />
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

  // DOCTOR ONBOARDING

  {
    path: ROUTES.CREATE_PROFILE,
    element: (
      <RoleProtectedRoute allowedRole="doctor">
        <CreateDoctorProfilePage />
      </RoleProtectedRoute>
    ),
  },

  // DOCTOR APPROVED

  {
    path: ROUTES.DOCTOR_DASHBOARD,
    element: (
      <RoleProtectedRoute allowedRole="doctor">
        <DoctorApprovalRoute>
          <DoctorDashboardPage />
        </DoctorApprovalRoute>
      </RoleProtectedRoute>
    ),
  },

  {
    path: ROUTES.DOCTOR_APPOINTMENTS,
    element: (
      <RoleProtectedRoute allowedRole="doctor">
        <DoctorApprovalRoute>
          <DoctorAppointmentsPage />
        </DoctorApprovalRoute>
      </RoleProtectedRoute>
    ),
  },

  {
    path: ROUTES.DOCTOR_APPOINTMENT_DETAILS,
    element: (
      <RoleProtectedRoute allowedRole="doctor">
        <DoctorApprovalRoute>
          <DoctorAppointmentDetailsPage />
        </DoctorApprovalRoute>
      </RoleProtectedRoute>
    ),
  },

  {
    path: ROUTES.DOCTOR_SCHEDULE,
    element: (
      <RoleProtectedRoute allowedRole="doctor">
        <DoctorApprovalRoute>
          <DoctorAvailabilityPage />
        </DoctorApprovalRoute>
      </RoleProtectedRoute>
    ),
  },

  {
    path: ROUTES.DOCTOR_PATIENTS,
    element: (
      <RoleProtectedRoute allowedRole="doctor">
        <DoctorApprovalRoute>
          <MyPatientsPage />
        </DoctorApprovalRoute>
      </RoleProtectedRoute>
    ),
  },

  {
    path: ROUTES.DOCTOR_PATIENT_DETAILS,
    element: (
      <RoleProtectedRoute allowedRole="doctor">
        <DoctorApprovalRoute>
          <PatientDetailsPage />
        </DoctorApprovalRoute>
      </RoleProtectedRoute>
    ),
  },

  {
    path: ROUTES.DOCTOR_PRESCRIPTIONS,
    element: (
      <RoleProtectedRoute allowedRole="doctor">
        <DoctorApprovalRoute>
          <DoctorPrescriptionsPage />
        </DoctorApprovalRoute>
      </RoleProtectedRoute>
    ),
  },

  {
    path: ROUTES.DOCTOR_PRESCRIPTION_DETAILS,
    element: (
      <RoleProtectedRoute allowedRole="doctor">
        <DoctorApprovalRoute>
          <PrescriptionDetailsForDoctor />
        </DoctorApprovalRoute>
      </RoleProtectedRoute>
    ),
  },

  {
    path: ROUTES.DOCTOR_SETTINGS,
    element: (
      <RoleProtectedRoute allowedRole="doctor">
        <DoctorApprovalRoute>
          <DoctorSettingsPage />
        </DoctorApprovalRoute>
      </RoleProtectedRoute>
    ),
  },
  // FALLBACK

  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
