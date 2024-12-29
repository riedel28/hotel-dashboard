import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_dashboard-layout/monitoring')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/_dashboard-layout/monitoring"!</div>;
}
