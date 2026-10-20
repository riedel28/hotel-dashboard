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
import {
  Sheet,
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

  // Shared by the dropdown and the phone's sheet, so the two can't drift
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

  // Search, list and count. Rendered in one place at a time: the dropdown
  // from md up, the sheet below it, so `max-md:` sizes it for the sheet.
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
        className="max-md:mx-4 max-md:h-11 max-md:rounded-lg max-md:border max-md:px-3"
      />
      <ComboboxEmpty className="py-4 text-center text-sm text-muted-foreground">
        <Trans>No properties found</Trans>
      </ComboboxEmpty>
      {/*
        In the dropdown, seven and a half rows — a row being an item (h-9) plus
        the gap under it — so the cut-off one hints at more. In the sheet, all
        the room it has.
      */}
      <ComboboxList className="mb-0 max-h-[calc(--spacing(10)*7.5+--spacing(1))] scroll-fade-y space-y-1 p-1 max-md:max-h-none max-md:min-h-0 max-md:flex-1 max-md:px-2 max-md:py-2">
        {(property: Property) => (
          <ComboboxItem
            key={property.id}
            value={property}
            indicator="start"
            className="h-9 rounded-md max-md:h-11 max-md:text-base"
          >
            <span className="flex-1 truncate">{property.name}</span>
            <StageBadge stage={property.stage} />
          </ComboboxItem>
        )}
      </ComboboxList>
      <ComboboxSeparator className="my-0" />
      <div className="shrink-0 px-3 py-2 text-xs text-muted-foreground max-md:px-4 max-md:py-3">
        <PropertyCount loaded={properties.length} total={total} />
      </div>
    </>
  );

  // On a phone the list is a bottom sheet in thumb reach. The search field
  // waits for a tap: focusing it on open would put the keyboard over the list.
  if (isMobile) {
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
          <SheetTitle className="px-4 pt-1 pb-2 text-base">
            <Trans>Switch property</Trans>
          </SheetTitle>
          <Combobox {...comboboxProps} inline open>
            {listBody}
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
