import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute(
  '/_dashboard-layout/(admin-view)/properties'
)({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <FormattedMessage
        id="properties.title"
        defaultMessage='Hello "/_dashboard-layout/properties"!'
      />
    </div>
  );
}
