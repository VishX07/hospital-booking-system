import express from 'express';
import cors from 'cors';
import { sendOTPEmail } from './services/email.service.js';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/error.middleware.js';

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://hospital-booking-system-sable.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.get('/', (req, res) => {
  res.send('Hospital API Running');
});

app.get('/api/v1/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend Connected Successfully',
  });
});

//routes
import authRoutes from './modules/auth/auth.route.js';
import departmentRoutes from './modules/department/department.route.js';
import doctorRoutes from './modules/doctor/doctor.route.js';
import scheduleRoutes from './modules/schedule/schedule.route.js';
import appointmentRoutes from './modules/appointment/appointment.route.js';
import userRoutes from './modules/user/user.route.js';
import dashboardRoutes from './modules/dashboard/dashboard.route.js';
import adminRoutes from './modules/admin/admin.route.js';
import notificationRoutes from './modules/notification/notification.route.js';
import reviewRoutes from './modules/review/review.routes.js';
import doctorLeaveRoutes from './modules/doctor-leaves/doctorLeave.route.js';
import prescriptionRoutes from './modules/prescription/prescription.route.js';
import statsRoutes from './modules/stats/stats.route.js';
import paymentRoutes from './modules/payment/payment.route.js';
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/doctor-leaves', doctorLeaveRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/payments', paymentRoutes);

app.use(errorHandler);
export default app;
