import { buildApiUrl, getEndpointUrl } from '@/config/api';
import { Reservation } from '@/routes/_dashboard-layout/(user-view)/(front-office)/reservations/-components/reservations-table/reservations-table';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';

type ReservationsResponse = {
  index: Reservation[];
  total: number;
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
    throw new Error('Network response was not ok');
  }

  const totalCount = response.headers.get('X-Total-Count');
  const data = await response.json();

  return { index: data, total: totalCount ? parseInt(totalCount, 10) : 0 };
}

export { fetchReservations, reservationsQueryOptions };
