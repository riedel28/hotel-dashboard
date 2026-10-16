import { useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { eventByIdQueryOptions } from '@/api/events';
import { FormSkeleton } from '@/components/ui/form-skeleton';
import { useDocumentTitle } from '@/hooks/use-document-title';

import { EventForm } from './-components/event-form';
import { EventPageHeader } from './-components/event-page-header';
import { duplicateValues, emptyEventValues } from './-lib/event-form';
import { ensureHotel, useHotel } from './-lib/use-hotel';

const newEventSearchSchema = z.object({
  // The event Duplicate copies from
  duplicate: z.number().int().positive().optional().catch(undefined)
});

function NewEventPage() {
  const { t } = useLingui();
  useDocumentTitle(t`New event`);
  const { duplicate } = Route.useSearch();
  const hotel = useHotel();
  const source = useQuery({
    ...eventByIdQueryOptions(duplicate ?? 0),
    enabled: duplicate !== undefined
  });

  const ready = hotel && (duplicate === undefined || source.data);

  return (
    <div className="space-y-6">
      <EventPageHeader title={t`New event`} />
      {ready ? (
        <EventForm
          // A new duplicate source starts the form afresh
          key={duplicate ?? 'new'}
          property={hotel}
          initialValues={
            source.data
              ? duplicateValues(source.data, hotel.timezone)
              : emptyEventValues(hotel.country_code)
          }
        />
      ) : (
        <FormSkeleton />
      )}
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(content-manager)/events/new'
)({
  validateSearch: newEventSearchSchema,
  loaderDeps: ({ search: { duplicate } }) => ({ duplicate }),
  loader: ({ context: { queryClient, auth }, deps: { duplicate } }) =>
    Promise.all([
      ensureHotel(queryClient, auth.user?.selected_property_id),
      duplicate && queryClient.ensureQueryData(eventByIdQueryOptions(duplicate))
    ]),
  component: NewEventPage
});
