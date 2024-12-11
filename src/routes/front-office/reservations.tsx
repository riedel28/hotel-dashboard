import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Edit2, PlusCircle, Trash } from 'lucide-react';
import { z } from 'zod';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

type Reservation = {
  id: number;
  reservationNr: string;
  email: string;
};

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
  // Возвращаем данные и количество страниц из заголовков
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Reservations</h1>

        <Button>
          <PlusCircle />
          Add reservation
        </Button>
      </div>

      <div>
        {reservationsQuery.isLoading ? (
          <div className="max-w-lg space-y-1">
            <Skeleton className="h-[62px]" />
            <Skeleton className="h-[62px]" />
          </div>
        ) : reservationsQuery.isError ? (
          <div>Error: {reservationsQuery.error.message}</div>
        ) : null}

        <ul className="max-w-lg space-y-1">
          {reservationsQuery.data?.index.length === 0 ? (
            <li className="flex min-h-32 items-center justify-center rounded-md border px-4 py-2 text-muted-foreground">
              No items found
            </li>
          ) : null}

          {reservationsQuery?.data?.index?.map((item) => (
            <li
              key={item.id}
              className="group flex items-center gap-3 rounded-md border px-3 py-2"
            >
              <Skeleton className="size-10 animate-none" />
              <div className="flex-1">
                <h3 className="line-clamp-1 text-base font-semibold">
                  {item.reservationNr}
                </h3>
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {item.email}
                </p>
              </div>

              <div className="space-x-1 group-hover:flex">
                <Button
                  size="icon"
                  variant="ghost"
                  className="hidden size-8 text-muted-foreground group-hover:flex"
                >
                  <Edit2 />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="hidden size-8 text-muted-foreground group-hover:flex"
                >
                  <Trash />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex max-w-lg items-center justify-between">
        <span className="text-sm">
          {per_page} of {reservationsQuery.data?.total} items
        </span>
        <div className="space-x-2">
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

export const Route = createFileRoute('/front-office/reservations')({
  validateSearch: (search) => reservationsFilterSchema.parse(search),
  component: () => <ReservationsPage />
});
