import { client, handleApiError } from '@/api/client';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

const reservationStatusSchema = z.enum(['pending', 'started', 'done', 'all']);

const checkinMethodSchema = z.enum(['android', 'ios', 'tv', 'station', 'web']);

const guestSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  nationality_code: z.enum(['DE', 'US', 'AT', 'CH'])
});

const reservationSchema = z.object({
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
  balance: z.coerce.number(),
  // Detail view-only fields are optional in list responses
  adults: z.coerce.number().int().nonnegative().optional(),
  youth: z.coerce.number().int().nonnegative().optional(),
  children: z.coerce.number().int().nonnegative().optional(),
  infants: z.coerce.number().int().nonnegative().optional(),
  purpose: z.enum(['private', 'business']).optional(),
  room: z.string().optional()
});

const fetchReservationsParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  per_page: z.number().int().positive().default(10),
  q: z.string().optional(),
  status: reservationStatusSchema.default('all').optional(),
  from: z.date().optional(),
  to: z.date().optional()
});

const fetchReservationsResponseSchema = z.object({
  index: z.array(reservationSchema),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().positive(),
  pageCount: z.number().int().positive()
});

type CheckinMethod = z.infer<typeof checkinMethodSchema>;
type ReservationStatus = z.infer<typeof reservationStatusSchema>;
type Reservation = z.infer<typeof reservationSchema>;
type Guest = z.infer<typeof guestSchema>;
type FetchReservationsParams = z.infer<typeof fetchReservationsParamsSchema>;
type FetchReservationsResponse = z.infer<
  typeof fetchReservationsResponseSchema
>;

function reservationsQueryOptions({
  page,
  per_page,
  status,
  q,
  from,
  to
}: FetchReservationsParams) {
  return queryOptions({
    queryKey: ['reservations', page, per_page, status, q, from, to],
    queryFn: () => fetchReservations({ page, per_page, status, q, from, to }),
    placeholderData: keepPreviousData
  });
}

async function fetchReservations(
  params: FetchReservationsParams
): Promise<FetchReservationsResponse> {
  try {
    const validatedParams = fetchReservationsParamsSchema.parse(params);
    const response = await client.get('/reservations', {
      params: validatedParams
    });
    return fetchReservationsResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchReservations');
  }
}

async function fetchReservationById(id: string): Promise<Reservation> {
  try {
    const response = await client.get(`/reservations/${id}`);
    return reservationSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchReservationById');
  }
}

async function updateReservationById(
  id: string,
  updates: Pick<
    Reservation,
    | 'booking_nr'
    | 'guests'
    | 'adults'
    | 'youth'
    | 'children'
    | 'infants'
    | 'purpose'
    | 'room'
  >
): Promise<Reservation> {
  try {
    const response = await client.patch(`/reservations/${id}`, updates);
    return reservationSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'updateReservationById');
  }
}

async function createReservation(
  data: Pick<Reservation, 'booking_nr' | 'room' | 'page_url'>
): Promise<Reservation> {
  try {
    const response = await client.post('/reservations', data);
    return reservationSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'createReservation');
  }
}

async function deleteReservationById(id: string): Promise<void> {
  try {
    await client.delete(`/reservations/${id}`);
  } catch (err) {
    handleApiError(err, 'deleteReservationById');
  }
}

export {
  fetchReservations,
  fetchReservationById,
  updateReservationById,
  createReservation,
  deleteReservationById,
  fetchReservationsParamsSchema,
  fetchReservationsResponseSchema,
  guestSchema,
  reservationSchema,
  reservationStatusSchema,
  reservationsQueryOptions,
  type Reservation,
  type Guest,
  type CheckinMethod,
  type ReservationStatus
};
