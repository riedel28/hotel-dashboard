import { createFileRoute } from '@tanstack/react-router';

import { twoFactorStatusQueryOptions } from '@/api/profile';

import { TwoFactorSection } from './-components/two-factor-section';

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/profile/two-factor'
)({
  component: TwoFactorSection,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(twoFactorStatusQueryOptions())
});
