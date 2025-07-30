import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

export const Route = createFileRoute('/_dashboard-layout/about')({
  component: About
});

function About() {
  return (
    <div className="p-2">
      <FormattedMessage id="about.title" defaultMessage="Hello from About!" />
    </div>
  );
}
