import { Trans } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/analytics'
)({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <Trans>Hello /analytics!</Trans>
    </div>
  );
}
