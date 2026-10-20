import { Combobox as ComboboxPrimitive } from '@base-ui/react';
import { Plural, Trans, useLingui } from '@lingui/react/macro';
import {
  BuildingIcon,
  ChevronDownIcon,
  LoaderCircleIcon,
  SearchIcon
} from 'lucide-react';
import * as React from 'react';
import type { Property } from 'shared/types/properties';
import { toast } from 'sonner';

import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetTitle,
  BottomSheetTrigger
} from '@/components/ui/bottom-sheet';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue
} from '@/components/ui/combobox';
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

  // On a phone the list is a bottom sheet in thumb reach. The search field
  // waits for a tap: focusing it on open would put the keyboard over the list.
  if (isMobile) {
    return (
      <BottomSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (open) onOpen?.();
        }}
      >
        <BottomSheetTrigger
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
        </BottomSheetTrigger>
        {/* A fixed height, so the sheet and its search field don't drop as
            the search narrows the list */}
        <BottomSheetContent className="h-[85dvh]">
          <BottomSheetTitle>
            <Trans>Switch property</Trans>
          </BottomSheetTitle>
          <Combobox
            inline
            open
            items={properties}
            value={selected}
            onValueChange={(property: Property | null) => {
              if (!property) return;
              setSheetOpen(false);
              void switchTo(property);
            }}
            itemToStringLabel={(property: Property) => property.name}
            isItemEqualToValue={(a: Property, b: Property) => a.id === b.id}
          >
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
              className="mx-4 h-11 rounded-lg border border-input px-3"
            />
            <ComboboxEmpty className="py-4 text-center text-sm text-muted-foreground">
              <Trans>No properties found</Trans>
            </ComboboxEmpty>
            <ComboboxList className="max-h-none min-h-0 flex-1 space-y-1 px-2 py-2">
              {(property: Property) => (
                <ComboboxItem
                  key={property.id}
                  value={property}
                  indicator="start"
                  className="h-11 rounded-md text-base"
                >
                  <span className="flex-1 truncate">{property.name}</span>
                  <StageBadge stage={property.stage} />
                </ComboboxItem>
              )}
            </ComboboxList>
            <ComboboxSeparator className="my-0" />
            <div className="shrink-0 px-4 py-3 text-xs text-muted-foreground">
              <PropertyCount loaded={properties.length} total={total} />
            </div>
          </Combobox>
        </BottomSheetContent>
      </BottomSheet>
    );
  }

  return (
    <Combobox
      items={properties}
      value={selected}
      onValueChange={(property: Property | null) => {
        if (property) void switchTo(property);
      }}
      onOpenChange={(open) => {
        if (open) onOpen?.();
      }}
      itemToStringLabel={(property: Property) => property.name}
      isItemEqualToValue={(a: Property, b: Property) => a.id === b.id}
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
          Seven and a half rows — a row being an item (h-9) plus the gap under
          it — so the cut-off one hints at more.
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
      </ComboboxContent>
    </Combobox>
  );
}

const triggerClassName =
  'focus-visible:outline-offset-0.5 flex max-w-full min-w-0 items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-foreground outline-none hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-solid data-popup-open:bg-accent pointer-coarse:h-11';

/** Reads the search result, so it has to render inside the Combobox. */
function PropertyCount({ loaded, total }: { loaded: number; total: number }) {
  const found = ComboboxPrimitive.useFilteredItems<Property>().length;

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
