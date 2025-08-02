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
import { ErrorFallback } from '@/components/ui/error-fallback';
import { FormSkeleton } from '@/components/ui/form-skeleton';

import {
  EditReservationForm,
  type ReservationFormData
} from '../reservations/-components/edit-reservation-form';

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
                  <ErrorFallback
                    error={error}
                    resetErrorBoundary={resetErrorBoundary}
                  />
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

  const initialData: ReservationFormData = {
    booking_nr: reservationQuery.data?.booking_nr || '',
    guests: reservationQuery.data?.guests || [
      { id: '1', name: 'Petro Demydov' },
      { id: '2', name: 'Surattana Bopp' }
    ],
    adults: reservationQuery.data?.adults || 2,
    youth: reservationQuery.data?.youth || 0,
    children: reservationQuery.data?.children || 0,
    infants: reservationQuery.data?.infants || 0,
    purpose: reservationQuery.data?.purpose || 'private',
    room: reservationQuery.data?.room || '401'
  };

  return (
    <EditReservationForm
      reservationId={reservationId}
      initialData={initialData}
    />
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(front-office)/reservations/$reservationId'
)({
  component: ReservationPage
});
