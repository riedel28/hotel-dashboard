import { z } from 'zod';

export const reservationStatusSchema = z.enum([
  'pending',
  'started',
  'done',
  'all'
]);

export const checkinMethodSchema = z.enum([
  'android',
  'ios',
  'tv',
  'station',
  'web'
]);

export const guestSchema = z.object({
  id: z.number(),
  reservation_id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().optional(),
  nationality_code: z.enum(['DE', 'US', 'AT', 'CH']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export const reservationSchema = z.object({
  id: z.number(),
  state: reservationStatusSchema,
  booking_nr: z.string(),
  guest_email: z.email(),
  guests: z.array(guestSchema),
  booking_id: z.string(),
  room_name: z.string(),
  booking_from: z.coerce.date(),
  booking_to: z.coerce.date(),
  check_in_via: checkinMethodSchema,
  check_out_via: checkinMethodSchema,
  primary_guest_name: z.string(),
  last_opened_at: z.coerce.date().nullable(),
  received_at: z.coerce.date(),
  completed_at: z.coerce.date().nullable(),
  updated_at: z.coerce.date().nullable(),
  page_url: z.url(),
  balance: z.number(),
  // Detail view-only fields are optional in list responses
  adults: z.coerce.number().int().nonnegative().optional(),
  youth: z.coerce.number().int().nonnegative().optional(),
  children: z.coerce.number().int().nonnegative().optional(),
  infants: z.coerce.number().int().nonnegative().optional(),
  purpose: z.enum(['private', 'business']).optional(),
  room: z.string().optional()
});

export const fetchReservationsParamsSchema = z.object({
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
  q: z.string().optional(),
  status: reservationStatusSchema.default('all').optional(),
  from: z.iso.date().optional(),
  to: z.iso.date().optional()
});

export const fetchReservationsResponseSchema = z.object({
  index: z.array(reservationSchema),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  page_count: z.number().int().nonnegative()
});

export const reservationIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const fetchReservationByIdSchema = reservationIdParamsSchema;

export const createReservationSchema = reservationSchema.pick({
  booking_nr: true,
  room: true,
  page_url: true
});

export const updateReservationSchema = reservationSchema
  .omit({
    id: true,
    updated_at: true
  })
  .partial();

// Type exports
export type CheckinMethod = z.infer<typeof checkinMethodSchema>;
export type ReservationStatus = z.infer<typeof reservationStatusSchema>;
export type Reservation = z.infer<typeof reservationSchema>;
export type Guest = z.infer<typeof guestSchema>;
export type FetchReservationsParams = z.infer<
  typeof fetchReservationsParamsSchema
>;
export type FetchReservationsResponse = z.infer<
  typeof fetchReservationsResponseSchema
>;
export type CreateReservationData = z.infer<typeof createReservationSchema>;
export type UpdateReservationData = z.infer<typeof updateReservationSchema>;
