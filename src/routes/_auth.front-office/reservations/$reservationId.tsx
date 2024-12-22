import { Suspense } from 'react'

import {
  QueryErrorResetBoundary,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ErrorBoundary } from 'react-error-boundary'

import { ErrorFallback } from '@/components/ui/error-fallback'
import { FormSkeleton } from '@/components/ui/form-skeleton'

async function fetchReservationById(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const response = await fetch(`http://localhost:5000/reservations/${id}`)

  if (response.status === 404) {
    throw new Error('Reservation not found')
  }

  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  const data = await response.json()

  return data
}

function ReservationPage() {
  return (
    <div>
      <h1 className="mb-6 text-lg font-semibold md:text-2xl">
        Edit reservation
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
  )
}

function ReservationForm() {
  const { reservationId } = Route.useParams()

  const reservationQuery = useSuspenseQuery({
    queryKey: ['reservations', reservationId],
    queryFn: () => fetchReservationById(reservationId),
  })

  return (
    <div className="max-w-lg rounded-md border border-gray-100 bg-gray-50 p-4">
      <h2>{reservationQuery.data?.id}</h2>
    </div>
  )
}

export const Route = createFileRoute(
  '/_auth/front-office/reservations/$reservationId',
)({
  component: ReservationPage,
})
