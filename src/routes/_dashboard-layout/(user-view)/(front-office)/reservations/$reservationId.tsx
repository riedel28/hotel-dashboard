import { Suspense } from 'react';

import { buildResourceUrl } from '@/config/api';
import {
  QueryErrorResetBoundary,
  useSuspenseQuery
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage } from 'react-intl';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { ErrorDisplayError } from '@/components/ui/error-display';
import { FormSkeleton } from '@/components/ui/form-skeleton';

import { EditReservationForm } from '../reservations/-components/edit-reservation-form';

async function fetchReservationById(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const response = await fetch(buildResourceUrl('reservations', id));

  if (response.status === 404) {
    throw new Error('Reservation not found');
  }

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();

  return data;
}

function ReservationPage() {
  return (
    <div className="space-y-6">
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
              <BreadcrumbLink href="/reservations">
                <FormattedMessage
                  id="reservations.title"
                  defaultMessage="Reservations"
                />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <FormattedMessage
                  id="reservations.editTitle"
                  defaultMessage="Edit reservation"
                />
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold">
          <FormattedMessage
            id="reservations.editTitle"
            defaultMessage="Edit reservation"
          />
        </h1>
      </div>

      <div>
        <Suspense fallback={<FormSkeleton />}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                onReset={reset}
                fallbackRender={({ error, resetErrorBoundary }) => (
                  <div className="flex min-h-[60vh] items-center justify-center">
                    <ErrorDisplayError
                      title={
                        <FormattedMessage
                          id="reservations.error"
                          defaultMessage="Error"
                        />
                      }
                      message={error.message}
                      showRetry
                      onRetry={resetErrorBoundary}
                    />
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

  const reservationQuery = useSuspenseQuery({
    queryKey: ['reservations', reservationId],
    queryFn: () => fetchReservationById(reservationId)
  });

  return (
    <EditReservationForm
      reservationId={reservationId}
      reservationData={reservationQuery.data}
    />
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(front-office)/reservations/$reservationId'
)({
  component: ReservationPage
});
