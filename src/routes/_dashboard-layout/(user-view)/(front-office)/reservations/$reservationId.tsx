import { Trans } from '@lingui/react/macro';
import {
  QueryErrorResetBoundary,
  useSuspenseQuery
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { RefreshCw } from 'lucide-react';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { reservationByIdQueryOptions } from '@/api/reservations';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  ErrorDisplayActions,
  ErrorDisplayError,
  ErrorDisplayMessage,
  ErrorDisplayTitle
} from '@/components/ui/error-display';
import { FormSkeleton } from '@/components/ui/form-skeleton';

import { EditReservationForm } from '../reservations/-components/edit-reservation-form';

function ReservationPage() {
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
        <h1 className="text-2xl font-bold">
          <Trans>Edit reservation</Trans>
        </h1>
      </div>

      <div>
        <Suspense fallback={<FormSkeleton />}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                onReset={reset}
                fallbackRender={({ error, resetErrorBoundary }) => (
                  <div className="flex">
                    <ErrorDisplayError className="w-md max-w-md">
                      <ErrorDisplayTitle>
                        <Trans>Something went wrong</Trans>
                      </ErrorDisplayTitle>
                      <ErrorDisplayMessage>
                        {error instanceof Error ? error.message : String(error)}
                      </ErrorDisplayMessage>
                      <ErrorDisplayActions>
                        <Button
                          variant="destructive"
                          onClick={resetErrorBoundary}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          <Trans>Refresh</Trans>
                        </Button>
                      </ErrorDisplayActions>
                    </ErrorDisplayError>
                  </div>
                )}
              >
                <ReservationForm />
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </Suspense>
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
