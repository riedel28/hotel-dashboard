import { z } from 'zod';

// Search params every paged list shares.

/** Rows per page: one of the sizes the tables offer. */
export const perPageSchema = z.coerce
  .number()
  .int()
  .positive()
  .refine((val) => [5, 10, 25, 50, 100].includes(val), {
    message: 'per_page must be one of: 5, 10, 25, 50, 100'
  });

export const sortOrderSchema = z.enum(['asc', 'desc']);

/** An ISO date or datetime. */
export const isoDateStringSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'must be an ISO date'
  });
