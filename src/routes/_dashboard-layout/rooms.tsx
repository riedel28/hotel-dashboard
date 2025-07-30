import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute('/_dashboard-layout/rooms')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <FormattedMessage
        id="rooms.title"
        defaultMessage='Hello "/_dashboard-layout/rooms"!'
      />
    </div>
  );
}
