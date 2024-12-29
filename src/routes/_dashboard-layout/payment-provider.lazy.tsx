import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_dashboard-layout/payment-provider')(
  {
    component: RouteComponent
  }
);

function RouteComponent() {
  return <div>Hello "/_dashboard-layout/payment-provider"!</div>;
}
