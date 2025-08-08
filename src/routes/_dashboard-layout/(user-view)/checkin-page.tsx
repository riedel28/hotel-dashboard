import { Trans } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/checkin-page'
)({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <Trans>Hello "/_dashboard-layout/checkin-page"!</Trans>
    </div>
  );
}
