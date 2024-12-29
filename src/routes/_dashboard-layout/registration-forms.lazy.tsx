import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute(
  '/_dashboard-layout/registration-forms'
)({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/_dashboard-layout/registration-forms"!</div>;
}
