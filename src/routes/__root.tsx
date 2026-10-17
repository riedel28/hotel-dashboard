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

import {
  FullScreenNotFound,
  FullScreenRouteError
} from '@/components/route-state';

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
  notFoundComponent: FullScreenNotFound
});
