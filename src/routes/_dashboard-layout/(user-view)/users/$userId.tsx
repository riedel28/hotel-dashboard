import { Trans, useLingui } from '@lingui/react/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { fetchUserById } from '@/api/users';
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

import { EditUserForm } from './-components/edit-user-form';

function EditUserPage() {
  const { t } = useLingui();
  useDocumentTitle(t`User Details`);

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
              <BreadcrumbLink to="/users">
                <Trans>Users</Trans>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <Trans>Edit user</Trans>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-xl font-bold">
          <Trans>Edit user</Trans>
        </h1>
      </div>

      <div>
        <QueryBoundary fallback={<FormSkeleton />}>
          <UserForm />
        </QueryBoundary>
      </div>
    </div>
  );
}

function UserForm() {
  const { userId } = Route.useParams();
  const userQuery = useSuspenseQuery({
    queryKey: ['users', Number(userId)],
    queryFn: () => fetchUserById(Number(userId))
  });

  const data = userQuery.data;
  const userData = {
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    country_code: data.country_code,
    is_admin: data.is_admin,
    roles: data.roles
  };

  return <EditUserForm userId={Number(userId)} userData={userData} />;
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/users/$userId'
)({
  component: EditUserPage
});
