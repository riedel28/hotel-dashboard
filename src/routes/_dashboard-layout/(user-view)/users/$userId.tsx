import { Trans } from '@lingui/react/macro';
import {
  QueryErrorResetBoundary,
  useSuspenseQuery
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { RefreshCwIcon } from 'lucide-react';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { fetchUserById } from '@/api/users';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  ErrorDisplayActions,
  ErrorDisplayError,
  ErrorDisplayMessage,
  ErrorDisplayTitle
} from '@/components/ui/error-display';
import { FormSkeleton } from '@/components/ui/form-skeleton';

import { EditUserForm } from './-components/edit-user-form';

function EditUserPage() {
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
        <h1 className="text-2xl font-bold">
          <Trans>Edit user</Trans>
        </h1>
      </div>

      <div>
        <Suspense fallback={<FormSkeleton />}>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                onReset={reset}
                fallbackRender={({ error, resetErrorBoundary }) => (
                  <div className="flex">
                    <ErrorDisplayError className="w-md max-w-md">
                      <ErrorDisplayTitle>
                        <Trans>Something went wrong</Trans>
                      </ErrorDisplayTitle>
                      <ErrorDisplayMessage>{error.message}</ErrorDisplayMessage>
                      <ErrorDisplayActions>
                        <Button
                          variant="destructive"
                          onClick={resetErrorBoundary}
                        >
                          <RefreshCwIcon className="mr-2 h-4 w-4" />
                          <Trans>Refresh</Trans>
                        </Button>
                      </ErrorDisplayActions>
                    </ErrorDisplayError>
                  </div>
                )}
              >
                <UserForm />
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </Suspense>
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
