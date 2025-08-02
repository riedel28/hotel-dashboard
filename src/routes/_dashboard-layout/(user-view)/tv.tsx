import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute('/_dashboard-layout/(user-view)/tv')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <FormattedMessage
        id="tv.title"
        defaultMessage='Hello "/_dashboard-layout/tv"!'
      />
    </div>
  );
}
