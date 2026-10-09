import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { propertyByIdQueryOptions } from '@/api/properties';
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

import { EditPropertyForm } from './-components/edit-property-form';

function PropertyPage() {
  const { t } = useLingui();
  const { propertyId } = Route.useParams();
  // The loader has already fetched it; the fallback only shows on an error.
  const { data } = useQuery(propertyByIdQueryOptions(propertyId));
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

      <div>
        <QueryBoundary fallback={<FormSkeleton />}>
          <PropertyForm />
        </QueryBoundary>
      </div>
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
  loader: ({ context: { queryClient }, params: { propertyId } }) =>
    queryClient.ensureQueryData(propertyByIdQueryOptions(propertyId)),
  component: PropertyPage
});
