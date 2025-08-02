import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute(
  '/_dashboard-layout/(admin-view)/customers'
)({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <FormattedMessage
        id="customers.title"
        defaultMessage='Hello "/_dashboard-layout/customers"!'
      />
    </div>
  );
}
