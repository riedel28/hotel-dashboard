import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute('/_dashboard-layout/(user-view)/access-provider')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <FormattedMessage
        id="accessProvider.title"
        defaultMessage="Hello '/_dashboard-layout/access-provider'!"
      />
    </div>
  );
}
