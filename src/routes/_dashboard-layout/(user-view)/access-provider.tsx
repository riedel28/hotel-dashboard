import { Trans } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/access-provider'
)({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <Trans>Hello "/_dashboard-layout/access-provider"!</Trans>
    </div>
  );
}
