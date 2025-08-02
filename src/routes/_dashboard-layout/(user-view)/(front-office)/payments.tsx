import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(front-office)/payments'
)({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <FormattedMessage
        id="payments.title"
        defaultMessage='Hello "/_dashboard-layout/payments"!'
      />
    </div>
  );
}
