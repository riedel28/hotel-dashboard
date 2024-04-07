import { createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import Dashboard from '@/components/dashboard';

export const Route = createRootRoute({
  component: () => (
    <>
      <Dashboard />
      <TanStackRouterDevtools />
    </>
  )
});
