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
        {/* Touch size in the phone sheet: taller and rounder, with the tabs
          concentric with the track */}
        <TabsList className="w-full in-data-[mobile=true]:pointer-coarse:h-10! in-data-[mobile=true]:pointer-coarse:rounded-xl">
          <TabsTrigger
            value="user"
            nativeButton={false}
            className="h-6 flex-1 text-xs in-data-[mobile=true]:pointer-coarse:h-full in-data-[mobile=true]:pointer-coarse:rounded-lg in-data-[mobile=true]:pointer-coarse:text-sm"
            render={<Link to="/" />}
          >
            <Trans>User</Trans>
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            nativeButton={false}
            className="h-6 flex-1 text-xs in-data-[mobile=true]:pointer-coarse:h-full in-data-[mobile=true]:pointer-coarse:rounded-lg in-data-[mobile=true]:pointer-coarse:text-sm"
            render={<Link to="/admin" />}
          >
            <Trans>Admin</Trans>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </SidebarGroup>
  );
}
