import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { meQueryOptions } from '@/api/profile';

import { PersonalSection } from './-components/personal-section';

export const Route = createFileRoute('/_dashboard-layout/(user-view)/profile/')(
  { component: RouteComponent }
);

function RouteComponent() {
  const { data: user } = useSuspenseQuery(meQueryOptions());
  return <PersonalSection user={user} />;
}
