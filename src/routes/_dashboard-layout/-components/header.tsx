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
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="group size-8 hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 md:hidden inline-flex items-center justify-center rounded-md"
              aria-label="Open menu"
            >
              <svg
                className="pointer-events-none"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 12L20 12"
                  className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"
                />
                <path
                  d="M4 12H20"
                  className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                />
                <path
                  d="M4 12H20"
                  className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"
                />
              </svg>
            </button>
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
