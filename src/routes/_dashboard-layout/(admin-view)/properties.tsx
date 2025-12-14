import { fetchProperties } from '@/api/properties';
import { Trans } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_dashboard-layout/(admin-view)/properties'
)({
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
