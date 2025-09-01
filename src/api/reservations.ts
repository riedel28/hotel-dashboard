import { client, handleApiError } from '@/api/client';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import {
  reservationStatusSchema,
  guestSchema,
  reservationSchema,
  fetchReservationsParamsSchema,
  fetchReservationsResponseSchema,
  createReservationSchema,
  type CheckinMethod,
  type ReservationStatus,
  type Reservation,
  type Guest,
  type FetchReservationsParams,
  type FetchReservationsResponse,
  type CreateReservationData
} from '../../shared/types/reservations';

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
  data: CreateReservationData
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
  createReservationSchema,
  guestSchema,
  reservationSchema,
  reservationStatusSchema,
  reservationsQueryOptions,
  type Reservation,
  type Guest,
  type CheckinMethod,
  type ReservationStatus,
  type CreateReservationData
};
