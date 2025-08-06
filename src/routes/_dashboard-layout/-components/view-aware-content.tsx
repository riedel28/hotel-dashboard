import { useView } from '@/contexts/view-context';
import { FormattedMessage } from 'react-intl';

export default function ViewAwareContent() {
  const { currentView } = useView();

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 text-lg font-semibold">
        <FormattedMessage
          id="viewAwareContent.title"
          defaultMessage="Current View: {view}"
          values={{ view: currentView }}
        />
      </h3>

      {currentView === 'user' ? (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            <FormattedMessage
              id="viewAwareContent.user.description"
              defaultMessage="You are viewing the user interface. This shows limited functionality for regular users."
            />
          </p>
          <div className="rounded bg-blue-50 p-3 dark:bg-blue-950">
            <p className="text-sm">
              <FormattedMessage
                id="viewAwareContent.user.features"
                defaultMessage="User features: View reservations, make payments, access basic settings"
              />
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            <FormattedMessage
              id="viewAwareContent.admin.description"
              defaultMessage="You are viewing the admin interface. This shows full functionality for administrators."
            />
          </p>
          <div className="rounded bg-red-50 p-3 dark:bg-red-950">
            <p className="text-sm">
              <FormattedMessage
                id="viewAwareContent.admin.features"
                defaultMessage="Admin features: Manage users, configure system settings, access all data, system administration"
              />
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
