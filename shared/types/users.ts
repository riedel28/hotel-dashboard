import { z } from 'zod';

export const roleSchema = z.object({
  id: z.number(),
  name: z.string()
});

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  country_code: z.string().length(2).nullable(),
  selected_property_id: z.string().uuid().nullable().optional(),
  is_admin: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  roles: z.array(roleSchema)
});

export const sortableColumnsSchema = z.enum([
  'email',
  'first_name',
  'last_name',
  'country_code',
  'is_admin',
  'created_at'
]);

export const sortOrderSchema = z.enum(['asc', 'desc']);

export const fetchUsersParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  per_page: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => [5, 10, 25, 50, 100].includes(val), {
      message: 'per_page must be one of: 5, 10, 25, 50, 100'
    })
    .default(10)
    .optional(),
  q: z.string().max(200).optional(),
  sort_by: sortableColumnsSchema.optional(),
  sort_order: sortOrderSchema.default('desc').optional()
});

export const fetchUsersResponseSchema = z.object({
  index: z.array(userSchema),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  page_count: z.number().int().nonnegative()
});

export const userIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const fetchUserByIdSchema = userIdParamsSchema;

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  country_code: z.string().length(2).nullable().optional(),
  is_admin: z.boolean().optional(),
  role_ids: z.array(z.number().int().positive()).optional()
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  country_code: z.string().length(2).nullable().optional(),
  is_admin: z.boolean().optional(),
  role_ids: z.array(z.number().int().positive()).optional()
});

export const updateSelectedPropertySchema = z.object({
  selected_property_id: z.string().uuid().nullable().optional()
});

// Type exports
export type Role = z.infer<typeof roleSchema>;
export type User = z.infer<typeof userSchema>;
export type FetchUsersParams = z.infer<typeof fetchUsersParamsSchema>;
export type FetchUsersResponse = z.infer<typeof fetchUsersResponseSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type UpdateSelectedPropertyData = z.infer<
  typeof updateSelectedPropertySchema
>;
