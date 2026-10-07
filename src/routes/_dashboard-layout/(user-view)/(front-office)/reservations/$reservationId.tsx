import { Trans, useLingui } from '@lingui/react/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { ChevronLeftIcon } from 'lucide-react';
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

// Where the visitor came from, as an in-app path: pages that link here pass it
// so the reservation can offer a way back to exactly that view.
const reservationSearchSchema = z.object({
  back: z.string().refine(isInAppPath).optional().catch(undefined)
});

function ReservationPage() {
  const { t } = useLingui();
  const { back } = Route.useSearch();
  const router = useRouter();
  useDocumentTitle(t`Reservation Details`);

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
              <BreadcrumbPage>
                <Trans>Edit reservation</Trans>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-xl font-bold">
          <Trans>Edit reservation</Trans>
        </h1>
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
  const reservationData = {
    booking_nr: data.booking_nr,
    guests: data.guests,
    adults: data.adults ?? 1,
    youth: data.youth ?? 0,
    children: data.children ?? 0,
    infants: data.infants ?? 0,
    purpose: data.purpose ?? 'private',
    room: data.room ?? data.room_name
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
