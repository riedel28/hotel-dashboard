import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_dashboard-layout/company')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/_dashboard-layout/company"!</div>;
}
