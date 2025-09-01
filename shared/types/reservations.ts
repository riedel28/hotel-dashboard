import { z } from 'zod';

export const reservationStatusSchema = z.enum(['pending', 'started', 'done', 'all']);

export const checkinMethodSchema = z.enum(['android', 'ios', 'tv', 'station', 'web']);

export const guestSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  nationality_code: z.enum(['DE', 'US', 'AT', 'CH'])
});

export const reservationSchema = z.object({
  id: z.number(),
  state: reservationStatusSchema,
  booking_nr: z.string(),
  guest_email: z.string(),
  guests: z.array(guestSchema),
  booking_id: z.string(),
  room_name: z.string(),
  booking_from: z.string(),
  booking_to: z.string(),
  check_in_via: checkinMethodSchema,
  check_out_via: checkinMethodSchema,
  primary_guest_name: z.string(),
  last_opened_at: z.coerce.date().nullable(),
  received_at: z.coerce.date(),
  completed_at: z.coerce.date().nullable(),
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
  page: z.number().int().positive().default(1),
  per_page: z.number().int().positive().default(10),
  q: z.string().optional(),
  status: reservationStatusSchema.default('all').optional(),
  from: z.date().optional(),
  to: z.date().optional()
});

export const fetchReservationsResponseSchema = z.object({
  index: z.array(reservationSchema),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().positive(),
  pageCount: z.number().int().positive()
});

export const createReservationSchema = z.object({
  booking_nr: z.string(),
  room: z.string(),
  page_url: z.string()
});

// Type exports
export type CheckinMethod = z.infer<typeof checkinMethodSchema>;
export type ReservationStatus = z.infer<typeof reservationStatusSchema>;
export type Reservation = z.infer<typeof reservationSchema>;
export type Guest = z.infer<typeof guestSchema>;
export type FetchReservationsParams = z.infer<typeof fetchReservationsParamsSchema>;
export type FetchReservationsResponse = z.infer<typeof fetchReservationsResponseSchema>;
export type CreateReservationData = z.infer<typeof createReservationSchema>;