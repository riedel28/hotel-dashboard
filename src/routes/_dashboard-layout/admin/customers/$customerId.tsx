import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { customerByIdQueryOptions } from '@/api/customers';
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

import { EditCustomerForm } from './-components/edit-customer-form';

function CustomerPage() {
  const { t } = useLingui();
  const { customerId } = Route.useParams();
  // The loader has already fetched it; the fallback only shows on an error.
  const { data } = useQuery(customerByIdQueryOptions(customerId));
  const name = data ? `${data.first_name} ${data.last_name}` : t`Customer`;
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
              <BreadcrumbLink to="/admin/customers">
                <Trans>Customers</Trans>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* Who this is and how to reach them, as a property shows its owner */}
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="truncate text-xl font-bold">{name}</h1>
          {data?.company_name && (
            <span className="truncate text-sm text-muted-foreground">
              {data.company_name}
            </span>
          )}
          {data && (
            <a
              href={`mailto:${data.email}`}
              // Styled as the owner link in a property's header
              className="truncate text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {data.email}
            </a>
          )}
        </div>
      </div>

      <QueryBoundary fallback={<FormSkeleton />}>
        <CustomerForm />
      </QueryBoundary>
    </div>
  );
}

function CustomerForm() {
  const { customerId } = Route.useParams();
  const { data } = useSuspenseQuery(customerByIdQueryOptions(customerId));

  return <EditCustomerForm customer={data} />;
}

export const Route = createFileRoute(
  '/_dashboard-layout/admin/customers/$customerId'
)({
  loader: ({ context: { queryClient }, params: { customerId } }) =>
    queryClient.ensureQueryData(customerByIdQueryOptions(customerId)),
  component: CustomerPage
});
