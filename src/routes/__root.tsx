import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { FormattedMessage } from 'react-intl';

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
          title={
            <FormattedMessage
              id="notFound.global.title"
              defaultMessage="Page not found"
            />
          }
          message={
            <FormattedMessage
              id="notFound.global.message"
              defaultMessage="Sorry, we couldn't find the page you're looking for."
            />
          }
          showHomeButton
          showBackButton
          homeButtonText={
            <FormattedMessage
              id="notFound.global.homeButton"
              defaultMessage="Go to Dashboard"
            />
          }
          backButtonText={
            <FormattedMessage
              id="notFound.global.backButton"
              defaultMessage="Go back"
            />
          }
        />
      </div>
    );
  }
});
