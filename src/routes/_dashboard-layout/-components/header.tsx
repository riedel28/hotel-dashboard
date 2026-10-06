import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { TextAlignJustifyIcon } from 'lucide-react';
import * as React from 'react';

import { propertiesQueryOptions } from '@/api/properties';
import { useAuth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Route as DashboardLayoutRoute } from '@/routes/_dashboard-layout';
import { MobileMenu } from '@/routes/_dashboard-layout/-components/mobile-menu';
import PropertySelector from '@/routes/_dashboard-layout/-components/property-selector';
import UserMenu from '@/routes/_dashboard-layout/-components/user-menu';

export default function Header() {
  const { properties } = DashboardLayoutRoute.useLoaderData();
  const { user, updateSelectedProperty } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [optimisticPropertyId, setOptimisticPropertyId] = React.useState<
    string | undefined
  >();

  // Re-run the layout's `beforeLoad` once the new selection has reached the
  // router context, so the nav items (and the redirect away from a page the
  // new Property has switched off) follow the Property. Done in an effect, not
  // in `handlePropertyChange`: there the context may still hold the old user.
  const selectedPropertyId = user?.selected_property_id;
  const lastPropertyId = React.useRef(selectedPropertyId);
  React.useEffect(() => {
    if (lastPropertyId.current === selectedPropertyId) return;
    lastPropertyId.current = selectedPropertyId;
    // Mark the cached copy stale first, so `beforeLoad` refetches the new
    // Property's nav items instead of trusting an earlier visit.
    void queryClient.invalidateQueries({ queryKey: ['properties'] });
    void router.invalidate();
  }, [selectedPropertyId, queryClient, router]);

  const handleReloadProperties = async () => {
    // Remove the list and the selected Property from cache to force a fresh
    // fetch of both — the latter carries the nav items.
    queryClient.removeQueries({ queryKey: ['properties'] });
    // Fetch fresh data and update cache
    await queryClient.fetchQuery(propertiesQueryOptions());
    // Invalidate the router to trigger loader refetch with fresh data
    await router.invalidate();
  };

  const handlePropertyChange = async (propertyId: string) => {
    setOptimisticPropertyId(propertyId);
    try {
      await updateSelectedProperty(propertyId);
      // Property scope is derived server-side per request, so cached data
      // (e.g. Guest ABC entries) belongs to the previous property. Invalidate
      // all queries so property-scoped data refetches under the new scope.
      await queryClient.invalidateQueries();
    } catch {
      // Revert on failure — user.selected_property_id is unchanged
    }
    setOptimisticPropertyId(undefined);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/60 md:px-4 md:ps-3.5">
        <div className="flex h-12 items-center justify-between gap-4">
          {/* Left side */}
          {/* Mobile menu trigger */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="inline-flex md:hidden"
          >
            <TextAlignJustifyIcon className="size-4" />
          </Button>
          <div className="min-w-0">
            <PropertySelector
              properties={properties.index}
              value={
                optimisticPropertyId ?? user?.selected_property_id ?? undefined
              }
              onValueChange={handlePropertyChange}
              onReload={handleReloadProperties}
            />
          </div>
          {/* Right side */}
          <div className="flex items-center gap-2">
            <UserMenu />
          </div>
        </div>
      </header>
      <MobileMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
    </>
  );
}
