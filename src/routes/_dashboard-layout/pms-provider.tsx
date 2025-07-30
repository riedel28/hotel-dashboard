import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute('/_dashboard-layout/pms-provider')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <FormattedMessage
        id="pmsProvider.title"
        defaultMessage='Hello "/_dashboard-layout/pms-provider"!'
      />
    </div>
  );
}
