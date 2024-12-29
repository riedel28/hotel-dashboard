import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_dashboard-layout/rooms')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/_dashboard-layout/rooms"!</div>;
}
