import { Trans } from '@lingui/react/macro';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { fetchProperties } from '@/api/properties';

export const Route = createFileRoute(
  '/_dashboard-layout/(admin-view)/properties'
)({
  beforeLoad: ({ context }) => {
    if (!context.auth.user?.is_admin) {
      throw redirect({ to: '/' });
    }
  },
  component: RouteComponent,
  loader: async () => {
    const properties = await fetchProperties();
    return { properties };
  }
});

function RouteComponent() {
  return (
    <div>
      <Trans>Hello "/_dashboard-layout/properties"!</Trans>
    </div>
  );
}
