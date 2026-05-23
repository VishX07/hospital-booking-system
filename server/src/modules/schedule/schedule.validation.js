import { z } from 'zod';

const timeFormat = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:mm format');

export const createScheduleSchema = z.object({
  dayOfWeek: z.enum(
    [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ],
    { errorMap: () => ({ message: 'Invalid day of week' }) },
  ),

  startTime: timeFormat,

  endTime: timeFormat,

  slotDuration: z.coerce
    .number()
    .min(5, 'Slot duration must be at least 5 minutes')
    .optional(),

  breakStart: timeFormat.optional(),

  breakEnd: timeFormat.optional(),
});

export const updateScheduleSchema = z
  .object({
    startTime: timeFormat.optional(),

    endTime: timeFormat.optional(),

    slotDuration: z.coerce
      .number()
      .min(5, 'Slot duration must be at least 5 minutes')
      .optional(),

    breakStart: timeFormat.optional(),

    breakEnd: timeFormat.optional(),

    isAvailable: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });
