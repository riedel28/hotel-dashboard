import { Trans, useLingui } from '@lingui/react/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CopyIcon, EllipsisIcon, TrashIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { eventIdParamsSchema } from 'shared/types/events';
import { toast } from 'sonner';

import { eventByIdQueryOptions, updateEvent } from '@/api/events';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useSelectedProperty } from '@/routes/_dashboard-layout/-hooks/use-selected-property';

import { DeleteEventDialog } from './-components/delete-event-dialog';
import { EventForm } from './-components/event-form';
import { EventPageHeader } from './-components/event-page-header';
import { NoPropertySelected } from './-components/no-property-selected';
import { eventToFormValues } from './-lib/event-form';

function EventPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { eventId } = Route.useParams();
  const { data: event } = useSuspenseQuery(eventByIdQueryOptions(eventId));
  const property = useSelectedProperty();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  useDocumentTitle(event.title);

  const zone = property?.timezone;
  // Recomputed from the saved event, so a save leaves the form clean
  const initialValues = useMemo(
    () => (zone ? eventToFormValues(event, zone) : null),
    [event, zone]
  );

  return (
    <div className="space-y-6">
      <EventPageHeader
        title={event.title}
        description={<Trans>Edit the event’s details, date and place.</Trans>}
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
      {property && initialValues ? (
        <EventForm
          property={property}
          initialValues={initialValues}
          save={(data) => updateEvent(eventId, data)}
          onSaved={() => toast.success(t`Event updated`)}
          submitLabel={<Trans>Update event</Trans>}
        />
      ) : (
        <NoPropertySelected />
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
  // A malformed id is a bad link, answered by the route's error page
  params: {
    parse: ({ eventId }) => ({
      eventId: eventIdParamsSchema.parse({ id: eventId }).id
    }),
    stringify: ({ eventId }) => ({ eventId: String(eventId) })
  },
  loader: ({ context: { queryClient }, params: { eventId } }) =>
    queryClient.ensureQueryData(eventByIdQueryOptions(eventId)),
  component: EventPage
});
