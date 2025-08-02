import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(front-office)/registration-forms'
)({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <FormattedMessage
        id="registrationForms.title"
        defaultMessage='Hello "/_dashboard-layout/registration-forms"!'
      />
    </div>
  );
}
