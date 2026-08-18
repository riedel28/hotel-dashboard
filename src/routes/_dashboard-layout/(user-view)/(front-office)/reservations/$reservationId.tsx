import { Trans, useLingui } from '@lingui/react/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

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

import { EditReservationForm } from '../reservations/-components/edit-reservation-form';

function ReservationPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Reservation Details`);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
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
  loader: ({ context: { queryClient }, params: { reservationId } }) =>
    queryClient.ensureQueryData(reservationByIdQueryOptions(reservationId)),
  component: ReservationPage
});
