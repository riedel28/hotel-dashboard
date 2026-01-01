import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useAuth } from '@/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { propertiesQueryOptions } from '@/api/properties';
import { Route as DashboardLayoutRoute } from '@/routes/_dashboard-layout';
import { MobileMenu } from '@/routes/_dashboard-layout/-components/mobile-menu';
import PropertySelector from '@/routes/_dashboard-layout/-components/property-selector';
import UserMenu from '@/routes/_dashboard-layout/-components/user-menu';
import ViewSelector from '@/routes/_dashboard-layout/-components/view-selector';
import { TextAlignJustifyIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { properties } = DashboardLayoutRoute.useLoaderData();
  const { user } = useAuth();
  const isAdmin = user?.is_admin === true;
  const queryClient = useQueryClient();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleReloadProperties = async () => {
    // Invalidate the properties query to force a refetch
    await queryClient.invalidateQueries({
      queryKey: propertiesQueryOptions().queryKey
    });
    // Invalidate the router to trigger loader refetch
    await router.invalidate();
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:ps-3.5">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-2">
            {/* Mobile menu trigger */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <TextAlignJustifyIcon className="size-4" />
            </Button>
            {/* Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                {isAdmin && (
                  <>
                    <BreadcrumbItem>
                      <ViewSelector />
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                )}
                <BreadcrumbItem>
                  <PropertySelector
                    properties={properties.index}
                    onReload={handleReloadProperties}
                  />
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* User menu */}
            <UserMenu />
          </div>
        </div>
      </header>
      <MobileMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
    </>
  );
}
