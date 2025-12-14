import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { type PaginationState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { RefreshCw, XIcon } from 'lucide-react';
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
import { SearchInput } from '@/components/ui/search-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { cn } from '@/lib/utils';

import { AddReservationModal } from '../reservations/-components/add-reservation-modal';
import ReservationsTable from '../reservations/-components/reservations-table/reservations-table';
import { ReservationDateFilter } from './-components/reservations-table/reservation-date-filter';

function ReservationsPage() {
  const { page, per_page, status, from, to, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { t } = useLingui();

  const reservationsQuery = useQuery(
    reservationsQueryOptions({
      page,
      per_page,
      status,
      q,
      from,
      to
    })
  );

  const handleRefresh = () => {
    reservationsQuery.refetch();
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

  const handleClearFilters = () => {
    navigate({
      to: '/reservations',
      search: {
        page: 1,
        per_page: per_page,
        status: 'all',
        q: undefined,
        from: undefined,
        to: undefined
      }
    });
  };

  const renderTableContent = () => {
    if (reservationsQuery.isLoading) {
      return (
        <ReservationsTable
          data={[]}
          isLoading={true}
          pageIndex={(page ?? 1) - 1} // Convert to 0-based for table
          pageSize={per_page ?? 10} // Use URL param for loading state
          totalCount={0}
          pageCount={0}
          onPaginationChange={handlePaginationChange}
        />
      );
    }

    if (reservationsQuery.isError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <ErrorDisplayError className="w-md max-w-md">
            <ErrorDisplayTitle>
              <Trans>Something went wrong</Trans>
            </ErrorDisplayTitle>
            <ErrorDisplayMessage>
              {reservationsQuery.error.message || (
                <Trans>An error occurred while fetching reservations</Trans>
              )}
            </ErrorDisplayMessage>
            <ErrorDisplayActions>
              <Button variant="destructive" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                <Trans>Refresh</Trans>
              </Button>
            </ErrorDisplayActions>
          </ErrorDisplayError>
        </div>
      );
    }

    if (reservationsQuery.data) {
      return (
        <ReservationsTable
          data={reservationsQuery.data.index}
          pageIndex={(page ?? 1) - 1} // Convert to 0-based for table
          pageSize={per_page ?? 10} // Always use the requested page size from URL
          totalCount={reservationsQuery.data.total}
          pageCount={reservationsQuery.data.page_count}
          onPaginationChange={handlePaginationChange}
        />
      );
    }

    return null;
  };

  return (
    <div className="space-y-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
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

      <div className="space-y-2.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchInput
                value={q || ''}
                onChange={handleSearchChange}
                placeholder={t`Search reservations`}
                wrapperClassName="w-full sm:w-[250px]"
                debounceMs={500}
              />
              <Select
                value={status ?? 'all'}
                onValueChange={handleStatusChange}
                defaultValue="all"
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue>
                    {(value) =>
                      value ? (
                        <span className="capitalize">{t(value)}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          <Trans>Select status</Trans>
                        </span>
                      )
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-gray-500"></span>
                      <span>
                        <Trans>All</Trans>
                      </span>
                    </span>
                  </SelectItem>
                  <SelectItem value="pending">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-yellow-500"></span>
                      <span>
                        <Trans>Pending</Trans>
                      </span>
                    </span>
                  </SelectItem>
                  <SelectItem value="started">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-violet-500"></span>
                      <span>
                        <Trans>Started</Trans>
                      </span>
                    </span>
                  </SelectItem>
                  <SelectItem value="done">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-green-500"></span>
                      <span>
                        <Trans>Done</Trans>
                      </span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ReservationDateFilter
                from={from ? new Date(from) : undefined}
                to={to ? new Date(to) : undefined}
                onDateChange={handleDateChange}
                className="w-full sm:w-[208px]"
              />
              {(q || from || to || (status && status !== 'all')) && (
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XIcon />
                  <Trans>Clear filters</Trans>
                </Button>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={reservationsQuery.isFetching}
            className="w-full sm:w-auto"
          >
            <RefreshCw
              className={cn(
                'mr-2 h-4 w-4',
                reservationsQuery.isFetching && 'animate-spin'
              )}
            />
            <Trans>Refresh</Trans>
          </Button>
        </div>

        {q && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trans>
              Show results for:{' '}
              <span className="font-medium text-foreground">"{q}"</span>
            </Trans>
          </div>
        )}

        <div
          className={cn(
            'opacity-100 transition-opacity duration-300 ease-in-out',
            {
              'opacity-70': reservationsQuery.isFetching
            }
          )}
        >
          {renderTableContent()}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(front-office)/reservations/'
)({
  validateSearch: (search) => fetchReservationsParamsSchema.parse(search),
  component: () => <ReservationsPage />
});
