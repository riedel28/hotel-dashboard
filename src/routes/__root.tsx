import { Trans } from '@lingui/react/macro';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { NotFound } from '@/components/ui/not-found';

import type { AuthContext } from '../auth';

interface MyRouterContext {
  auth: AuthContext;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
    </>
  ),
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
