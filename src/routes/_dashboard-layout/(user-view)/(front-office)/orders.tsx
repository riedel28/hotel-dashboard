import { Trans } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(front-office)/orders'
)({
  component: () => (
    <div>
      <Trans>Hello /orders!</Trans>
    </div>
  )
});
