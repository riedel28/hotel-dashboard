import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute('/_dashboard-layout/checkin-page')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <FormattedMessage
        id="checkinPage.title"
        defaultMessage='Hello "/_dashboard-layout/checkin-page"!'
      />
    </div>
  );
}
