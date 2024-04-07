import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const reservationsFilterSchema = z.object({
  page: z.number().default(1).optional(),
  per_page: z.number().default(10).optional()
});

function ReservationsPage() {
  const { page, per_page } = Route.useSearch();

  return (
    <div>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Reservations</h1>
      </div>
      <div className="mt-4">Page: {page}</div>
      <div className="mt-2">Per page: {per_page}</div>
    </div>
  );
}

export const Route = createFileRoute('/reservations')({
  validateSearch: (search) => reservationsFilterSchema.parse(search),
  component: () => <ReservationsPage />
});
