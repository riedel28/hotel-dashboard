import { useLingui } from '@lingui/react/macro';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { TextAlignJustifyIcon } from 'lucide-react';
import * as React from 'react';

import { selectablePropertiesQueryOptions } from '@/api/properties';
import { useAuth } from '@/auth';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useCurrentView } from '@/hooks/use-current-view';
import PropertySelector from '@/routes/_dashboard-layout/-components/property-selector';
import UserMenu from '@/routes/_dashboard-layout/-components/user-menu';

/** The selector wired to its data and to the signed-in user's selection. */
function HeaderPropertySelector() {
  // The layout's loader has already fetched the list for the user view.
  const { data: properties, refetch } = useSuspenseQuery(
    selectablePropertiesQueryOptions()
  );
  const { user, updateSelectedProperty } = useAuth();
  const [optimisticPropertyId, setOptimisticPropertyId] = React.useState<
    string | undefined
  >();

  const handlePropertyChange = async (propertyId: string) => {
    setOptimisticPropertyId(propertyId);
    try {
      await updateSelectedProperty(propertyId);
    } finally {
      // On failure this reverts the selector: user.selected_property_id is
      // unchanged. The error goes on to the selector, which reports it.
      setOptimisticPropertyId(undefined);
    }
  };

  return (
    <PropertySelector
      properties={properties.index}
      total={properties.total}
      value={optimisticPropertyId ?? user?.selected_property_id ?? undefined}
      onValueChange={handlePropertyChange}
      onOpen={() => void refetch()}
    />
  );
}

/** The header's bar, shared with the layout's loading skeleton so the two line up. */
export function HeaderFrame({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:ps-3.5">
      {/* 56px on touch screens, to fit 44px targets */}
      <div className="flex h-12 items-center justify-between gap-4 pointer-coarse:h-14">
        {children}
      </div>
    </header>
  );
}

export default function Header() {
  const view = useCurrentView();
  const { t } = useLingui();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

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

  return (
    <HeaderFrame>
      {/* Left side */}
      {/* Mobile menu trigger */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        aria-label={t`Open menu`}
        // Pulled out by the icon's inset, so the icon lines up with the
        // page's 16px gutter rather than the button's edge
        className="-ml-2 inline-flex md:hidden pointer-coarse:-ml-3.5 pointer-coarse:size-11"
      >
        <TextAlignJustifyIcon className="size-4" />
      </Button>
      <div className="min-w-0">
        {/*
              The admin area is not about any one Property. Coming from there,
              the list may not be loaded yet — the selector appears once it is.
            */}
        {view === 'user' && (
          <React.Suspense fallback={null}>
            <HeaderPropertySelector />
          </React.Suspense>
        )}
      </div>
      {/* Right side */}
      <div className="flex items-center gap-2">
        <UserMenu />
      </div>
    </HeaderFrame>
  );
}
