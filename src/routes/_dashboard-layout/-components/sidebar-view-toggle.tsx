import { Trans, useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/auth';
import { SidebarGroup } from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentView } from '@/hooks/use-current-view';

export function SidebarViewToggle() {
  const { t } = useLingui();
  const currentView = useCurrentView();
  const { user } = useAuth();

  if (!user?.is_admin) {
    return null;
  }

  return (
    <SidebarGroup className="py-2 group-data-[collapsible=icon]:hidden">
      <Tabs value={currentView} aria-label={t`Switch view`}>
        <TabsList className="w-full">
          <TabsTrigger
            value="user"
            className="flex-1 h-6 text-xs"
            render={<Link to="/" />}
          >
            <Trans>User</Trans>
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="flex-1 h-6 text-xs"
            render={<Link to="/admin" />}
          >
            <Trans>Admin</Trans>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </SidebarGroup>
  );
}
