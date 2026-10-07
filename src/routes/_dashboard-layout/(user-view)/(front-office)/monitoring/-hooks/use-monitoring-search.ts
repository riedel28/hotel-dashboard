import { useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import {
  functionalUpdate,
  type PaginationState,
  type SortingState,
  type Updater
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import {
  type MonitoringPeriod,
  sortableMonitoringColumnsSchema
} from 'shared/types/monitoring';

import {
  type MonitoringLogsQuery,
  monitoringQueryOptions
} from '@/api/monitoring';

const routeApi = getRouteApi(
  '/_dashboard-layout/(user-view)/(front-office)/monitoring/'
);

const DEFAULT_PERIOD: MonitoringPeriod = '24h';
const DEFAULT_PAGE_SIZE = 50;

// Everything "Clear filters" resets. Sorting and page size are not filters.
const clearedFilters = {
  q: undefined,
  status: undefined,
  type: undefined,
  booking_nr: undefined,
  period: undefined,
  from: undefined,
  to: undefined
} satisfies MonitoringLogsQuery;

const filterKeys = Object.keys(clearedFilters) as Array<
  keyof typeof clearedFilters
>;

/**
 * Owns everything derived from the monitoring search params: the query they
 * produce, the shapes the filters and the table expect, and the navigations
 * that write them back. The page stays pure composition.
 */
function useMonitoringSearch() {
  const { log: openLogId, ...search } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  // The time window is either a custom range or a relative period, never both
  const hasCustomRange = Boolean(search.from || search.to);
  const period = hasCustomRange ? undefined : (search.period ?? DEFAULT_PERIOD);

  const logsQuery = useQuery(monitoringQueryOptions({ ...search, period }));

  // Filters replace the history entry and always return to the first page
  const setFilters = (filters: MonitoringLogsQuery) => {
    navigate({
      search: (prev) => ({ ...prev, ...filters, page: undefined }),
      replace: true
    });
  };

  const hasActiveFilters = filterKeys.some((key) => {
    if (key === 'period') {
      return period !== undefined && period !== DEFAULT_PERIOD;
    }
    const value = search[key];
    return Array.isArray(value) ? value.length > 0 : value !== undefined;
  });

  const pagination: PaginationState = {
    pageIndex: search.page - 1,
    pageSize: search.per_page
  };
  const sorting: SortingState = [
    { id: search.sort_by, desc: search.sort_order === 'desc' }
  ];

  return {
    logsQuery,
    filters: {
      q: search.q,
      status: search.status,
      type: search.type ?? [],
      reservation: search.booking_nr,
      period,
      from: search.from,
      to: search.to
    },
    hasActiveFilters,
    setFilters,
    clearFilters: () => setFilters(clearedFilters),
    setPeriod: (next: MonitoringPeriod) =>
      setFilters({ period: next, from: undefined, to: undefined }),
    setRange: (range: { from: Date; to: Date }) =>
      setFilters({
        period: undefined,
        from: dayjs(range.from).format('YYYY-MM-DD'),
        to: dayjs(range.to).format('YYYY-MM-DD')
      }),
    toggleReservationFilter: (bookingNr: string) =>
      setFilters({
        booking_nr: bookingNr === search.booking_nr ? undefined : bookingNr
      }),

    pagination,
    sorting,
    onPaginationChange: (updater: Updater<PaginationState>) => {
      const next = functionalUpdate(updater, pagination);
      navigate({
        search: (prev) => ({
          ...prev,
          page: next.pageIndex + 1,
          per_page: next.pageSize
        }),
        replace: true
      });
    },
    onSortingChange: (updater: Updater<SortingState>) => {
      const [first] = functionalUpdate(updater, sorting);
      setFilters({
        // A column the API cannot sort by falls back to the default
        sort_by: sortableMonitoringColumnsSchema
          .catch('logged_at')
          .parse(first?.id),
        sort_order: first?.desc === false ? 'asc' : 'desc'
      });
    },

    // Opening and closing a log push history entries, so Back closes the
    // drawer; stepping between logs replaces the current entry.
    openLogId,
    openLog: (logId: number) =>
      navigate({ search: (prev) => ({ ...prev, log: logId }) }),
    selectLog: (logId: number) =>
      navigate({ search: (prev) => ({ ...prev, log: logId }), replace: true }),
    closeLog: () =>
      navigate({ search: (prev) => ({ ...prev, log: undefined }) }),
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
  useMonitoringSearch
};
