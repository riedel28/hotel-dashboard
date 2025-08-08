import { Trans } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard-layout/(user-view)/events')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <Trans>Hello "/_dashboard-layout/events"!</Trans>
    </div>
  );
}
