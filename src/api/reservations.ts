import { buildApiUrl, buildResourceUrl, getEndpointUrl } from '@/config/api';
import { t } from '@lingui/core/macro';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

// Schemas and types (moved from src/types/reservations.ts)
export const ReservationStatusSchema = z.enum(['pending', 'started', 'done']);
export type ReservationStatus = z.infer<typeof ReservationStatusSchema>;

export const CheckinMethodSchema = z.enum([
  'android',
  'ios',
  'tv',
  'station',
  'web'
]);
export type CheckinMethod = z.infer<typeof CheckinMethodSchema>;

export const GuestSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  nationality_code: z.enum(['DE', 'US', 'AT', 'CH'])
});
export type Guest = z.infer<typeof GuestSchema>;

export const ReservationSchema = z.object({
  id: z.number(),
  state: ReservationStatusSchema,
  booking_nr: z.string(),
  guest_email: z.string(),
  guests: z.array(GuestSchema),
  booking_id: z.string(),
  room_name: z.string(),
  booking_from: z.string(),
  booking_to: z.string(),
  check_in_via: CheckinMethodSchema,
  check_out_via: CheckinMethodSchema,
  primary_guest_name: z.string(),
  last_opened_at: z.string(),
  received_at: z.string(),
  completed_at: z.string(),
  page_url: z.string(),
  balance: z.number(),
  adults: z.number(),
  youth: z.number(),
  children: z.number(),
  infants: z.number(),
  purpose: z.enum(['private', 'business']),
  room: z.string()
});
export type Reservation = z.infer<typeof ReservationSchema>;

type ReservationsResponse = {
  index: Reservation[];
  page: number;
  per_page: number;
  total: number;
  pageCount: number;
};

// Details shape expected by the edit reservation form
export type ReservationDetails = {
  booking_nr: string;
  guests: Guest[];
  adults: number;
  youth: number;
  children: number;
  infants: number;
  purpose: 'private' | 'business';
  room: string;
};

function reservationsQueryOptions({
  page,
  perPage,
  status,
  q
}: {
  page: number;
  perPage: number;
  status?: string;
  q?: string;
}) {
  return queryOptions({
    queryKey: ['reservations', page, perPage, status, q],
    queryFn: () => fetchReservations({ page, perPage, status, q }),
    placeholderData: keepPreviousData
  });
}

async function fetchReservations({
  page,
  perPage,
  status,
  q
}: {
  page: number;
  perPage: number;
  status?: string;
  q?: string;
}): Promise<ReservationsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const params: Record<string, string | number> = {
    page: page,
    per_page: perPage
  };

  if (status && status !== 'all') {
    params.status = status;
  }

  if (q) {
    params.q = q;
  }

  const response = await fetch(
    buildApiUrl(getEndpointUrl('reservations'), params)
  );
  if (!response.ok) {
    throw new Error(t`Network response was not ok`);
  }

  const data = await response.json();

  return data;
}

async function fetchReservationById(id: string): Promise<ReservationDetails> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const response = await fetch(buildResourceUrl('reservations', id));

  if (response.status === 404) {
    throw new Error(t`Reservation not found`);
  }

  if (!response.ok) {
    throw new Error(t`Network response was not ok`);
  }

  const raw = await response.json();
  const details: ReservationDetails = {
    booking_nr: raw?.booking_nr ?? '',
    guests: Array.isArray(raw?.guests) ? raw.guests : [],
    adults: typeof raw?.adults === 'number' ? raw.adults : 0,
    youth: typeof raw?.youth === 'number' ? raw.youth : 0,
    children: typeof raw?.children === 'number' ? raw.children : 0,
    infants: typeof raw?.infants === 'number' ? raw.infants : 0,
    purpose: raw?.purpose === 'business' ? 'business' : 'private',
    room: raw?.room ?? raw?.room_name ?? ''
  };
  return details;
}

export { fetchReservations, reservationsQueryOptions, fetchReservationById };
