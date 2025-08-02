import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute('/_dashboard-layout/(user-view)/devices')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <FormattedMessage
        id="devices.title"
        defaultMessage='Hello "/_dashboard-layout/devices"!'
      />
    </div>
  );
}
