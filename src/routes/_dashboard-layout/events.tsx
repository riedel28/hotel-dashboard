import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard-layout/events')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/_dashboard-layout/events"!</div>;
}
