import { reservationsQueryOptions } from '@/api/reservations';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PaginationState } from '@tanstack/react-table';
import { RefreshCw } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
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

import { cn } from '@/lib/utils';

import { AddReservationModal } from '../reservations/-components/add-reservation-modal';
import ReservationsTable from '../reservations/-components/reservations-table/reservations-table';

const reservationsFilterSchema = z.object({
  page: z.number().default(1),
  per_page: z.number().default(20),
  q: z.string().optional(),
  status: z
    .enum(['pending', 'started', 'done', 'all'])
    .default('all')
    .optional()
});

function ReservationsPage() {
  const { page, per_page } = Route.useSearch();
  const navigate = Route.useNavigate();

  const reservationsQuery = useQuery(
    reservationsQueryOptions({ page, perPage: per_page })
  );

  const handleRefresh = () => {
    reservationsQuery.refetch();
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
        per_page: pagination.pageSize
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
        <div className="flex items-center justify-between">
          <div className="max-w-sm">
            <SearchInput />
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={reservationsQuery.isFetching}
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
