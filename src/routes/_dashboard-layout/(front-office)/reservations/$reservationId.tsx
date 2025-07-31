import { Suspense } from 'react';

import { buildResourceUrl } from '@/config/api';
import {
  QueryErrorResetBoundary,
  useSuspenseQuery
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage } from 'react-intl';

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
    <div>
      <h1 className="mb-6 text-lg font-semibold md:text-2xl">
        <FormattedMessage
          id="reservations.editTitle"
          defaultMessage="Edit reservation"
        />
      </h1>
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
  '/_dashboard-layout/(front-office)/reservations/$reservationId'
)({
  component: ReservationPage
});
