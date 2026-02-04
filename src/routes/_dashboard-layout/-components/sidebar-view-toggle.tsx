import { Trans, useLingui } from '@lingui/react/macro';
import { useAuth } from '@/auth';
import { SidebarGroup } from '@/components/ui/sidebar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useView, type ViewType } from '@/contexts/view-context';

export function SidebarViewToggle() {
  const { t } = useLingui();
  const { currentView, setCurrentView } = useView();
  const { user } = useAuth();

  // Hide view toggle if user is not admin
  if (!user?.is_admin) {
    return null;
  }

  const handleValueChange = (values: string[]) => {
    const value = values[0];
    if (value === 'user' || value === 'admin') {
      setCurrentView(value as ViewType);
    }
  };

  return (
    <SidebarGroup className="py-2 group-data-[collapsible=icon]:hidden">
      <ToggleGroup
        value={[currentView]}
        onValueChange={handleValueChange}
        className="w-full"
        aria-label={t`Switch view`}
      >
        <ToggleGroupItem
          value="user"
          className="flex-1 text-xs"
          aria-label={t`User view`}
        >
          <Trans>User</Trans>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="admin"
          className="flex-1 text-xs"
          aria-label={t`Admin view`}
        >
          <Trans>Admin</Trans>
        </ToggleGroupItem>
      </ToggleGroup>
    </SidebarGroup>
  );
}
