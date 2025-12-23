import { Trans } from '@lingui/react/macro';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { type QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { RefreshCwIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  ErrorDisplayActions,
  ErrorDisplayError,
  ErrorDisplayMessage,
  ErrorDisplayTitle
} from '@/components/ui/error-display';
import { NotFound } from '@/components/ui/not-found';

import type { AuthContext } from '../auth';

interface MyRouterContext {
  auth: AuthContext;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
    </>
  ),
  errorComponent: ({ error, reset }) => {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <QueryErrorResetBoundary>
          {({ reset: resetQuery }) => (
            <ErrorDisplayError className="w-md max-w-md">
              <ErrorDisplayTitle>
                <Trans>Something went wrong</Trans>
              </ErrorDisplayTitle>
              <ErrorDisplayMessage>
                {error instanceof Error
                  ? error.message
                  : String(error) || (
                      <Trans>An unexpected error occurred</Trans>
                    )}
              </ErrorDisplayMessage>
              <ErrorDisplayActions>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={() => {
                    reset();
                    resetQuery();
                  }}
                >
                  <RefreshCwIcon className="mr-2 h-4 w-4" />
                  <Trans>Try Again</Trans>
                </Button>
              </ErrorDisplayActions>
            </ErrorDisplayError>
          )}
        </QueryErrorResetBoundary>
      </div>
    );
  },
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
