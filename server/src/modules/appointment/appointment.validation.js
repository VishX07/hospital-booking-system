import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  doctorId: z.string({ required_error: 'Doctor is required' }),

  appointmentDate: z.coerce.date({
    required_error: 'Appointment date is required',
  }),

  timeSlot: z
    .string({ required_error: 'Time slot is required' })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time slot must be in HH:mm format'),

  consultationType: z.enum(['online', 'offline'], {
    errorMap: () => ({
      message: 'Consultation type must be online or offline',
    }),
  }),

  reasonForVisit: z
    .string({ required_error: 'Reason for visit is required' })
    .min(5, 'Reason must be at least 5 characters')
    .trim(),
});

export const cancelAppointmentSchema = z.object({
  cancelReason: z
    .string({
      required_error: 'Cancel reason is required',
    })
    .trim()
    .min(5, 'Cancel reason must be at least 5 characters'),
});
