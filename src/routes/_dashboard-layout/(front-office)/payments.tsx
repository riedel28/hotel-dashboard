import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_dashboard-layout/(front-office)/payments'
)({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/_dashboard-layout/payments"!</div>;
}
