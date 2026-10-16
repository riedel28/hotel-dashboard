import { getRouteApi } from '@tanstack/react-router';
import dayjs from 'dayjs';
import type {
  EventCategory,
  EventPeriod,
  FetchEventsParams
} from 'shared/types/events';

const routeApi = getRouteApi(
  '/_dashboard-layout/(user-view)/(content-manager)/events/'
);

export interface EventFilters {
  q?: string;
  category?: EventCategory[];
  period: EventPeriod;
  from?: string;
  to?: string;
}

export type EventSortColumn = NonNullable<FetchEventsParams['sort_by']>;

/**
 * Everything the events page keeps in the URL: the filters, the sorting and
 * the page, with the navigations that write them. They all replace the
 * history entry.
 */
export function useEventsSearch() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const { q, category, period, from, to, sort_by, sort_order, page, per_page } =
    search;

  const params: FetchEventsParams = {
    q,
    category,
    period,
    from,
    to,
    sort_by,
    sort_order,
    page,
    per_page
  };

  const setFilters = (next: Partial<EventFilters>) =>
    navigate({
      search: (prev) => ({ ...prev, ...next, page: undefined }),
      replace: true
    });

  return {
    params,
    filters: { q, category, period, from, to } satisfies EventFilters,
    hasActiveFilters: Boolean(
      q || category?.length || from || to || period !== 'upcoming'
    ),
    setFilters,
    // Picked as calendar days, which the API reads in the hotel's timezone
    setDateRange: (range: { from: Date; to: Date } | undefined) =>
      setFilters({
        from: range?.from && dayjs(range.from).format('YYYY-MM-DD'),
        to: range?.to && dayjs(range.to).format('YYYY-MM-DD')
      }),
    clearFilters: () =>
      navigate({
        search: (prev) => ({
          sort_by: prev.sort_by,
          sort_order: prev.sort_order,
          per_page: prev.per_page
        }),
        replace: true
      }),

    sort: { by: sort_by, order: sort_order },
    setSort: (by: EventSortColumn, order: 'asc' | 'desc') =>
      navigate({
        search: (prev) => ({
          ...prev,
          sort_by: by,
          sort_order: order,
          page: undefined
        }),
        replace: true
      }),

    pageIndex: page - 1,
    pageSize: per_page,
    setPage: (pageIndex: number, pageSize: number) =>
      navigate({
        search: (prev) => ({
          ...prev,
          page: pageIndex + 1,
          per_page: pageSize
        }),
        replace: true
      })
  };
}

export type EventsSearch = ReturnType<typeof useEventsSearch>;
