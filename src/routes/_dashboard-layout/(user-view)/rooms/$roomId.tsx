import { Trans } from '@lingui/react/macro';
import {
  QueryErrorResetBoundary,
  useSuspenseQuery
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { RefreshCwIcon } from 'lucide-react';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { roomByIdQueryOptions } from '@/api/rooms';

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

import { EditRoomForm } from './-components/edit-room-form';

function RoomPage() {
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
              <BreadcrumbLink to="/rooms">
                <Trans>Rooms</Trans>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <Trans>Edit room</Trans>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold">
          <Trans>Edit room</Trans>
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
                      <ErrorDisplayMessage>{error instanceof Error ? error.message : String(error)}</ErrorDisplayMessage>
                      <ErrorDisplayActions>
                        <Button
                          variant="destructive"
                          onClick={resetErrorBoundary}
                        >
                          <RefreshCwIcon className="mr-2 h-4 w-4" />
                          <Trans>Refresh</Trans>
                        </Button>
                      </ErrorDisplayActions>
                    </ErrorDisplayError>
                  </div>
                )}
              >
                <RoomForm />
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </Suspense>
      </div>
    </div>
  );
}

function RoomForm() {
  const { roomId } = Route.useParams();
  const roomQuery = useSuspenseQuery(roomByIdQueryOptions(roomId));

  const data = roomQuery.data;

  return <EditRoomForm roomId={roomId} roomData={data} />;
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/rooms/$roomId'
)({
  loader: ({ context: { queryClient }, params: { roomId } }) =>
    queryClient.ensureQueryData(roomByIdQueryOptions(roomId)),
  component: RoomPage
});
