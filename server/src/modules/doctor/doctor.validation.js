import { z } from 'zod';

export const createDoctorProfileSchema = z.object({
  department: z.string({ required_error: 'Department is required' }).trim(),

  specialization: z
    .string({ required_error: 'Specialization is required' })
    .trim()
    .min(2, 'Specialization must be at least 2 characters'),

  qualification: z
    .string({ required_error: 'Qualification is required' })
    .trim()
    .min(2, 'Qualification must be at least 2 characters'),

  experience: z.coerce
    .number({
      required_error: 'Experience is required',
    })
    .min(0, 'Experience cannot be negative'),

  bio: z.string().trim().optional(),

  consultationMode: z
    .enum(['online', 'offline', 'both'], {
      errorMap: () => ({
        message: 'Consultation mode must be online, offline, or both',
      }),
    })
    .optional(),

  consultationFee: z.coerce
    .number({
      required_error: 'Consultation fee is required',
    })
    .min(0, 'Consultation fee cannot be negative'),
});

export const updateDoctorApprovalSchema = z
  .object({
    approvalStatus: z.enum(['approved', 'rejected']),

    rejectionReason: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.approvalStatus === 'rejected' && !data.rejectionReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,

        message: 'Rejection reason is required',
        path: ['rejectionReason'],
      });
    }
  });

export const updateDoctorProfileSchema = z
  .object({
    specialization: z
      .string()
      .trim()
      .min(2, 'Specialization must be at least 2 characters')
      .optional(),

    qualification: z
      .string()
      .trim()
      .min(2, 'Qualification must be at least 2 characters')
      .optional(),

    experience: z.coerce
      .number()
      .min(0, 'Experience cannot be negative')
      .optional(),

    bio: z.string().trim().optional(),

    consultationMode: z.enum(['online', 'offline', 'both']).optional(),

    consultationFee: z.coerce
      .number()
      .min(0, 'Consultation fee cannot be negative')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });
