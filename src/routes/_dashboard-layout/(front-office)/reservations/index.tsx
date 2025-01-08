import { reservationsQueryOptions } from '@/api/reservations';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { z } from 'zod';

// import { TableSkeleton } from '@/components/reservations-table/table-skeleton'
// import { TableToolbar } from '@/components/reservations-table/table-toolbar'
import { Button, buttonVariants } from '@/components/ui/button';
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

  let content;

  if (reservationsQuery.isLoading) {
    content = (
      <div>
        <div className="space-y-2">
          {/* <TableToolbar
            onRefresh={reservationsQuery.refetch}
            isRefreshing={reservationsQuery.isRefetching}
          /> */}
          {/* <TableSkeleton /> */}
        </div>
      </div>
    );
  }

  if (reservationsQuery.isError) {
    content = (
      <div className="flex max-w-lg flex-col justify-center rounded-md border p-4 text-center">
        <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-red-50">
          <X className="size-6 text-red-700" />
        </div>
        <h2 className="text-lg font-semibold">Error</h2>
        <p>{reservationsQuery.error.message}</p>
      </div>
    );
  }

  if (reservationsQuery.data) {
    content = (
      <div>
        <div className="space-y-2">
          {/* <TableToolbar
            onRefresh={reservationsQuery.refetch}
            isRefreshing={reservationsQuery.isRefetching}
          /> */}

          <div className="max-w-sm">
            <SearchInput />
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
              // isLoading={reservationsQuery.isLoading}
            />
          </div>
        </div>

        <div className="mt-4 flex max-w-lg items-center justify-between">
          <div className="flex-1">
            <span className="text-sm">
              {per_page} of {reservationsQuery.data?.total} items
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
              Prev page
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
              Next page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-bold">Reservations</h1>
        <AddReservationModal />
      </div>
      {content}
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(front-office)/reservations/'
)({
  validateSearch: (search) => reservationsFilterSchema.parse(search),
  component: () => <ReservationsPage />
});
