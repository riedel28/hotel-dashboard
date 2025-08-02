import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(front-office)/orders'
)({
  component: () => (
    <div>
      <FormattedMessage id="orders.title" defaultMessage="Hello /orders!" />
    </div>
  )
});
