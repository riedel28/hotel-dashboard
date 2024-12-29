import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_dashboard-layout/access-provider')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/_dashboard-layout/access-provider"!</div>;
}
