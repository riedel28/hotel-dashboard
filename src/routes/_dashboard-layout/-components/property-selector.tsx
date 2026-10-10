import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { SearchIcon } from 'lucide-react';
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
import { StageBadge } from '@/components/ui/stage-badge';

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

  const switchTo = async (property: Property) => {
    try {
      await onValueChange(property.id);
      toast.info(t`Switched to ${property.name}`);
    } catch {
      toast.error(t`Failed to switch to ${property.name}`);
    }
  };

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
        className="flex max-w-full min-w-0 items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-foreground hover:bg-accent data-popup-open:bg-accent"
        aria-label={t`Select property`}
      >
        <ComboboxValue>
          <span className="max-w-[40ch] truncate text-sm">
            {selected?.name ?? (
              <span className="text-muted-foreground">
                <Trans>Select property</Trans>
              </span>
            )}
          </span>
        </ComboboxValue>
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
          {total > properties.length ? (
            <Trans>
              First {properties.length} of {total} properties
            </Trans>
          ) : (
            <Plural value={total} one="# property" other="# properties" />
          )}
        </div>
      </ComboboxContent>
    </Combobox>
  );
}

export default PropertySelector;
