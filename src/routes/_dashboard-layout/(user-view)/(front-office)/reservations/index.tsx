import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';

import {
  fetchReservationsParamsSchema,
  reservationsQueryOptions
} from '@/api/reservations';
import { QueryBoundary } from '@/components/query-boundary';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { DataGridRefreshButton } from '@/components/ui/data-grid-refresh-button';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { cn } from '@/lib/utils';

import { AddReservationModal } from '../reservations/-components/add-reservation-modal';
import { ReservationClearFilters } from '../reservations/-components/reservation-clear-filters';
import { ReservationSearch } from '../reservations/-components/reservation-search';
import { ReservationSearchResults } from '../reservations/-components/reservation-search-results';
import { ReservationStatusFilter } from '../reservations/-components/reservation-status-filter';
import { ReservationsFilters } from '../reservations/-components/reservations-filters';
import { ReservationDateFilter } from '../reservations/-components/reservations-table/reservation-date-filter';
import ReservationsTable from '../reservations/-components/reservations-table/reservations-table';
import { useReservationsSearch } from '../reservations/-hooks/use-reservations-search';

function ReservationsPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Reservations`);

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
        <h1 className="text-xl font-bold">
          <Trans>Reservations</Trans>
        </h1>
        <AddReservationModal />
      </div>

      <QueryBoundary
        className="min-h-[60vh] items-center justify-center"
        message={<Trans>An error occurred while fetching reservations</Trans>}
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
        <ReservationsContent />
      </QueryBoundary>
    </div>
  );
}

function ReservationsContent() {
  const {
    reservationsQuery,
    searchTerm,
    selectedStatuses,
    dateRange,
    sorting,
    pageIndex,
    pageSize,
    hasActiveFilters,
    setSearchTerm,
    setStatuses,
    setDateRange,
    setPagination,
    setSorting,
    clearFilters,
    refresh
  } = useReservationsSearch();

  return (
    <div className="space-y-2.5">
      <ReservationsFilters>
        <ReservationSearch value={searchTerm} onChange={setSearchTerm} />
        <ReservationStatusFilter
          value={selectedStatuses}
          onValueChange={setStatuses}
          className="lg:w-[180px]"
        />
        <ReservationDateFilter
          from={dateRange.from}
          to={dateRange.to}
          onDateChange={setDateRange}
          className="w-full lg:w-[208px]"
        />
        <ReservationClearFilters
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
        />
        <DataGridRefreshButton
          isRefreshing={reservationsQuery.isFetching}
          onRefresh={refresh}
          className="sm:ml-0 sm:w-full lg:ml-auto lg:w-auto"
        />
      </ReservationsFilters>

      <ReservationSearchResults searchQuery={searchTerm} />

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
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={reservationsQuery.data.total}
          pageCount={reservationsQuery.data.page_count}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
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
