import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard-layout/checkin-page')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/_dashboard-layout/checkin-page"!</div>;
}
