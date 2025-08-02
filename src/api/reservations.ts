import { buildApiUrl, getEndpointUrl } from '@/config/api';
import { Reservation } from '@/routes/_dashboard-layout/(user-view)/(front-office)/reservations/-components/reservations-table/columns';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';

type ReservationsResponse = {
  index: Reservation[];
  total: number;
};

function reservationsQueryOptions({
  page,
  perPage
}: {
  page: number;
  perPage: number;
}) {
  return queryOptions({
    queryKey: ['reservations', page, perPage],
    queryFn: () => fetchReservations({ page, perPage }),
    placeholderData: keepPreviousData
  });
}

async function fetchReservations({
  page,
  perPage
}: {
  page: number;
  perPage: number;
}): Promise<ReservationsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const response = await fetch(
    buildApiUrl(getEndpointUrl('reservations'), {
      _page: page,
      _limit: perPage
    })
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const totalCount = response.headers.get('X-Total-Count');
  const data = await response.json();

  return { index: data, total: totalCount ? parseInt(totalCount, 10) : 0 };
}

export { fetchReservations, reservationsQueryOptions };
