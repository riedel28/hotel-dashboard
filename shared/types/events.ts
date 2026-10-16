import { z } from 'zod';

import {
  isoDateStringSchema,
  pageSchema,
  perPageSchema,
  searchQuerySchema,
  sortOrderSchema
} from './list-params';
import { countryCodeSchema } from './properties';

// Events a property runs for its guests. Times travel as ISO instants; the
// admin enters and shows them in the property's timezone.

// ponytail: a fixed list; a per-property category table when hotels ask for
// their own.
export const eventCategorySchema = z.enum([
  'music',
  'party',
  'food_drink',
  'wellness',
  'kids',
  'sports',
  'culture',
  'tour',
  'other'
]);

export const eventImageMaxBytes = 5 * 1024 * 1024;
export const eventImageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
export const eventImagesMax = 30;

/** The rules the save schema checks, by code; the admin words them. */
export const eventErrorCodes = {
  endOrder: 'event_end_order',
  doorsOrder: 'event_doors_order'
} as const;

export const eventSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string().nullable(),
  categories: z.array(eventCategorySchema),
  starts_at: z.string(),
  ends_at: z.string(),
  doors_open_at: z.string().nullable(),
  venue_name: z.string(),
  address_line_1: z.string(),
  address_line_2: z.string().nullable(),
  zip: z.string(),
  city: z.string(),
  country_code: z.string(),
  // In order; the first is the cover.
  image_ids: z.array(z.uuid()),
  created_at: z.string(),
  updated_at: z.string()
});

const requiredText = (message: string) =>
  z.string().trim().min(1, message).max(200);

const instantSchema = z.iso.datetime({ offset: true });

// Create and update both send the whole event.
export const saveEventSchema = z
  .object({
    title: requiredText('Title is required'),
    // HTML; the server sanitizes it on write. The limit counts the markup.
    description: z.string().max(20_000).nullable(),
    categories: z
      .array(eventCategorySchema)
      .transform((ids) => [...new Set(ids)]),
    starts_at: instantSchema,
    ends_at: instantSchema,
    doors_open_at: instantSchema.nullable(),
    venue_name: requiredText('Venue name is required'),
    address_line_1: requiredText('Street is required'),
    address_line_2: z
      .string()
      .trim()
      .max(200)
      .nullable()
      .transform((value) => value || null),
    zip: requiredText('Postal code is required'),
    city: requiredText('City is required'),
    country_code: countryCodeSchema,
    image_ids: z.array(z.uuid()).max(eventImagesMax)
  })
  .superRefine((data, ctx) => {
    const start = Date.parse(data.starts_at);
    if (Date.parse(data.ends_at) <= start) {
      ctx.addIssue({
        code: 'custom',
        path: ['ends_at'],
        message: eventErrorCodes.endOrder
      });
    }
    if (data.doors_open_at && Date.parse(data.doors_open_at) > start) {
      ctx.addIssue({
        code: 'custom',
        path: ['doors_open_at'],
        message: eventErrorCodes.doorsOrder
      });
    }
  });

// A repeated query key arrives as an array, a single one as a string
const listOf = <T extends z.ZodType>(item: T) =>
  z.preprocess(
    (value) => (value === undefined || Array.isArray(value) ? value : [value]),
    z.array(item).optional()
  );

export const eventPeriodSchema = z.enum(['upcoming', 'past', 'all']);
export const eventSortColumns = ['starts_at', 'title'] as const;

export const fetchEventsParamsSchema = z.object({
  page: pageSchema.default(1),
  per_page: perPageSchema.default(25),
  q: searchQuerySchema.optional(),
  category: listOf(eventCategorySchema),
  // Upcoming takes in what is running now: it has not ended yet.
  period: eventPeriodSchema.default('upcoming'),
  // Calendar days (YYYY-MM-DD) in the property's timezone; an event touching
  // any of them matches.
  from: isoDateStringSchema.optional(),
  to: isoDateStringSchema.optional(),
  sort_by: z.enum(eventSortColumns).optional(),
  sort_order: sortOrderSchema.optional()
});

export const fetchEventsResponseSchema = z.object({
  index: z.array(eventSchema),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  page_count: z.number().int().nonnegative()
});

export const eventIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export type EventCategory = z.infer<typeof eventCategorySchema>;
export type EventPeriod = z.infer<typeof eventPeriodSchema>;
// Not `Event`: that name is the DOM's.
export type HotelEvent = z.infer<typeof eventSchema>;
export type SaveEventData = z.input<typeof saveEventSchema>;
export type ParsedSaveEventData = z.output<typeof saveEventSchema>;
export type FetchEventsParams = z.input<typeof fetchEventsParamsSchema>;
export type ParsedEventsParams = z.output<typeof fetchEventsParamsSchema>;
export type FetchEventsResponse = z.infer<typeof fetchEventsResponseSchema>;
