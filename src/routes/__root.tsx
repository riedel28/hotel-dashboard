import { Trans } from '@lingui/react/macro';
import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import React from 'react';

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import('@tanstack/react-router-devtools').then((res) => ({
        default: res.TanStackRouterDevtools
      }))
    );

import { FullScreenRouteError } from '@/components/route-error';
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
  // Nothing above it to keep, so the whole screen
  errorComponent: FullScreenRouteError,
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
