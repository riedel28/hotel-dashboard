import { z } from 'zod';

// A title must begin with an A–Z letter so it buckets cleanly into the
// alphabetical directory. The bucket letter is derived from this on the server.
const titleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(200, 'Title must be at most 200 characters')
  .refine((value) => /^[a-zA-Z]/.test(value), {
    message: 'Title must start with a letter (A–Z)'
  });

const descriptionSchema = z
  .string()
  .trim()
  .min(1, 'Description is required')
  .max(2000, 'Description must be at most 2000 characters');

export const guestAbcEntrySchema = z.object({
  id: z.number().int().positive(),
  property_id: z.string().uuid(),
  letter: z.string().length(1),
  title: z.string().min(1),
  description: z.string().min(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// The list endpoint returns the full directory for the caller's property;
// the client groups it into A–Z buckets.
export const fetchGuestAbcResponseSchema = z.array(guestAbcEntrySchema);

export const createGuestAbcEntrySchema = z.object({
  title: titleSchema,
  description: descriptionSchema
});

export const updateGuestAbcEntrySchema = z.object({
  title: titleSchema.optional(),
  description: descriptionSchema.optional()
});

export const guestAbcIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

// Derive the bucket letter from a title. Assumes the title has already passed
// `titleSchema` (i.e. starts with an A–Z letter).
export function deriveLetter(title: string): string {
  return title.trim().charAt(0).toLowerCase();
}

// Type exports
export type GuestAbcEntry = z.infer<typeof guestAbcEntrySchema>;
export type FetchGuestAbcResponse = z.infer<typeof fetchGuestAbcResponseSchema>;
export type CreateGuestAbcEntryData = z.infer<typeof createGuestAbcEntrySchema>;
export type UpdateGuestAbcEntryData = z.infer<typeof updateGuestAbcEntrySchema>;
