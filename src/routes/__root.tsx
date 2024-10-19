import { createRootRoute } from '@tanstack/react-router';

import Dashboard from '@/components/dashboard';

export const Route = createRootRoute({
  component: () => (
    <>
      <Dashboard />
      {/* <TanStackRouterDevtools /> */}
    </>
  )
});
