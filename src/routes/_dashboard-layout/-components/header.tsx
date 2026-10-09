import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { TextAlignJustifyIcon } from 'lucide-react';
import * as React from 'react';

import { propertiesQueryOptions } from '@/api/properties';
import { useAuth } from '@/auth';
import { Button } from '@/components/ui/button';
import { useCurrentView } from '@/hooks/use-current-view';
import { MobileMenu } from '@/routes/_dashboard-layout/-components/mobile-menu';
import PropertySelector from '@/routes/_dashboard-layout/-components/property-selector';
import UserMenu from '@/routes/_dashboard-layout/-components/user-menu';

export default function Header() {
  // The layout's loader has already fetched the list; reading the query rather
  // than the loader data keeps the selector live when it refetches on open.
  const { data: properties, refetch: refetchProperties } = useSuspenseQuery(
    propertiesQueryOptions()
  );
  const view = useCurrentView();
  const { user, updateSelectedProperty } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [optimisticPropertyId, setOptimisticPropertyId] = React.useState<
    string | undefined
  >();

  // Everything that follows a change of selected Property, in one place. An
  // effect rather than the change handler, because the router context only
  // holds the new selection once it has rendered.
  const selectedPropertyId = user?.selected_property_id;
  const lastPropertyId = React.useRef(selectedPropertyId);
  React.useEffect(() => {
    if (lastPropertyId.current === selectedPropertyId) return;
    lastPropertyId.current = selectedPropertyId;
    // Property scope is derived server-side per request, so every cached
    // query (Guest ABC entries, the Property's nav items, …) belongs to the
    // previous Property. Marking them stale is synchronous, so the layout's
    // `beforeLoad` below already refetches.
    void queryClient.invalidateQueries();
    void router.invalidate();
  }, [selectedPropertyId, queryClient, router]);

  const handlePropertyChange = async (propertyId: string) => {
    setOptimisticPropertyId(propertyId);
    try {
      await updateSelectedProperty(propertyId);
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
            {/* The admin area is not about any one Property. */}
            {view === 'user' && (
              <PropertySelector
                properties={properties.index}
                value={
                  optimisticPropertyId ??
                  user?.selected_property_id ??
                  undefined
                }
                onValueChange={handlePropertyChange}
                onOpen={() => void refetchProperties()}
              />
            )}
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
