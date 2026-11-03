import { Combobox as ComboboxPrimitive } from '@base-ui/react';
import { Plural, Trans, useLingui } from '@lingui/react/macro';
import {
  BuildingIcon,
  ChevronDownIcon,
  LoaderCircleIcon,
  SearchIcon,
  XIcon
} from 'lucide-react';
import * as React from 'react';
import type { Property } from 'shared/types/properties';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue
} from '@/components/ui/combobox';
import { CountryFlag } from '@/components/ui/country-flag';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { StageBadge } from '@/components/ui/stage-badge';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';
import { useIsMobile } from '@/hooks/use-mobile';

interface PropertySelectorProps {
  properties: Property[];
  /** How many Properties exist — more than `properties` once the list is capped. */
  total: number;
  /** Id of the selected Property. */
  value?: string;
  /** Rejects when the switch fails; the selector reports either outcome. */
  onValueChange: (propertyId: string) => Promise<unknown>;
  /** Called each time the list opens — the moment to refresh it. */
  onOpen?: () => void;
}

function PropertySelector({
  properties,
  total,
  value,
  onValueChange,
  onOpen
}: PropertySelectorProps) {
  const { t } = useLingui();
  const selected = properties.find((property) => property.id === value) ?? null;
  const [switching, setSwitching] = React.useState(false);
  // A quick switch is over before a spinner could register as one
  const showSpinner = useDelayedFlag(switching, 300);

  const switchTo = async (property: Property) => {
    setSwitching(true);
    try {
      await onValueChange(property.id);
      toast.info(t`Switched to ${property.name}`);
    } catch {
      toast.error(t`Failed to switch to ${property.name}`);
    } finally {
      setSwitching(false);
    }
  };

  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const triggerLabel = selected
    ? t`${selected.name}, property`
    : t`Select property`;
  const spinner = showSpinner ? (
    <LoaderCircleIcon
      className="size-4 shrink-0 animate-spin text-muted-foreground"
      aria-hidden="true"
    />
  ) : undefined;
  const buildingIcon = (
    <BuildingIcon
      className="size-4 shrink-0 text-muted-foreground"
      aria-hidden="true"
    />
  );
  const name = (
    <span className="max-w-[40ch] truncate text-sm">
      {selected?.name ?? (
        <span className="text-muted-foreground">
          <Trans>Select property</Trans>
        </span>
      )}
    </span>
  );

  // Shared by the dropdown and the phone's sheet, so the two can't drift (the
  // sheet groups the items)
  const comboboxProps = {
    items: properties,
    value: selected,
    onValueChange: (property: Property | null) => {
      if (!property) return;
      setSheetOpen(false);
      void switchTo(property);
    },
    itemToStringLabel: (property: Property) => property.name,
    isItemEqualToValue: (a: Property, b: Property) => a.id === b.id
  };

  // The dropdown's search, list and count, from md up
  const listBody = (
    <>
      <ComboboxInput
        variant="popup"
        placeholder={t`Search property`}
        iconLeft={
          <SearchIcon
            className="size-4 shrink-0 opacity-50"
            aria-hidden="true"
          />
        }
        showTrigger={false}
      />
      <ComboboxEmpty className="py-4 text-center text-sm text-muted-foreground">
        <Trans>No properties found</Trans>
      </ComboboxEmpty>
      {/*
        In the dropdown, seven and a half rows — a row being an item (h-9) plus
        the gap under it — so the cut-off one hints at more.
      */}
      <ComboboxList className="mb-0 max-h-[calc(--spacing(10)*7.5+--spacing(1))] scroll-fade-y space-y-1 p-1">
        {(property: Property) => (
          <ComboboxItem
            key={property.id}
            value={property}
            indicator="start"
            className="h-9 rounded-md"
          >
            <span className="flex-1 truncate">{property.name}</span>
            <StageBadge stage={property.stage} />
          </ComboboxItem>
        )}
      </ComboboxList>
      <ComboboxSeparator className="my-0" />
      <div className="shrink-0 px-3 py-2 text-xs text-muted-foreground">
        <PropertyCount loaded={properties.length} total={total} />
      </div>
    </>
  );

  // On a phone the list is a bottom sheet in thumb reach, laid out like the
  // phone's own settings lists: the current property on its own on top, then
  // the others by name. The search field waits for a tap: focusing it on open
  // would put the keyboard over the list.
  if (isMobile) {
    const groups: PropertyGroup[] = [
      ...(selected
        ? [{ id: 'current', label: t`Current`, items: [selected] }]
        : []),
      {
        id: 'all',
        label: t`All properties`,
        items: properties
          .filter((property) => property !== selected)
          .toSorted((a, b) => a.name.localeCompare(b.name))
      }
    ];

    return (
      <Sheet
        side="bottom"
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (open) onOpen?.();
        }}
      >
        <SheetTrigger
          className={triggerClassName}
          aria-label={triggerLabel}
          aria-busy={switching}
        >
          {buildingIcon}
          {name}
          {spinner ?? (
            <ChevronDownIcon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </SheetTrigger>
        {/* A fixed height, so the sheet and its search field don't drop as
            the search narrows the list */}
        <SheetContent showCloseButton={false} className="h-[85dvh]">
          <div className="flex items-center justify-between gap-2 py-1 pr-2 pl-4">
            <SheetTitle className="text-lg">
              <Trans>Switch property</Trans>
            </SheetTitle>
            <SheetClose
              render={
                <Button variant="ghost" size="icon" className="size-11" />
              }
              aria-label={t`Close`}
            >
              <XIcon className="size-5" />
            </SheetClose>
          </div>
          <Combobox {...comboboxProps} items={groups} inline open>
            <ComboboxInput
              variant="popup"
              placeholder={t`Search property`}
              iconLeft={
                <SearchIcon
                  className="size-4 shrink-0 opacity-50"
                  aria-hidden="true"
                />
              }
              showTrigger={false}
              className="mx-4 h-11 rounded-lg border px-3"
            />
            {/* No popup here to reveal it when empty: it shows by itself,
                and collapses while it has nothing to say */}
            <ComboboxEmpty className="flex py-8 text-center text-sm text-muted-foreground empty:hidden">
              <Trans>No properties found</Trans>
            </ComboboxEmpty>
            <ComboboxList className="max-h-none min-h-0 flex-1 p-0 px-4 pb-4">
              {(group: PropertyGroup) => (
                <ComboboxGroup
                  key={group.id}
                  items={group.items}
                  className="pt-5"
                >
                  <ComboboxLabel className="px-1 pt-0 pb-2 text-sm font-medium">
                    {group.label}
                  </ComboboxLabel>
                  <div className="divide-y overflow-hidden rounded-xl border bg-card">
                    <ComboboxCollection>
                      {(property: Property) => (
                        <MobilePropertyItem
                          key={property.id}
                          property={property}
                        />
                      )}
                    </ComboboxCollection>
                  </div>
                </ComboboxGroup>
              )}
            </ComboboxList>
            <MobilePropertyCount loaded={properties.length} total={total} />
          </Combobox>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Combobox
      {...comboboxProps}
      onOpenChange={(open) => {
        if (open) onOpen?.();
      }}
    >
      <ComboboxTrigger
        className={triggerClassName}
        // Starts with the visible text, as WCAG 2.5.3 asks
        aria-label={triggerLabel}
        aria-busy={switching}
        icon={spinner}
      >
        {buildingIcon}
        <ComboboxValue>{name}</ComboboxValue>
      </ComboboxTrigger>
      <ComboboxContent className="max-h-(--available-height) w-96">
        {listBody}
      </ComboboxContent>
    </Combobox>
  );
}

const triggerClassName =
  'focus-visible:outline-offset-0.5 flex max-w-full min-w-0 items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-foreground outline-none hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-solid data-popup-open:bg-accent pointer-coarse:h-11';

/** The phone sheet's sections: the current property, then all the others. */
interface PropertyGroup {
  id: string;
  label: string;
  items: Property[];
}

/** A property in the phone sheet: its name over where it is and its stage. */
function MobilePropertyItem({ property }: { property: Property }) {
  return (
    <ComboboxItem
      value={property}
      // The check mark in line with the row's padding
      className="min-h-14 rounded-none py-2.5 pr-11 pl-4 text-base data-highlighted:bg-muted data-highlighted:text-foreground [&>span:last-child]:right-4"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate">{property.name}</span>
        <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
          <CountryFlag code={property.country_code} className="size-4" />
          {property.city && <span className="truncate">{property.city}</span>}
          <StageBadge stage={property.stage} />
        </span>
      </span>
    </ComboboxItem>
  );
}

/** The phone sheet's count: only when it says something, a search narrowing
 *  the list or a list cut short. */
function MobilePropertyCount({
  loaded,
  total
}: {
  loaded: number;
  total: number;
}) {
  const filtered = ComboboxPrimitive.useFilteredItems<
    Property | PropertyGroup
  >();
  // Grouped, the filtered items are the groups with what's left in each
  const found = filtered.reduce(
    (count, item) => count + ('items' in item ? item.items.length : 1),
    0
  );

  if (found === loaded && total <= loaded) return null;

  return (
    <div className="shrink-0 border-t px-4 py-3 text-xs text-muted-foreground">
      <PropertyCountText found={found} loaded={loaded} total={total} />
    </div>
  );
}

/** Reads the search result, so it has to render inside the Combobox. */
function PropertyCount({ loaded, total }: { loaded: number; total: number }) {
  const found = ComboboxPrimitive.useFilteredItems<Property>().length;

  return <PropertyCountText found={found} loaded={loaded} total={total} />;
}

/** How many properties the list shows, out of how many. */
function PropertyCountText({
  found,
  loaded,
  total
}: {
  found: number;
  loaded: number;
  total: number;
}) {
  if (found === 0)
    return <Plural value={0} one="# property" other="# properties" />;
  if (found < loaded)
    return (
      <Trans>
        {found} of {loaded} properties
      </Trans>
    );
  if (total > loaded)
    return (
      <Trans>
        First {loaded} of {total} properties
      </Trans>
    );
  return <Plural value={total} one="# property" other="# properties" />;
}

export default PropertySelector;
