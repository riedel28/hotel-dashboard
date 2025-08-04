import { reservationsQueryOptions } from '@/api/reservations';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
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
import { Button, buttonVariants } from '@/components/ui/button';
import { ErrorDisplayError } from '@/components/ui/error-display';
import { SearchInput } from '@/components/ui/search-input';

import { cn } from '@/lib/utils';

import { AddReservationModal } from '../reservations/-components/add-reservation-modal';
import { columns } from '../reservations/-components/reservations-table/columns';
import { DataTable as ReservationsTable } from '../reservations/-components/reservations-table/data-table';

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

  let content;

  if (reservationsQuery.isLoading) {
    content = (
      <div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="max-w-sm">
              <SearchInput />
            </div>
            <Button
              variant="secondary"
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
          <ReservationsTable data={[]} columns={columns} isLoading={true} />
        </div>
      </div>
    );
  }

  if (reservationsQuery.isError) {
    content = (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ErrorDisplayError
          title={
            <FormattedMessage id="reservations.error" defaultMessage="Error" />
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
    content = (
      <div>
        <div className="space-y-2">
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
              '- opacity duration - 300 ease -in -out opacity-100 transition',
              {
                'opacity-70': reservationsQuery.isFetching
              }
            )}
          >
            <ReservationsTable
              data={reservationsQuery.data.index}
              columns={columns}
              isLoading={reservationsQuery.isLoading}
            />
          </div>
        </div>

        <div className="mt-4 flex max-w-lg items-center justify-between">
          <div className="flex-1">
            <span className="text-sm">
              <FormattedMessage
                id="reservations.pagination"
                defaultMessage="{count} of {total} items"
                values={{
                  count: per_page,
                  total: reservationsQuery.data?.total
                }}
              />
            </span>
          </div>
          <div className="flex-1 space-x-2">
            <Button
              onClick={() => {
                navigate({
                  to: '/reservations',
                  search: { page: page - 1, per_page }
                });
              }}
              className={buttonVariants({
                variant: 'secondary',
                size: 'sm'
              })}
              disabled={page <= 1}
            >
              <FormattedMessage
                id="reservations.prevPage"
                defaultMessage="Prev page"
              />
            </Button>

            <Button
              onClick={() => {
                navigate({
                  to: '/reservations',
                  search: { page: page + 1, per_page }
                });
              }}
              className={buttonVariants({
                variant: 'secondary',
                size: 'sm'
              })}
              disabled={page >= 5}
            >
              <FormattedMessage
                id="reservations.nextPage"
                defaultMessage="Next page"
              />
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
      {content}
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(front-office)/reservations/'
)({
  validateSearch: (search) => reservationsFilterSchema.parse(search),
  component: () => <ReservationsPage />
});
