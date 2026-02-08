import { Trans, useLingui } from '@lingui/react/macro';
import { useAuth } from '@/auth';
import { SidebarGroup } from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useView, type ViewType } from '@/contexts/view-context';

export function SidebarViewToggle() {
  const { t } = useLingui();
  const { currentView, setCurrentView } = useView();
  const { user } = useAuth();

  // Hide view toggle if user is not admin
  if (!user?.is_admin) {
    return null;
  }

  const handleValueChange = (value: string | number | null) => {
    if (value === 'user' || value === 'admin') {
      setCurrentView(value as ViewType);
    }
  };

  return (
    <SidebarGroup className="py-2 group-data-[collapsible=icon]:hidden">
      <Tabs
        value={currentView}
        onValueChange={handleValueChange}
        aria-label={t`Switch view`}
      >
        <TabsList className="w-full">
          <TabsTrigger value="user" className="flex-1 h-6 text-xs">
            <Trans>User</Trans>
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex-1 h-6 text-xs">
            <Trans>Admin</Trans>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </SidebarGroup>
  );
}
