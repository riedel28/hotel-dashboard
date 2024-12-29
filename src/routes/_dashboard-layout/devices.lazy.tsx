import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_dashboard-layout/devices')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/_dashboard-layout/devices"!</div>;
}
