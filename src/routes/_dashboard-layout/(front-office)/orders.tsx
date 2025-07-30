import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute(
  '/_dashboard-layout/(front-office)/orders'
)({
  component: () => (
    <div>
      <FormattedMessage id="orders.title" defaultMessage="Hello /orders!" />
    </div>
  )
});
