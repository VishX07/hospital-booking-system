import cron from 'node-cron';
import Appointment from '../models/Appointment.model.js';
import Doctor from '../models/Doctor.model.js';
import User from '../models/User.model.js';
import { createNotification } from '../modules/notification/notification.service.js';
import { sendAppointmentReminderEmail } from '../services/email.service.js';
export const startAppointmentReminderJob = () => {
  // Every 5 minutes
  cron.schedule(
    '*/5 * * * *',

    async () => {
      try {
        const now = new Date();

        // 1 hour later
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        // Find appointments
        const appointments = await Appointment.find({
          status: 'confirmed',

          reminderSent: false,

          appointmentDate: {
            $gte: new Date(now.setHours(0, 0, 0, 0)),

            $lte: new Date(oneHourLater.setHours(23, 59, 59, 999)),
          },
        });

        for (const appointment of appointments) {
          // Create exact appointment datetime
          const [hours, minutes] = appointment.timeSlot.split(':').map(Number);

          const appointmentTime = new Date(appointment.appointmentDate);

          appointmentTime.setHours(hours, minutes, 0, 0);

          // Time difference
          const diffMins = (appointmentTime - now) / 1000 / 60;

          // Send reminder
          if (diffMins <= 60 && diffMins > 0) {
            const doctor = await Doctor.findById(appointment.doctorId).populate(
              'userId',
              'fullName',
            );

            const patient = await User.findById(appointment.patientId).select(
              'fullName email',
            );

            // Patient notification
            await createNotification({
              userId: appointment.patientId,

              title: 'Appointment Reminder',

              message: `Reminder:
You have an appointment
today at ${appointment.timeSlot}
with Dr ${doctor?.userId?.fullName}.`,

              type: 'appointment',

              metadata: {
                appointmentId: appointment._id,
              },
            });

            // Doctor notification
            await createNotification({
              userId: doctor.userId._id,

              title: 'Appointment Reminder',

              message: `Reminder:
You have an appointment
today at ${appointment.timeSlot}
with ${patient.fullName}.`,

              type: 'appointment',

              metadata: {
                appointmentId: appointment._id,
              },
            });

            // Reminder email
            await sendAppointmentReminderEmail({
              email: patient.email,

              patientName: patient.fullName,

              doctorName: doctor.userId.fullName,

              appointmentDate: appointment.appointmentDate,

              timeSlot: appointment.timeSlot,

              consultationType: appointment.consultationType,

              meetingLink: appointment.meetingLink,
            });

            // Mark sent
            appointment.reminderSent = true;

            await appointment.save();
          }
        }

        console.log('Appointment reminder cron running...');
      } catch (error) {
        console.error('Reminder Cron Error:', error);
      }
    },
  );
};
