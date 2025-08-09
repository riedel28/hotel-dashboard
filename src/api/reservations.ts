import { buildApiUrl, buildResourceUrl, getEndpointUrl } from '@/config/api';
import { Reservation } from '@/routes/_dashboard-layout/(user-view)/(front-office)/reservations/-components/reservations-table/reservations-table';
import { t } from '@lingui/core/macro';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';

type ReservationsResponse = {
  index: Reservation[];
  total: number;
};

// Details shape expected by the edit reservation form
export type ReservationDetails = {
  booking_nr: string;
  guests: {
    id: string;
    first_name: string;
    last_name: string;
    nationality_code: 'DE' | 'US' | 'AT' | 'CH';
  }[];
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
    _page: page,
    _limit: perPage
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

  const totalCount = response.headers.get('X-Total-Count');
  const data = await response.json();

  return { index: data, total: totalCount ? parseInt(totalCount, 10) : 0 };
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
