import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { meQueryOptions } from '@/api/profile';

import { PasswordSection } from './-components/password-section';

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/profile/password'
)({ component: RouteComponent });

function RouteComponent() {
  const { data: user } = useSuspenseQuery(meQueryOptions());
  return <PasswordSection user={user} />;
}
