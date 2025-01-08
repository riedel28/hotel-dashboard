import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute(
  '/_dashboard-layout/(front-office)/payments'
)({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/_dashboard-layout/payments"!</div>;
}
