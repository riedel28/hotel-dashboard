import { useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import type {
  PaginationState,
  SortingState,
  Updater
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import {
  type PaymentStage,
  sortablePaymentColumnsSchema
} from 'shared/types/payments';

import { type PaymentsQuery, paymentsQueryOptions } from '@/api/payments';
import {
  clearedParams,
  fromPagination,
  fromSorting,
  toPagination,
  toSorting
} from '@/lib/table-search';

const routeApi = getRouteApi(
  '/_dashboard-layout/(user-view)/(front-office)/payments/'
);

// Everything "Clear filters" resets. Sorting and page size are not filters.
const filterKeys = [
  'q',
  'status',
  'from',
  'to'
] as const satisfies ReadonlyArray<keyof PaymentsQuery>;

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

  const pagination = toPagination(search);
  const sorting = toSorting(search);

  return {
    paymentsQuery,

    filters: {
      query: search.q,
      status: search.status,
      from: search.from,
      to: search.to
    },
    hasActiveFilters: filterKeys.some((key) => search[key] !== undefined),
    setQuery: (query: string) => setFilters({ q: query || undefined }),
    setStatus: (status: PaymentStage | undefined) => setFilters({ status }),
    setRange: (range: { from: Date; to: Date } | undefined) =>
      setFilters({
        from: range && dayjs(range.from).format('YYYY-MM-DD'),
        to: range && dayjs(range.to).format('YYYY-MM-DD')
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
          sortablePaymentColumnsSchema.catch('updated_at').parse(id)
        )
      ),

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

type PaymentsSearch = ReturnType<typeof usePaymentsSearch>;

export { type PaymentsSearch, usePaymentsSearch };
