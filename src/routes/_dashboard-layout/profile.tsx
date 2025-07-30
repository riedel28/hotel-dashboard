import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute('/_dashboard-layout/profile')({
  component: () => (
    <div>
      <FormattedMessage id="profile.title" defaultMessage="Hello /profile!" />
    </div>
  )
});
