import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { meQueryOptions } from '@/api/profile';
import { rolesQueryOptions } from '@/api/roles';

import { RolesSection } from './-components/roles-section';

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/profile/roles'
)({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(rolesQueryOptions())
});

function RouteComponent() {
  const { data: user } = useSuspenseQuery(meQueryOptions());
  return <RolesSection assignedRoles={user.roles} isAdmin={user.is_admin} />;
}
