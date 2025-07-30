import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute('/_dashboard-layout/payment-provider')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <FormattedMessage
        id="paymentProvider.title"
        defaultMessage='Hello "/_dashboard-layout/payment-provider"!'
      />
    </div>
  );
}
