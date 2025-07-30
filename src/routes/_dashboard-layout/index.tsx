/* eslint-disable formatjs/no-literal-string-in-jsx */
import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

import { useAuth } from '../../auth';

export const Route = createFileRoute('/_dashboard-layout/')({
  component: StartPage
});

function StartPage() {
  const auth = useAuth();

  return (
    <section className="grid gap-2 p-2">
      <p>
        <FormattedMessage
          id="dashboard.welcome"
          defaultMessage="Hi {email}!"
          values={{ email: auth.user?.email }}
        />
      </p>
      <p>
        <FormattedMessage
          id="dashboard.currentRoute"
          defaultMessage="You are currently on the dashboard route."
        />
      </p>

      <div className="border-muted bg-muted grid max-w-md grid-cols-2 gap-4 rounded-md p-4">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium">
            <FormattedMessage
              id="dashboard.serialNumber"
              defaultMessage="Serial nummer"
            />
          </span>
          <span>12QW43TYOP</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium">
            <FormattedMessage
              id="dashboard.macAddress"
              defaultMessage="MAC-Address"
            />
          </span>
          <span>123.01.05.85</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium">
            <FormattedMessage
              id="dashboard.deviceName"
              defaultMessage="Device name"
            />
          </span>
          <span>iPad (3th generation)</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium">
            <FormattedMessage
              id="dashboard.lastSignal"
              defaultMessage="Last signal"
            />
          </span>
          <span>20.12.2024</span>
        </div>
      </div>
    </section>
  );
}
