import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PlusCircle, X } from 'lucide-react';
import { z } from 'zod';

import { Reservation, columns } from '@/components/reservations-table/columns';
import { DataTable as ReservationsTable } from '@/components/reservations-table/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const fetchReservations = async ({
  page,
  perPage
}: {
  page: number;
  perPage: number;
}): Promise<{
  index: Reservation[];
  total: number;
}> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const response = await fetch(
    `http://localhost:5000/reservations?_page=${page}&_limit=${perPage}`
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const totalCount = response.headers.get('X-Total-Count');
  const data = await response.json();

  return { index: data, total: totalCount ? parseInt(totalCount, 10) : 0 };
};

const reservationsFilterSchema = z.object({
  page: z.number().default(1),
  per_page: z.number().default(2)
});

function ReservationsPage() {
  const { page, per_page } = Route.useSearch();
  const navigate = Route.useNavigate();

  const reservationsQuery = useQuery<{
    index: Reservation[];
    total: number;
  }>({
    queryKey: ['items', page, per_page],
    queryFn: () => {
      return fetchReservations({ page, perPage: per_page });
    },
    placeholderData: (previousData) => previousData
  });

  let content;

  if (reservationsQuery.isLoading) {
    content = (
      <div className="max-w-lg space-y-1">
        <Skeleton className="h-[62px]" />
        <Skeleton className="h-[62px]" />
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
        <ReservationsTable
          columns={columns}
          data={reservationsQuery?.data?.index}
        />

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
                  to: '/front-office/reservations',
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
                  to: '/front-office/reservations',
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
          <div className="flex items-center space-x-1.5">
            <Select
              value={per_page.toString()}
              onValueChange={(value) => {
                navigate({
                  to: '/front-office/reservations',
                  search: { page, per_page: parseInt(value, 10) }
                });
              }}
            >
              <SelectTrigger className="h-9 w-[110px]">
                <div className="flex gap-1.5">
                  <span>{per_page}</span>
                  <span className="text-border">/</span>
                  <span>page</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Reservations</h1>

        <Button>
          <PlusCircle />
          Add reservation
        </Button>
      </div>

      {content}
    </div>
  );
}

export const Route = createFileRoute('/front-office/reservations/')({
  validateSearch: (search) => reservationsFilterSchema.parse(search),
  component: () => <ReservationsPage />
});
