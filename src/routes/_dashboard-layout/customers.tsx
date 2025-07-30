import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute('/_dashboard-layout/customers')({
  component: () => (
    <div>
      <FormattedMessage
        id="customers.title"
        defaultMessage="Hello /customers!"
      />
    </div>
  )
});
