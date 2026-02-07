import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

export const registerSchema = z.object({
  email: z.email('Invalid email format'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

// User schemas
export const userSchema = z.object({
  id: z.number(),
  email: z.email(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  selected_property_id: z.string().uuid().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  is_admin: z.boolean()
});

export const authResponseSchema = z.object({
  user: userSchema
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type User = z.infer<typeof userSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
