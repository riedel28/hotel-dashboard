import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { z } from 'zod';

import { createEvent, eventByIdQueryOptions } from '@/api/events';
import { scrollPageToTop } from '@/components/section-nav';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useSelectedProperty } from '@/routes/_dashboard-layout/-hooks/use-selected-property';

import { EventForm } from './-components/event-form';
import { EventPageHeader } from './-components/event-page-header';
import { NoPropertySelected } from './-components/no-property-selected';
import { duplicateValues, emptyEventValues } from './-lib/event-form';

const newEventSearchSchema = z.object({
  // The event Duplicate copies from
  duplicate: z.number().int().positive().optional().catch(undefined)
});

function NewEventPage() {
  const { t } = useLingui();
  useDocumentTitle(t`New event`);
  const navigate = useNavigate();
  const property = useSelectedProperty();
  const initialValues = Route.useLoaderData();
  const { duplicate } = Route.useSearch();

  return (
    <div className="space-y-6">
      <EventPageHeader
        title={t`New event`}
        description={
          <Trans>Describe the event and when and where it takes place.</Trans>
        }
      />
      {property && initialValues ? (
        <EventForm
          // Another duplicate source starts the form afresh
          key={duplicate ?? 'new'}
          property={property}
          initialValues={initialValues}
          save={createEvent}
          onSaved={(event) => {
            toast.success(t`Event created`);
            // On to the event itself
            scrollPageToTop();
            void navigate({
              to: '/events/$eventId',
              params: { eventId: event.id },
              ignoreBlocker: true
            });
          }}
          submitLabel={<Trans>Create event</Trans>}
          isNew
        />
      ) : (
        <NoPropertySelected />
      )}
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(content-manager)/events/new'
)({
  validateSearch: newEventSearchSchema,
  loaderDeps: ({ search: { duplicate } }) => ({ duplicate }),
  // What the form starts with: empty, or a copy of the event to duplicate
  loader: async ({
    context: { queryClient, selectedProperty },
    deps: { duplicate }
  }) => {
    if (!selectedProperty) return null;
    if (!duplicate) return emptyEventValues(selectedProperty.country_code);
    const source = await queryClient.ensureQueryData(
      eventByIdQueryOptions(duplicate)
    );
    return duplicateValues(source, selectedProperty.timezone);
  },
  component: NewEventPage
});
