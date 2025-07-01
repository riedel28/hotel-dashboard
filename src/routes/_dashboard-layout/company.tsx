import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard-layout/company')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/_dashboard-layout/company"!</div>;
}
