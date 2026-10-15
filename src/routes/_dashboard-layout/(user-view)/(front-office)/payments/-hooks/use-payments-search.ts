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
  type PaymentStage,
  sortablePaymentColumnsSchema
} from 'shared/types/payments';

import { type PaymentsQuery, paymentsQueryOptions } from '@/api/payments';

const routeApi = getRouteApi(
  '/_dashboard-layout/(user-view)/(front-office)/payments/'
);

const DEFAULT_PAGE_SIZE = 50;

// Everything "Clear filters" resets. Sorting and page size are not filters.
const clearedFilters = {
  q: undefined,
  status: undefined,
  from: undefined,
  to: undefined
} satisfies PaymentsQuery;

/**
 * Owns everything derived from the payments search params: the query they
 * produce, the shapes the filters and the table expect, and the navigations
 * that write them back. The page stays pure composition.
 */
function usePaymentsSearch() {
  const { payment: openPaymentId, ...search } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  // Filters replace the history entry and return to the first page
  const setFilters = (filters: PaymentsQuery) =>
    navigate({
      search: (prev) => ({ ...prev, ...filters, page: undefined }),
      replace: true
    });

  // A range is picked in whole days of the viewer's time zone
  const paymentsQuery = useQuery(
    paymentsQueryOptions({
      ...search,
      from: search.from && dayjs(search.from).startOf('day').toISOString(),
      to: search.to && dayjs(search.to).endOf('day').toISOString()
    })
  );

  const pagination: PaginationState = {
    pageIndex: search.page - 1,
    pageSize: search.per_page
  };
  const sorting: SortingState = [
    { id: search.sort_by, desc: search.sort_order === 'desc' }
  ];

  return {
    paymentsQuery,

    filters: {
      query: search.q,
      status: search.status,
      from: search.from,
      to: search.to
    },
    hasActiveFilters: Object.keys(clearedFilters).some(
      (key) => search[key as keyof typeof clearedFilters] !== undefined
    ),
    setQuery: (query: string) => setFilters({ q: query || undefined }),
    setStatus: (status: PaymentStage | undefined) => setFilters({ status }),
    setRange: (range: { from: Date; to: Date } | undefined) =>
      setFilters({
        from: range && dayjs(range.from).format('YYYY-MM-DD'),
        to: range && dayjs(range.to).format('YYYY-MM-DD')
      }),
    clearFilters: () => setFilters(clearedFilters),

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
        sort_by: sortablePaymentColumnsSchema
          .catch('updated_at')
          .parse(first?.id),
        sort_order: first?.desc === false ? 'asc' : 'desc'
      });
    },

    // Opening and closing a payment push history entries, so Back closes the
    // drawer; stepping between payments replaces the current entry.
    openPaymentId,
    openPayment: (paymentId: number) =>
      navigate({ search: (prev) => ({ ...prev, payment: paymentId }) }),
    selectPayment: (paymentId: number) =>
      navigate({
        search: (prev) => ({ ...prev, payment: paymentId }),
        replace: true
      }),
    closePayment: () =>
      navigate({ search: (prev) => ({ ...prev, payment: undefined }) })
  };
}

export { DEFAULT_PAGE_SIZE, usePaymentsSearch };
