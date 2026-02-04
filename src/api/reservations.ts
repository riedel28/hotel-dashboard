import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { client, handleApiError } from '@/api/client';

import {
  type CheckinMethod,
  type CreateReservationData,
  createReservationSchema,
  type FetchReservationsParams,
  type FetchReservationsResponse,
  fetchReservationsParamsSchema,
  fetchReservationsResponseSchema,
  type Guest,
  guestSchema,
  type Reservation,
  type ReservationStatus,
  reservationSchema,
  reservationStatusSchema,
  type UpdateReservationData
} from '../../shared/types/reservations';

function reservationsQueryOptions({
  page,
  per_page,
  status,
  q,
  from,
  to,
  sort_by,
  sort_order
}: FetchReservationsParams) {
  return queryOptions({
    queryKey: [
      'reservations',
      page,
      per_page,
      status,
      q,
      from,
      to,
      sort_by,
      sort_order
    ],
    queryFn: () =>
      fetchReservations({
        page,
        per_page,
        status,
        q,
        from,
        to,
        sort_by,
        sort_order
      }),
    placeholderData: keepPreviousData
  });
}

function reservationByIdQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['reservations', id],
    queryFn: () => fetchReservationById(id)
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
  updates: UpdateReservationData
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
  reservationByIdQueryOptions,
  type Reservation,
  type Guest,
  type CheckinMethod,
  type ReservationStatus,
  type CreateReservationData
};
