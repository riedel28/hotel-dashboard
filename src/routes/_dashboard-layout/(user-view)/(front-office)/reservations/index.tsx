import { Trans } from '@lingui/react/macro';
import {
  QueryErrorResetBoundary,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { type PaginationState, type SortingState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { RefreshCwIcon } from 'lucide-react';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  fetchReservationsParamsSchema,
  reservationsQueryOptions
} from '@/api/reservations';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  ErrorDisplayActions,
  ErrorDisplayError,
  ErrorDisplayMessage,
  ErrorDisplayTitle
} from '@/components/ui/error-display';

import { cn } from '@/lib/utils';

import { AddReservationModal } from '../reservations/-components/add-reservation-modal';
import { ReservationClearFilters } from '../reservations/-components/reservation-clear-filters';
import { ReservationRefresh } from '../reservations/-components/reservation-refresh';
import { ReservationSearch } from '../reservations/-components/reservation-search';
import { ReservationSearchResults } from '../reservations/-components/reservation-search-results';
import { ReservationStatusFilter } from '../reservations/-components/reservation-status-filter';
import { ReservationsFilters } from '../reservations/-components/reservations-filters';
import { ReservationDateFilter } from '../reservations/-components/reservations-table/reservation-date-filter';
import ReservationsTable from '../reservations/-components/reservations-table/reservations-table';

function ReservationsPage() {
  return (
    <div className="space-y-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Trans>Reservations</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-bold">
          <Trans>Reservations</Trans>
        </h1>
        <AddReservationModal />
      </div>

      <Suspense
        fallback={
          <ReservationsTable
            data={[]}
            isLoading={true}
            pageIndex={0}
            pageSize={10}
            totalCount={0}
            pageCount={0}
          />
        }
      >
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ error, resetErrorBoundary }) => (
                <div className="flex min-h-[60vh] items-center justify-center">
                  <ErrorDisplayError className="w-md max-w-md">
                    <ErrorDisplayTitle>
                      <Trans>Something went wrong</Trans>
                    </ErrorDisplayTitle>
                    <ErrorDisplayMessage>
                      {(error instanceof Error ? error.message : null) || (
                        <Trans>
                          An error occurred while fetching reservations
                        </Trans>
                      )}
                    </ErrorDisplayMessage>
                    <ErrorDisplayActions>
                      <Button
                        variant="destructive"
                        onClick={resetErrorBoundary}
                      >
                        <RefreshCwIcon className="mr-2 h-4 w-4" />
                        <Trans>Refresh</Trans>
                      </Button>
                    </ErrorDisplayActions>
                  </ErrorDisplayError>
                </div>
              )}
            >
              <ReservationsContent />
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </Suspense>
    </div>
  );
}

function ReservationsContent() {
  const { page, per_page, status, from, to, q, sort_by, sort_order } =
    Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const reservationsQuery = useSuspenseQuery(
    reservationsQueryOptions({
      page,
      per_page,
      status,
      q,
      from,
      to,
      sort_by,
      sort_order
    })
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: reservationsQueryOptions({
        page,
        per_page,
        status,
        q,
        from,
        to,
        sort_by,
        sort_order
      }).queryKey
    });
  };

  const handleStatusChange = (newStatus: string | null) => {
    if (!newStatus) return;
    navigate({
      to: '/reservations',
      search: (prev) => ({
        ...prev,
        page: 1,
        status: newStatus as 'pending' | 'started' | 'done' | 'all'
      })
    });
  };

  const handleDateChange = (
    dateRange: { from?: Date; to?: Date } | undefined
  ) => {
    navigate({
      to: '/reservations',
      search: (prev) => ({
        ...prev,
        page: 1,
        from: dateRange?.from
          ? dayjs(dateRange.from).format('YYYY-MM-DD')
          : undefined,
        to: dateRange?.to ? dayjs(dateRange.to).format('YYYY-MM-DD') : undefined
      })
    });
  };

  const handleSearchChange = (searchTerm: string) => {
    navigate({
      to: '/reservations',
      search: (prev) => ({
        ...prev,
        page: 1,
        q: searchTerm || undefined
      })
    });
  };

  const handlePaginationChange = (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState)
  ) => {
    const pagination =
      typeof updaterOrValue === 'function'
        ? updaterOrValue({
            pageIndex: (page ?? 1) - 1,
            pageSize: per_page ?? 10
          })
        : updaterOrValue;

    navigate({
      to: '/reservations',
      search: (prev) => ({
        ...prev,
        page: pagination.pageIndex + 1, // Convert to 0-based for URL
        per_page: pagination.pageSize
      })
    });
  };

  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    const sorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(
            sort_by
              ? [{ id: sort_by, desc: sort_order === 'desc' }]
              : [{ id: 'received_at', desc: true }]
          )
        : updaterOrValue;

    // Convert TanStack Table SortingState to URL params
    const firstSort = sorting[0];
    if (firstSort) {
      navigate({
        to: '/reservations',
        search: (prev) => ({
          ...prev,
          page: 1, // Reset to first page when sorting changes
          sort_by: firstSort.id as
            | 'state'
            | 'booking_nr'
            | 'room_name'
            | 'booking_from'
            | 'booking_to'
            | 'balance'
            | 'received_at',
          sort_order: firstSort.desc ? ('desc' as const) : ('asc' as const)
        })
      });
    } else {
      // Clear sorting - use default
      navigate({
        to: '/reservations',
        search: (prev) => ({
          ...prev,
          page: 1,
          sort_by: undefined,
          sort_order: undefined
        })
      });
    }
  };

  const handleClearFilters = () => {
    navigate({
      to: '/reservations',
      search: {
        page: 1,
        per_page: per_page,
        status: 'all',
        q: undefined,
        from: undefined,
        to: undefined,
        sort_by: undefined,
        sort_order: undefined
      }
    });
  };

  // Convert URL params to TanStack Table SortingState
  const sorting: SortingState = sort_by
    ? [{ id: sort_by, desc: sort_order === 'desc' }]
    : [{ id: 'received_at', desc: true }];

  const hasActiveFilters = Boolean(
    q || from || to || (status && status !== 'all')
  );

  return (
    <div className="space-y-2.5">
      <ReservationsFilters>
        <ReservationSearch value={q} onChange={handleSearchChange} />
        <ReservationStatusFilter value={status} onChange={handleStatusChange} />
        <ReservationDateFilter
          from={from ? new Date(from) : undefined}
          to={to ? new Date(to) : undefined}
          onDateChange={handleDateChange}
          className="w-full sm:w-[208px]"
        />
        <ReservationClearFilters
          hasActiveFilters={hasActiveFilters}
          onClear={handleClearFilters}
        />
        <ReservationRefresh
          isRefreshing={reservationsQuery.isFetching}
          onRefresh={handleRefresh}
        />
      </ReservationsFilters>

      <ReservationSearchResults searchQuery={q} />

      <div
        className={cn(
          'opacity-100 transition-opacity duration-300 ease-in-out',
          {
            'opacity-70': reservationsQuery.isFetching
          }
        )}
      >
        <ReservationsTable
          data={reservationsQuery.data.index}
          pageIndex={(page ?? 1) - 1}
          pageSize={per_page ?? 10}
          totalCount={reservationsQuery.data.total}
          pageCount={reservationsQuery.data.page_count}
          onPaginationChange={handlePaginationChange}
          sorting={sorting}
          onSortingChange={handleSortingChange}
        />
      </div>
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(front-office)/reservations/'
)({
  validateSearch: (search) => fetchReservationsParamsSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(reservationsQueryOptions(deps));
  },
  component: ReservationsPage
});
