import { createBrowserRouter } from 'react-router-dom';

// Guards
import ProtectedRoute from '../components/shared/ProtectedRoute.jsx';
import RoleGuard from '../components/shared/RoleGuard.jsx';
import OnboardingGuard from '../components/shared/OnboardingGuard.jsx';

// Route wrappers
import PublicRoutes from './PublicRoutes.jsx';
import OnboardingRoutes from './OnboardingRoutes.jsx';
import PatientRoutes from './PatientRoutes.jsx';
import DoctorRoutes from './DoctorRoutes.jsx';

// Pages: Public
import HomePage from '../pages/public/HomePage.jsx';
import DoctorsPage from '../pages/public/DoctorsPage.jsx';
import DoctorDetailPage from '../pages/public/DoctorDetailPage.jsx';
import LoginPage from '../pages/public/LoginPage.jsx';
import SignupPage from '../pages/public/SignupPage.jsx';
import OTPPage from '../pages/public/OTPPage.jsx';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage.jsx';

// Pages: Onboarding
import CreateDoctorProfilePage from '../pages/onboarding/CreateDoctorProfilePage.jsx';
import WaitingApprovalPage from '../pages/onboarding/WaitingApprovalPage.jsx';
import RejectedPage from '../pages/onboarding/RejectedPage.jsx';

// Pages: Patient
import PatientDashboardPage from '../pages/patient/DashboardPage.jsx';
import PatientAppointmentsPage from '../pages/patient/AppointmentsPage.jsx';
import PatientPrescriptionsPage from '../pages/patient/PrescriptionsPage.jsx';
import PatientSettingsPage from '../pages/patient/SettingsPage.jsx';

// Pages: Doctor
import DoctorDashboardPage from '../pages/doctor/DashboardPage.jsx';
import DoctorAppointmentsPage from '../pages/doctor/AppointmentsPage.jsx';
import DoctorSchedulePage from '../pages/doctor/SchedulePage.jsx';
import DoctorPrescriptionsPage from '../pages/doctor/PrescriptionsPage.jsx';
import DoctorSettingsPage from '../pages/doctor/SettingsPage.jsx';

// Consultation
import ConsultationPage from '../pages/consultation/ConsultationPage.jsx';

// Error Pages
import NotFoundPage from '../pages/errors/NotFoundPage.jsx';
import UnauthorizedPage from '../pages/errors/UnauthorizedPage.jsx';

import ROLES from '../constants/roles.js';
import ROUTES from '../constants/routes.js';

const router = createBrowserRouter([
  // PUBLIC
  {
    element: <PublicRoutes />,
    children: [
      {
        path: ROUTES.HOME,
        element: <HomePage />,
      },
      {
        path: ROUTES.DOCTORS,
        element: <DoctorsPage />,
      },
      {
        path: ROUTES.DOCTOR_DETAIL,
        element: <DoctorDetailPage />,
      },
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.SIGNUP,
        element: <SignupPage />,
      },
      {
        path: ROUTES.VERIFY_OTP,
        element: <OTPPage />,
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        element: <ForgotPasswordPage />,
      },
    ],
  },

  // ONBOARDING (DOCTOR ONLY)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allowedRoles={[ROLES.DOCTOR]} />,

        children: [
          {
            element: <OnboardingRoutes />,
            children: [
              {
                path: ROUTES.ONBOARDING_CREATE,
                element: <CreateDoctorProfilePage />,
              },
              {
                path: ROUTES.ONBOARDING_WAITING,
                element: <WaitingApprovalPage />,
              },
              {
                path: ROUTES.ONBOARDING_REJECTED,
                element: <RejectedPage />,
              },
            ],
          },
        ],
      },
    ],
  },

  // PATIENT
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allowedRoles={[ROLES.PATIENT]} />,

        children: [
          {
            element: <PatientRoutes />,

            children: [
              {
                path: ROUTES.PATIENT_DASHBOARD,
                element: <PatientDashboardPage />,
              },

              {
                path: ROUTES.PATIENT_APPOINTMENTS,
                element: <PatientAppointmentsPage />,
              },

              {
                path: ROUTES.PATIENT_PRESCRIPTIONS,
                element: <PatientPrescriptionsPage />,
              },

              {
                path: ROUTES.PATIENT_SETTINGS,
                element: <PatientSettingsPage />,
              },
            ],
          },
        ],
      },
    ],
  },

  // DOCTOR
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allowedRoles={[ROLES.DOCTOR]} />,

        children: [
          {
            element: <OnboardingGuard />,

            children: [
              {
                element: <DoctorRoutes />,

                children: [
                  {
                    path: ROUTES.DOCTOR_DASHBOARD,
                    element: <DoctorDashboardPage />,
                  },

                  {
                    path: ROUTES.DOCTOR_APPOINTMENTS,
                    element: <DoctorAppointmentsPage />,
                  },

                  {
                    path: ROUTES.DOCTOR_SCHEDULE,
                    element: <DoctorSchedulePage />,
                  },

                  {
                    path: ROUTES.DOCTOR_PRESCRIPTIONS,
                    element: <DoctorPrescriptionsPage />,
                  },

                  {
                    path: ROUTES.DOCTOR_SETTINGS,
                    element: <DoctorSettingsPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // CONSULTATION
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allowedRoles={[ROLES.PATIENT, ROLES.DOCTOR]} />,

        children: [
          {
            path: ROUTES.CONSULTATION,

            element: <ConsultationPage />,
          },
        ],
      },
    ],
  },

  // ERRORS
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
