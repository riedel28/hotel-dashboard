import { Trans, useLingui } from '@lingui/react/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CopyIcon, EllipsisIcon, TrashIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { eventByIdQueryOptions } from '@/api/events';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { FormSkeleton } from '@/components/ui/form-skeleton';
import { useDocumentTitle } from '@/hooks/use-document-title';

import { DeleteEventDialog } from './-components/delete-event-dialog';
import { EventForm } from './-components/event-form';
import { EventPageHeader } from './-components/event-page-header';
import { eventToFormValues } from './-lib/event-form';
import { ensureHotel, useHotel } from './-lib/use-hotel';

function EventPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const eventId = Number(Route.useParams().eventId);
  const { data: event } = useSuspenseQuery(eventByIdQueryOptions(eventId));
  const hotel = useHotel();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  useDocumentTitle(event.title);

  const zone = hotel?.timezone;
  const initialValues = useMemo(
    () => (zone ? eventToFormValues(event, zone) : null),
    [event, zone]
  );

  return (
    <div className="space-y-6">
      <EventPageHeader
        title={event.title}
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t`More actions`}
                />
              }
            >
              <EllipsisIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  void navigate({
                    to: '/events/new',
                    search: { duplicate: eventId }
                  })
                }
              >
                <CopyIcon />
                <Trans>Duplicate</Trans>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive-soft"
                onClick={() => setShowDeleteDialog(true)}
              >
                <TrashIcon />
                <Trans>Delete</Trans>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      {hotel && initialValues ? (
        <EventForm
          property={hotel}
          eventId={eventId}
          initialValues={initialValues}
        />
      ) : (
        <FormSkeleton />
      )}
      <DeleteEventDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        event={event}
        onDeleted={() => navigate({ to: '/events', ignoreBlocker: true })}
      />
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(content-manager)/events/$eventId'
)({
  loader: ({ context: { queryClient, auth }, params: { eventId } }) =>
    Promise.all([
      queryClient.ensureQueryData(eventByIdQueryOptions(Number(eventId))),
      ensureHotel(queryClient, auth.user?.selected_property_id)
    ]),
  component: EventPage
});
