import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import dayjs from 'dayjs';

import {
  type FetchReservationsParams,
  fromReservationStates,
  type ReservationState,
  reservationsQueryOptions,
  toReservationStates
} from '@/api/reservations';

const routeApi = getRouteApi(
  '/_dashboard-layout/(user-view)/(front-office)/reservations/'
);

type SortBy = NonNullable<FetchReservationsParams['sort_by']>;

const defaultPageSize = 10;
const defaultSorting: SortingState = [{ id: 'received_at', desc: true }];

const toDate = (value: string | undefined) =>
  value ? new Date(value) : undefined;

const toDateParam = (value: Date | undefined) =>
  value ? dayjs(value).format('YYYY-MM-DD') : undefined;

/**
 * Owns everything derived from the reservations search params: the query they
 * produce, the shapes the filter and table components expect, and the
 * navigations that write them back. The page stays pure composition.
 */
function useReservationsSearch() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const queryClient = useQueryClient();

  const { page, per_page, status, q, from, to, sort_by, sort_order } = search;
  const reservationsQuery = useSuspenseQuery(reservationsQueryOptions(search));

  const updateSearch = (patch: Partial<FetchReservationsParams>) => {
    navigate({
      to: '/reservations',
      search: (prev) => ({ ...prev, ...patch })
    });
  };

  const pageIndex = (page ?? 1) - 1;
  const pageSize = per_page ?? defaultPageSize;
  const selectedStatuses = toReservationStates(status);
  const sorting: SortingState = sort_by
    ? [{ id: sort_by, desc: sort_order === 'desc' }]
    : defaultSorting;

  return {
    reservationsQuery,
    searchTerm: q,
    selectedStatuses,
    dateRange: { from: toDate(from), to: toDate(to) },
    sorting,
    pageIndex,
    pageSize,
    hasActiveFilters: Boolean(q || from || to || selectedStatuses.length > 0),

    // Every filter change resets to the first page — the old page number is
    // meaningless against a different result set.
    setSearchTerm: (searchTerm: string) =>
      updateSearch({ page: 1, q: searchTerm || undefined }),

    setStatuses: (statuses: ReservationState[]) =>
      updateSearch({ page: 1, status: fromReservationStates(statuses) }),

    setDateRange: (range: { from?: Date; to?: Date } | undefined) =>
      updateSearch({
        page: 1,
        from: toDateParam(range?.from),
        to: toDateParam(range?.to)
      }),

    setPagination: (
      updaterOrValue:
        | PaginationState
        | ((old: PaginationState) => PaginationState)
    ) => {
      const next =
        typeof updaterOrValue === 'function'
          ? updaterOrValue({ pageIndex, pageSize })
          : updaterOrValue;

      updateSearch({ page: next.pageIndex + 1, per_page: next.pageSize });
    },

    setSorting: (
      updaterOrValue: SortingState | ((old: SortingState) => SortingState)
    ) => {
      const next =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(sorting)
          : updaterOrValue;
      const [firstSort] = next;

      updateSearch({
        page: 1,
        sort_by: firstSort ? (firstSort.id as SortBy) : undefined,
        sort_order: firstSort ? (firstSort.desc ? 'desc' : 'asc') : undefined
      });
    },

    clearFilters: () =>
      navigate({
        to: '/reservations',
        search: {
          page: 1,
          per_page,
          status: 'all',
          q: undefined,
          from: undefined,
          to: undefined,
          sort_by: undefined,
          sort_order: undefined
        }
      }),

    refresh: () =>
      queryClient.invalidateQueries({
        queryKey: reservationsQueryOptions(search).queryKey
      })
  };
}

export { useReservationsSearch };
