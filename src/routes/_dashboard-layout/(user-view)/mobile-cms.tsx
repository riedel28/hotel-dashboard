import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/mobile-cms'
)({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <FormattedMessage
        id="mobileCMS.title"
        defaultMessage='Hello "/_dashboard-layout/mobile-cms"!'
      />
    </div>
  );
}
