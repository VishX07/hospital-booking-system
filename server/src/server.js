import '../src/config/env.js';
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { startAppointmentReminderJob } from './jobs/appointmentReminder.job.js';
connectDB();
startAppointmentReminderJob();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
