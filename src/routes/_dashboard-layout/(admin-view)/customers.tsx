import { Trans } from '@lingui/react/macro';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_dashboard-layout/(admin-view)/customers'
)({
  beforeLoad: ({ context }) => {
    if (!context.auth.user?.is_admin) {
      throw redirect({ to: '/' });
    }
  },
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <Trans>Hello "/_dashboard-layout/customers"!</Trans>
    </div>
  );
}
