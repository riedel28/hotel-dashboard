import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { propertyByIdQueryOptions } from '@/api/properties';
import { worklogsQueryOptions } from '@/api/worklogs';
import { QueryBoundary } from '@/components/query-boundary';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { CountBadge } from '@/components/ui/count-badge';
import { FormSkeleton } from '@/components/ui/form-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDocumentTitle } from '@/hooks/use-document-title';

import { EditPropertyForm } from './-components/edit-property-form';
import { WorkLog, WorkLogSkeleton } from './-components/work-log';

const propertySearchSchema = z.object({
  tab: z.enum(['work-log']).optional().catch(undefined)
});

function PropertyPage() {
  const { t } = useLingui();
  const { propertyId } = Route.useParams();
  const { tab = 'settings' } = Route.useSearch();
  const navigate = Route.useNavigate();
  // The loader has already fetched it; the fallback only shows on an error.
  const { data } = useQuery(propertyByIdQueryOptions(propertyId));
  const { data: worklogCount } = useQuery({
    ...worklogsQueryOptions(propertyId),
    select: (worklogs) => worklogs.length
  });
  const name = data?.name ?? t`Property`;
  useDocumentTitle(name);

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
              <BreadcrumbLink to="/admin">
                <Trans>Admin</Trans>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink to="/admin/properties">
                <Trans>Properties</Trans>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="truncate text-xl font-bold">{name}</h1>
      </div>

      <Tabs
        className="gap-6"
        value={tab}
        onValueChange={(value) =>
          void navigate({
            search: (prev) => ({
              ...prev,
              tab: value === 'work-log' ? 'work-log' : undefined
            })
          })
        }
      >
        <TabsList variant="pills">
          <TabsTrigger value="settings">
            <Trans>Details</Trans>
          </TabsTrigger>
          <TabsTrigger value="work-log">
            <Trans>Work log</Trans>
            {worklogCount !== undefined && <CountBadge count={worklogCount} />}
          </TabsTrigger>
        </TabsList>
        {/* Both kept mounted so unsaved edits and drafts survive a tab switch. */}
        <TabsContent value="settings" keepMounted>
          <QueryBoundary fallback={<FormSkeleton />}>
            <PropertyForm />
          </QueryBoundary>
        </TabsContent>
        <TabsContent value="work-log" keepMounted>
          <QueryBoundary fallback={<WorkLogSkeleton />}>
            <WorkLog propertyId={propertyId} />
          </QueryBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PropertyForm() {
  const { propertyId } = Route.useParams();
  const propertyQuery = useSuspenseQuery(propertyByIdQueryOptions(propertyId));

  const data = propertyQuery.data;

  return <EditPropertyForm propertyId={propertyId} propertyData={data} />;
}

export const Route = createFileRoute(
  '/_dashboard-layout/admin/properties/$propertyId'
)({
  validateSearch: propertySearchSchema,
  loader: ({ context: { queryClient }, params: { propertyId } }) => {
    // Warmed for the tab's count and list, but not worth blocking the page on.
    void queryClient.prefetchQuery(worklogsQueryOptions(propertyId));
    return queryClient.ensureQueryData(propertyByIdQueryOptions(propertyId));
  },
  component: PropertyPage
});
