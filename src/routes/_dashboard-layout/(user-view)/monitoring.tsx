import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute('/_dashboard-layout/(user-view)/monitoring')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <FormattedMessage
        id="monitoring.title"
        defaultMessage='Hello "/_dashboard-layout/monitoring"!'
      />
    </div>
  );
}
