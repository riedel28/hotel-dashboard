import { reservationsQueryOptions } from '@/api/reservations';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PaginationState } from '@tanstack/react-table';
import { RefreshCw } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ErrorDisplayError } from '@/components/ui/error-display';
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

const reservationsFilterSchema = z.object({
  page: z.number().default(1),
  per_page: z.number().default(20),
  q: z.string().optional(),
  status: z
    .enum(['pending', 'started', 'done', 'all'])
    .default('all')
    .optional(),
  from: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  to: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
});

function ReservationsPage() {
  const { page, per_page, status, from, to, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const intl = useIntl();

  const reservationsQuery = useQuery(
    reservationsQueryOptions({
      page,
      perPage: per_page,
      status,
      q
    })
  );

  const handleRefresh = () => {
    reservationsQuery.refetch();
  };

  const handleStatusChange = (newStatus: string) => {
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
        from: dateRange?.from || undefined,
        to: dateRange?.to || undefined
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
        ? updaterOrValue({ pageIndex: page - 1, pageSize: per_page })
        : updaterOrValue;

    navigate({
      to: '/reservations',
      search: {
        page: pagination.pageIndex + 1, // Convert to 1-based for URL
        per_page: pagination.pageSize,
        status,
        q,
        from,
        to
      }
    });
  };

  const handleClearFilters = () => {
    navigate({
      to: '/reservations',
      search: {
        page: 1,
        per_page: 20,
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
          pageIndex={page - 1} // Convert to 0-based for table
          pageSize={per_page}
          onPaginationChange={handlePaginationChange}
        />
      );
    }

    if (reservationsQuery.isError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <ErrorDisplayError
            title={
              <FormattedMessage
                id="reservations.error"
                defaultMessage="Error"
              />
            }
            message={reservationsQuery.error.message}
            showRetry
            onRetry={handleRefresh}
            isRetrying={reservationsQuery.isFetching}
          />
        </div>
      );
    }

    if (reservationsQuery.data) {
      return (
        <ReservationsTable
          data={reservationsQuery.data.index}
          pageIndex={page - 1} // Convert to 0-based for table
          pageSize={per_page}
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
              <FormattedMessage id="breadcrumb.home" defaultMessage="Home" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <FormattedMessage
                id="reservations.title"
                defaultMessage="Reservations"
              />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-bold">
          <FormattedMessage
            id="reservations.title"
            defaultMessage="Reservations"
          />
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
                placeholder={intl.formatMessage({
                  id: 'placeholders.searchReservations',
                  defaultMessage: 'Search reservations'
                })}
                wrapperClassName="w-full sm:w-[250px]"
              />
              <Select
                value={status}
                onValueChange={handleStatusChange}
                indicatorPosition="right"
                defaultValue="all"
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue
                    placeholder={
                      <FormattedMessage
                        id="reservations.status.selectPlaceholder"
                        defaultMessage="Select status"
                      />
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-gray-500"></span>
                      <span>
                        <FormattedMessage
                          id="reservations.status.all"
                          defaultMessage="All"
                        />
                      </span>
                    </span>
                  </SelectItem>
                  <SelectItem value="pending">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-yellow-500"></span>
                      <span>
                        <FormattedMessage
                          id="reservations.status.pending"
                          defaultMessage="Pending"
                        />
                      </span>
                    </span>
                  </SelectItem>
                  <SelectItem value="started">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-violet-500"></span>
                      <span>
                        <FormattedMessage
                          id="reservations.status.started"
                          defaultMessage="Started"
                        />
                      </span>
                    </span>
                  </SelectItem>
                  <SelectItem value="done">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-green-500"></span>
                      <span>
                        <FormattedMessage
                          id="reservations.status.done"
                          defaultMessage="Done"
                        />
                      </span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ReservationDateFilter
                from={from}
                to={to}
                onDateChange={handleDateChange}
                className="w-full sm:w-[208px]"
              />
              {(status !== 'all' || q || from || to) && (
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <FormattedMessage
                    id="reservations.clearFilters"
                    defaultMessage="Clear filters"
                  />
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
            <FormattedMessage
              id="reservations.refresh"
              defaultMessage="Refresh"
            />
          </Button>
        </div>

        {q && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <FormattedMessage
              id="reservations.showResultsFor"
              description="Shows the search query that is currently being filtered"
              defaultMessage='Show results for: <query>\"{searchQuery}\"</query>'
              values={{
                query: (chunks) => (
                  <span className="text-foreground font-medium">{chunks}</span>
                ),
                searchQuery: q
              }}
            />
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
  validateSearch: (search) => reservationsFilterSchema.parse(search),
  component: () => <ReservationsPage />
});
