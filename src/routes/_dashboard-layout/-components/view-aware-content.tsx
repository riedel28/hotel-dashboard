import { Trans } from '@lingui/react/macro';
import { useView } from '@/contexts/view-context';

export default function ViewAwareContent() {
  const { currentView } = useView();

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 text-lg font-semibold">
        <Trans>Current View: {currentView}</Trans>
      </h3>

      {currentView === 'user' ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <Trans>
              You are viewing the user interface. This shows limited
              functionality for regular users.
            </Trans>
          </p>
          <div className="rounded bg-blue-50 p-3 dark:bg-blue-950">
            <p className="text-sm">
              <Trans>
                User features: View reservations, make payments, access basic
                settings
              </Trans>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <Trans>
              You are viewing the admin interface. This shows full functionality
              for administrators.
            </Trans>
          </p>
          <div className="rounded bg-red-50 p-3 dark:bg-red-950">
            <p className="text-sm">
              <Trans>
                Admin features: Manage users, configure system settings, access
                all data, system administration
              </Trans>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
