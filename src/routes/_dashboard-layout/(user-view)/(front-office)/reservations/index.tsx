import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CalendarCheckIcon, PlusIcon } from 'lucide-react';
import { z } from 'zod';

import {
  fetchReservationsParamsSchema,
  reservationsQueryOptions
} from '@/api/reservations';
import { DateRangeFilter } from '@/components/date-range-filter';
import {
  EmptyFilterResult,
  EmptyTableState
} from '@/components/empty-table-state';
import { tableLoadError } from '@/components/load-error';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { DataGridRefreshButton } from '@/components/ui/data-grid-refresh-button';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { cn } from '@/lib/utils';

import { ReservationClearFilters } from '../reservations/-components/reservation-clear-filters';
import { ReservationSearch } from '../reservations/-components/reservation-search';
import { ReservationStatusFilter } from '../reservations/-components/reservation-status-filter';
import { ReservationsFilters } from '../reservations/-components/reservations-filters';
import { ReservationDetailsDrawer } from '../reservations/-components/reservations-table/-components/reservation-details-drawer';
import ReservationsTable from '../reservations/-components/reservations-table/reservations-table';
import { useReservationsSearch } from '../reservations/-hooks/use-reservations-search';

// The page's own state on top of the list filters: the reservation open in
// the drawer
const reservationsSearchSchema = fetchReservationsParamsSchema.extend({
  reservation: z.coerce.number().int().positive().optional()
});

function ReservationsPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
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
        <Button onClick={() => void navigate({ to: '/reservations/new' })}>
          <PlusIcon aria-hidden="true" />
          <Trans>Add Reservation</Trans>
        </Button>
      </div>

      <ReservationsContent />
    </div>
  );
}

function ReservationsContent() {
  const navigate = useNavigate();
  const {
    reservationsQuery,
    searchTerm,
    selectedStatuses,
    dateRange,
    sorting,
    pageIndex,
    pageSize,
    hasActiveFilters,
    openReservationId,
    openReservation,
    selectReservation,
    closeReservation,
    setSearchTerm,
    setStatuses,
    setDateRange,
    setPagination,
    setSorting,
    clearFilters,
    refresh
  } = useReservationsSearch();
  const reservations = reservationsQuery.data?.index ?? [];

  return (
    <div className="space-y-2.5">
      <ReservationsFilters>
        <ReservationSearch value={searchTerm} onChange={setSearchTerm} />
        <ReservationStatusFilter
          value={selectedStatuses}
          onValueChange={setStatuses}
          className="lg:w-[180px]"
        />
        <DateRangeFilter
          from={dateRange.from}
          to={dateRange.to}
          onRangeChange={setDateRange}
          allowFuture
          className="w-full lg:w-[208px]"
        />
        <ReservationClearFilters
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
        />
        <DataGridRefreshButton
          isRefreshing={reservationsQuery.isFetching}
          onRefresh={refresh}
        />
      </ReservationsFilters>

      <div
        className={cn(
          'opacity-100 transition-opacity duration-300 ease-in-out',
          {
            'opacity-70': reservationsQuery.isFetching
          }
        )}
      >
        <ReservationsTable
          data={reservations}
          isLoading={reservationsQuery.isLoading}
          error={tableLoadError(
            reservationsQuery,
            <Trans>Couldn't load reservations</Trans>
          )}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={reservationsQuery.data?.total ?? 0}
          pageCount={reservationsQuery.data?.page_count ?? 0}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          selectedReservationId={openReservationId}
          onReservationOpen={openReservation}
          emptyMessage={
            hasActiveFilters ? (
              <EmptyFilterResult
                description={<Trans>No reservations match the filters.</Trans>}
                onClearFilters={clearFilters}
              />
            ) : (
              <EmptyTableState
                icon={<CalendarCheckIcon />}
                title={<Trans>No reservations yet</Trans>}
                description={
                  <Trans>
                    Reservations from the PMS show up here, or add one by hand.
                  </Trans>
                }
                action={{
                  label: <Trans>Add Reservation</Trans>,
                  icon: <PlusIcon aria-hidden="true" />,
                  onClick: () => void navigate({ to: '/reservations/new' })
                }}
              />
            )
          }
        />
      </div>

      <ReservationDetailsDrawer
        reservationId={openReservationId}
        pageReservations={reservations}
        onSelect={selectReservation}
        onClose={closeReservation}
      />
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(front-office)/reservations/'
)({
  validateSearch: (search) => reservationsSearchSchema.parse(search),
  // Opening the drawer is not a reason to rerun the loader
  loaderDeps: ({ search: { reservation: _reservation, ...deps } }) => deps,
  // Waited for, but a failure isn't thrown here: it would take the whole page
  // down. The query keeps the error, and the table shows it under the filters.
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.prefetchQuery(reservationsQueryOptions(deps)),
  component: ReservationsPage
});
