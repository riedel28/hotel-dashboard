import { Trans, useLingui } from '@lingui/react/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { roomByIdQueryOptions } from '@/api/rooms';
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

import { EditRoomForm } from './-components/edit-room-form';

function RoomPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Room Details`);

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
        <h1 className="text-xl font-bold">
          <Trans>Edit room</Trans>
        </h1>
      </div>

      <div>
        <QueryBoundary fallback={<FormSkeleton />}>
          <RoomForm />
        </QueryBoundary>
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
