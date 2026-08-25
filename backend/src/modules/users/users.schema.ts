import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(['Administrator', 'Engineer', 'Manager', 'Auditor', 'User']),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  role: z.enum(['Administrator', 'Engineer', 'Manager', 'Auditor', 'User']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
});

export const assignRoleSchema = z.object({
  role: z.enum(['Administrator', 'Engineer', 'Manager', 'Auditor', 'User']),
});

export const userQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  role: z.string().optional(),
});
