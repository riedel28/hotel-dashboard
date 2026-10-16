import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createFileRoute,
  stripSearchParams,
  useNavigate
} from '@tanstack/react-router';
import { CalendarDaysIcon, PlusIcon } from 'lucide-react';
import {
  eventCategorySchema,
  eventPeriodSchema,
  eventSortColumns
} from 'shared/types/events';
import type { Property } from 'shared/types/properties';
import { z } from 'zod';

import { eventsQueryOptions, invalidateEvents } from '@/api/events';
import {
  EmptyFilterResult,
  EmptyTableState
} from '@/components/empty-table-state';
import { tableLoadError } from '@/components/load-error';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { lenientSearch } from '@/lib/search-params';
import { cn } from '@/lib/utils';
import { useSelectedProperty } from '@/routes/_dashboard-layout/-hooks/use-selected-property';

import { EventsFilters } from './-components/events-filters';
import { EventsTable } from './-components/events-table';
import { NoPropertySelected } from './-components/no-property-selected';
import { useEventsSearch } from './-hooks/use-events-search';

const PAGE_SIZES = [5, 10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

const eventsSearchSchema = z.object({
  q: z.union([z.string(), z.number().transform(String)]).optional(),
  category: z.array(eventCategorySchema).optional(),
  period: eventPeriodSchema.default('upcoming'),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  page: z.number().int().positive().default(1),
  per_page: z
    .number()
    .refine((size) => PAGE_SIZES.includes(size))
    .default(DEFAULT_PAGE_SIZE),
  sort_by: z.enum(eventSortColumns).default('starts_at'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

function EventsPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Events`);
  const navigate = useNavigate();
  const property = useSelectedProperty();

  return (
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
            <BreadcrumbPage>
              <Trans>Events</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex justify-between">
        <h1 className="text-xl font-bold">
          <Trans>Events</Trans>
        </h1>
        {property && (
          <Button onClick={() => void navigate({ to: '/events/new' })}>
            <PlusIcon aria-hidden="true" />
            <Trans>New event</Trans>
          </Button>
        )}
      </div>

      {property ? (
        <EventsContent property={property} />
      ) : (
        <NoPropertySelected />
      )}
    </div>
  );
}

function EventsContent({ property }: { property: Property }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const search = useEventsSearch();
  // A plain query: a change of filter, sorting or page keeps the rows on
  // screen (dimmed) until the new ones arrive.
  const eventsQuery = useQuery(eventsQueryOptions(search.params));
  const events = eventsQuery.data?.index ?? [];
  // The property has no events at all (not: none match the filters)
  const hasNoEvents = eventsQuery.data?.total === 0 && !search.hasActiveFilters;

  return (
    <div className="space-y-2.5">
      <EventsFilters
        filters={search.filters}
        hasActiveFilters={search.hasActiveFilters}
        setFilters={search.setFilters}
        clearFilters={search.clearFilters}
        dateRange={search.dateRange}
        setDateRange={search.setDateRange}
        isRefreshing={eventsQuery.isFetching}
        onRefresh={() => void invalidateEvents(queryClient)}
      />
      <div
        className={cn('transition-opacity duration-300 ease-in-out', {
          'opacity-70': eventsQuery.isFetching
        })}
      >
        <EventsTable
          error={tableLoadError(
            eventsQuery,
            <Trans>Couldn't load events</Trans>
          )}
          data={events}
          zone={property.timezone}
          isLoading={eventsQuery.isLoading}
          pageIndex={search.pageIndex}
          pageSize={search.pageSize}
          totalCount={eventsQuery.data?.total ?? 0}
          pageCount={eventsQuery.data?.page_count ?? 0}
          sort={search.sort}
          onSortChange={search.setSort}
          onPageChange={search.setPage}
          onOpen={(eventId) =>
            void navigate({
              to: '/events/$eventId',
              params: { eventId: String(eventId) }
            })
          }
          emptyMessage={
            hasNoEvents ? (
              <EmptyTableState
                icon={<CalendarDaysIcon />}
                title={<Trans>No upcoming events</Trans>}
                description={
                  <Trans>
                    Plan what is on for guests: concerts, tastings, tours.
                  </Trans>
                }
                action={{
                  label: <Trans>New event</Trans>,
                  icon: <PlusIcon aria-hidden="true" />,
                  onClick: () => void navigate({ to: '/events/new' })
                }}
              />
            ) : (
              <EmptyFilterResult
                description={<Trans>No events match the filters.</Trans>}
                onClearFilters={search.clearFilters}
              />
            )
          }
        />
      </div>
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(content-manager)/events/'
)({
  // A stale or hand-edited link loses its bad params, not the whole page
  validateSearch: lenientSearch(eventsSearchSchema),
  // Keep default values out of the URL
  search: {
    middlewares: [
      stripSearchParams({
        period: 'upcoming',
        page: 1,
        per_page: DEFAULT_PAGE_SIZE,
        sort_by: 'starts_at',
        sort_order: 'asc'
      })
    ]
  },
  loaderDeps: ({ search }) => search,
  // Waited for, but a failure isn't thrown here: the table shows it
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.prefetchQuery(eventsQueryOptions(deps)),
  component: EventsPage
});
