import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/door-locks'
)({
  component: RouteComponent
});

function RouteComponent() {
  return null;
}
