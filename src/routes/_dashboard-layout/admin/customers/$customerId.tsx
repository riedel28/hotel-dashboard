import { Trans, useLingui } from '@lingui/react/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
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
  useDocumentTitle(t`Customer Details`);

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
            <BreadcrumbPage>
              <Trans>Edit Customer</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <QueryBoundary
        fallback={
          <div className="space-y-6">
            <h1 className="text-xl font-bold">
              <Trans>Edit Customer</Trans>
            </h1>
            <FormSkeleton />
          </div>
        }
      >
        <CustomerForm />
      </QueryBoundary>
    </div>
  );
}

function CustomerForm() {
  const { customerId } = Route.useParams();
  const { data } = useSuspenseQuery(customerByIdQueryOptions(customerId));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">
        <Trans>Edit Customer</Trans>
      </h1>
      <EditCustomerForm customer={data} />
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/admin/customers/$customerId'
)({
  loader: ({ context: { queryClient }, params: { customerId } }) =>
    queryClient.ensureQueryData(customerByIdQueryOptions(customerId)),
  component: CustomerPage
});
