import { z } from 'zod';

// Search params every paged list shares.

/** 1-based page number. */
export const pageSchema = z.coerce.number().int().positive();

/**
 * Free-text search. Coerced: the router reads a search that looks like a
 * number (?q=1704, card digits) as one.
 */
export const searchQuerySchema = z.coerce.string().max(200);

/** Rows per page: one of the sizes the tables offer. */
export const perPageSchema = z.coerce
  .number()
  .int()
  .positive()
  .refine((val) => [5, 10, 25, 50, 100].includes(val), {
    message: 'per_page must be one of: 5, 10, 25, 50, 100'
  });

/**
 * A list filter: a repeated query key arrives as an array, a single one as a
 * string.
 */
export const queryListSchema = <T extends z.ZodType>(item: T) =>
  z.preprocess(
    (value) => (value === undefined || Array.isArray(value) ? value : [value]),
    z.array(item).optional()
  );

export const sortOrderSchema = z.enum(['asc', 'desc']);

/** An ISO date or datetime. */
export const isoDateStringSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'must be an ISO date'
  });
