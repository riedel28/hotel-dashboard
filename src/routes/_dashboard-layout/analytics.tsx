import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute('/_dashboard-layout/analytics')({
  component: () => (
    <div>
      <FormattedMessage
        id="analytics.title"
        defaultMessage="Hello /analytics!"
      />
    </div>
  )
});
