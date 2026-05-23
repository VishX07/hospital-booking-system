import { z } from 'zod';

export const signupSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(3, 'Full name must be at least 3 characters'),

  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address'),

  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .min(1, 'Phone number is required'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters'),

  role: z.enum(['patient', 'doctor']).default('patient'),
});

export const loginSchema = z.object({
  identifier: z
    .string({
      required_error: 'Email or phone number is required',
    })
    .min(1, 'Email or phone number is required'),

  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(8, 'Password must be at least 8 characters'),
});
export const verifyOTPSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address'),

  otp: z
    .string({ required_error: 'OTP is required' })
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export const resendOTPSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address'),
});

export const sendPasswordResetOtpSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Please provide a valid email address'),
});

export const verifyPasswordResetOtpSchema = z.object({
  email: z.string().email('Please provide a valid email address').optional(),

  otp: z
    .string({
      required_error: 'OTP is required',
    })
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export const updatePasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address').optional(),

  otp: z
    .string({
      required_error: 'OTP is required',
    })
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),

  newPassword: z
    .string({
      required_error: 'New password is required',
    })
    .min(8, 'Password must be at least 8 characters'),
});
