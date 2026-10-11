import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { ChevronLeftIcon } from 'lucide-react';
import type { GuestAgeGroup } from 'shared/types/reservations';
import { z } from 'zod';

import { reservationByIdQueryOptions } from '@/api/reservations';
import { QueryBoundary } from '@/components/query-boundary';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { FormSkeleton } from '@/components/ui/form-skeleton';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { isInAppPath } from '@/lib/search-params';

import { EditReservationForm } from '../reservations/-components/edit-reservation-form';
import { StatusCell } from '../reservations/-components/reservations-table/-components/cells/status-cell';

// Where the visitor came from, as an in-app path: pages that link here pass it
// so the reservation can offer a way back to exactly that view.
const reservationSearchSchema = z.object({
  back: z.string().refine(isInAppPath).optional().catch(undefined)
});

function ReservationPage() {
  const { t } = useLingui();
  const { back } = Route.useSearch();
  const router = useRouter();
  const { reservationId } = Route.useParams();
  // The loader has already fetched it; the fallback only shows on an error.
  const { data } = useQuery(reservationByIdQueryOptions(reservationId));
  const bookingNr = data?.booking_nr ?? t`Reservation`;
  useDocumentTitle(bookingNr);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        {back && (
          <a
            href={back}
            onClick={(event) => {
              // Stay in the app instead of reloading the page
              event.preventDefault();
              router.history.push(back);
            }}
            className="mb-2 inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
            <Trans>Back</Trans>
          </a>
        )}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink to="/">
                <Trans>Home</Trans>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink to="/reservations">
                <Trans>Reservations</Trans>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{bookingNr}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2">
          <h1 className="truncate text-xl font-bold">{bookingNr}</h1>
          {/* Set by the reservation's lifecycle, so shown rather than edited */}
          {data && <StatusCell status={data.state} />}
        </div>
      </div>

      <div>
        <QueryBoundary fallback={<FormSkeleton />}>
          <ReservationForm />
        </QueryBoundary>
      </div>
    </div>
  );
}

function ReservationForm() {
  const { reservationId } = Route.useParams();
  const reservationQuery = useSuspenseQuery(
    reservationByIdQueryOptions(reservationId)
  );

  const data = reservationQuery.data;
  const named = (group: GuestAgeGroup) =>
    data.guests.filter((guest) => guest.age_group === group).length;
  const reservationData = {
    booking_nr: data.booking_nr,
    room_name: data.room_name,
    purpose: data.purpose ?? 'private',
    booking_from: data.booking_from,
    booking_to: data.booking_to,
    // A head count is never below the guests already named in its group
    adults: Math.max(data.adults ?? 1, named('adult')),
    youth: Math.max(data.youth ?? 0, named('youth')),
    children: Math.max(data.children ?? 0, named('child')),
    infants: Math.max(data.infants ?? 0, named('infant')),
    guests: data.guests
  };

  return (
    <EditReservationForm
      reservationId={reservationId}
      reservationData={reservationData}
    />
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(front-office)/reservations/$reservationId'
)({
  validateSearch: reservationSearchSchema,
  loader: ({ context: { queryClient }, params: { reservationId } }) =>
    queryClient.ensureQueryData(reservationByIdQueryOptions(reservationId)),
  component: ReservationPage
});
