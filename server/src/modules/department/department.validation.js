import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z
    .string({ required_error: 'Department name is required' })
    .min(2, 'Name must be at least 2 characters'),

  description: z.string().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),

  description: z.string().optional(),
});
