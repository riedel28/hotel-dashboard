import { Trans } from '@lingui/react/macro';
import {
  type QueryClient,
  useQueryErrorResetBoundary
} from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import React from 'react';

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import('@tanstack/react-router-devtools').then((res) => ({
        default: res.TanStackRouterDevtools
      }))
    );

import { RefreshCwIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@/components/ui/empty';
import { NotFound } from '@/components/ui/not-found';

import type { AuthContext } from '../auth';

interface MyRouterContext {
  auth: AuthContext;
  queryClient: QueryClient;
}

/**
 * Reached when an error escapes the route's own boundary — a failed loader, or
 * a render error outside a `QueryBoundary`. `useQueryErrorResetBoundary` reads
 * the same module-level context the pages read, so clearing it here lets the
 * retried route refetch instead of re-throwing its cached error. Rendering a
 * `QueryErrorResetBoundary` provider here would not work: no query runs inside
 * this subtree, since it replaces the route that owns them.
 */
function RootErrorComponent({
  error,
  reset
}: {
  error: unknown;
  reset: () => void;
}) {
  const { reset: resetQueries } = useQueryErrorResetBoundary();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Empty variant="destructive" className="w-md max-w-md">
        <EmptyHeader>
          <EmptyTitle>
            <Trans>Something went wrong</Trans>
          </EmptyTitle>
          <EmptyDescription>
            {(error instanceof Error ? error.message : null) || (
              <Trans>An unexpected error occurred</Trans>
            )}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="destructive"
            size="lg"
            onClick={() => {
              resetQueries();
              reset();
            }}
          >
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            <Trans>Try Again</Trans>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
    </>
  ),
  errorComponent: RootErrorComponent,
  notFoundComponent: () => {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <NotFound
          title={<Trans>Page not found</Trans>}
          message={
            <Trans>Sorry, we couldn't find the page you're looking for.</Trans>
          }
          showHomeButton
          showBackButton
          homeButtonText={<Trans>Go to Dashboard</Trans>}
          backButtonText={<Trans>Go back</Trans>}
        />
      </div>
    );
  }
});
