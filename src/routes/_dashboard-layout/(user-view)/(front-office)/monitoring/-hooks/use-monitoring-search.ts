import { useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import type {
  PaginationState,
  SortingState,
  Updater
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import {
  type MonitoringPeriod,
  type MonitoringStatus,
  type MonitoringType,
  sortableMonitoringColumnsSchema
} from 'shared/types/monitoring';

import {
  type MonitoringLogsQuery,
  monitoringQueryOptions
} from '@/api/monitoring';
import {
  clearedParams,
  fromPagination,
  fromSorting,
  toPagination,
  toSorting
} from '@/lib/table-search';

const routeApi = getRouteApi(
  '/_dashboard-layout/(user-view)/(front-office)/monitoring/'
);

const DEFAULT_PERIOD: MonitoringPeriod = '24h';
const DEFAULT_PAGE_SIZE = 50;

// Everything "Clear filters" resets. Sorting and page size are not filters.
const filterKeys = [
  'q',
  'status',
  'type',
  'booking_nr',
  'period',
  'from',
  'to'
] as const satisfies ReadonlyArray<keyof MonitoringLogsQuery>;

/** Writes filters: replaces the history entry and returns to the first page. */
function useSetFilters() {
  const navigate = routeApi.useNavigate();

  return (filters: MonitoringLogsQuery) => {
    navigate({
      search: (prev) => ({ ...prev, ...filters, page: undefined }),
      replace: true
    });
  };
}

/**
 * The reservation the logs are narrowed to. Separate from the page hook so a
 * table cell can read and toggle it without the page threading it through.
 */
function useReservationFilter() {
  const reservation = routeApi.useSearch({
    select: (search) => search.booking_nr
  });
  const setFilters = useSetFilters();

  return {
    reservation,
    toggle: (bookingNr: string) =>
      setFilters({
        booking_nr: bookingNr === reservation ? undefined : bookingNr
      }),
    clear: () => setFilters({ booking_nr: undefined })
  };
}

/**
 * Owns everything derived from the monitoring search params: the query they
 * produce, the shapes the filters and the table expect, and the navigations
 * that write them back. The page stays pure composition.
 */
function useMonitoringSearch() {
  const { log: openLogId, ...search } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const setFilters = useSetFilters();

  // The time window is either a custom range or a relative period, never
  // both. A range is picked in whole days of the viewer's time zone.
  const hasCustomRange = Boolean(search.from || search.to);
  const period = hasCustomRange ? undefined : (search.period ?? DEFAULT_PERIOD);

  const logsQuery = useQuery(
    monitoringQueryOptions({
      ...search,
      period,
      from: search.from && dayjs(search.from).startOf('day').toISOString(),
      to: search.to && dayjs(search.to).endOf('day').toISOString()
    })
  );

  const hasActiveFilters = filterKeys.some((key) => {
    if (key === 'period') {
      return period !== undefined && period !== DEFAULT_PERIOD;
    }
    const value = search[key];
    return Array.isArray(value) ? value.length > 0 : value !== undefined;
  });

  const pagination = toPagination(search);
  const sorting = toSorting(search);

  return {
    logsQuery,

    filters: {
      query: search.q,
      status: search.status,
      types: search.type ?? [],
      period,
      from: search.from,
      to: search.to
    },
    hasActiveFilters,
    setQuery: (query: string) => setFilters({ q: query || undefined }),
    setStatus: (status: MonitoringStatus | undefined) => setFilters({ status }),
    setTypes: (types: MonitoringType[]) =>
      setFilters({ type: types.length > 0 ? types : undefined }),
    setPeriod: (next: MonitoringPeriod) =>
      setFilters({ period: next, from: undefined, to: undefined }),
    setRange: (range: { from: Date; to: Date }) =>
      setFilters({
        period: undefined,
        from: dayjs(range.from).format('YYYY-MM-DD'),
        to: dayjs(range.to).format('YYYY-MM-DD')
      }),
    clearFilters: () => setFilters(clearedParams(filterKeys)),

    pagination,
    sorting,
    onPaginationChange: (updater: Updater<PaginationState>) =>
      navigate({
        search: (prev) => ({ ...prev, ...fromPagination(updater, pagination) }),
        replace: true
      }),
    onSortingChange: (updater: Updater<SortingState>) =>
      setFilters(
        fromSorting(updater, sorting, (id) =>
          sortableMonitoringColumnsSchema.catch('logged_at').parse(id)
        )
      ),

    // Opening and closing a log push history entries, so Back closes the
    // drawer; stepping between logs replaces the current entry.
    openLogId,
    openLog: (logId: number) =>
      navigate({ search: (prev) => ({ ...prev, log: logId }) }),
    selectLog: (logId: number) =>
      navigate({ search: (prev) => ({ ...prev, log: logId }), replace: true }),
    closeLog: () =>
      navigate({ search: (prev) => ({ ...prev, log: undefined }) }),
    /** From the drawer: closes it and narrows the table to the reservation. */
    showReservationLogs: (bookingNr: string) =>
      navigate({
        search: (prev) => ({
          ...prev,
          booking_nr: bookingNr,
          page: undefined,
          log: undefined
        })
      })
  };
}

type MonitoringSearch = ReturnType<typeof useMonitoringSearch>;

export {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PERIOD,
  type MonitoringSearch,
  useMonitoringSearch,
  useReservationFilter
};
