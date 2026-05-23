import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .optional(),

    phoneNumber: z
      .string()
      .trim()
      .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits')
      .optional(),

    gender: z.enum(['male', 'female', 'other']).optional(),

    dateOfBirth: z.string().date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });
