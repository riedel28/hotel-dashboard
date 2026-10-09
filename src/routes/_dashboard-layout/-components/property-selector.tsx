import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { CheckIcon, SearchIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Property, PropertyStage } from 'shared/types/properties';
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
  properties?: Property[];
  value?: string;
  onValueChange?: (propertyId: string) => void;
  /** Called each time the list opens — the moment to refresh it. */
  onOpen?: () => void;
}

interface PropertyItem {
  value: string;
  label: string;
  stage: PropertyStage;
}

const truncatePropertyName = (name: string, maxLength = 40): string => {
  if (name.length <= maxLength) return name;
  return `${name.substring(0, maxLength)}...`;
};

function PropertySelector({
  properties = [],
  value: controlledValue,
  onValueChange,
  onOpen
}: PropertySelectorProps) {
  const [internalValue, setInternalValue] = useState<string | null>(null);
  const { t } = useLingui();

  const selectedPropertyId = controlledValue ?? internalValue;

  const propertyMap = useMemo(
    () => new Map(properties.map((property) => [property.id, property])),
    [properties]
  );

  const selectedProperty = useMemo(
    () => (selectedPropertyId ? propertyMap.get(selectedPropertyId) : null),
    [selectedPropertyId, propertyMap]
  );

  const items = useMemo<PropertyItem[]>(
    () =>
      properties.map((property) => ({
        value: property.id,
        label: property.name,
        stage: property.stage
      })),
    [properties]
  );

  const handleValueChange = (propertyId: string) => {
    if (onValueChange) {
      onValueChange(propertyId);
    } else {
      setInternalValue(propertyId);
    }
  };

  const handlePropertySelect = (nextValue: string | null) => {
    if (!nextValue) return;

    handleValueChange(nextValue);
    const property = propertyMap.get(nextValue);
    if (property) {
      toast.info(t`Switched to ${truncatePropertyName(property.name)}`);
    }
  };

  const renderTriggerContent = () => {
    if (selectedProperty) {
      return truncatePropertyName(selectedProperty.name);
    }
    return (
      <span className="text-muted-foreground">
        <Trans>Select property</Trans>
      </span>
    );
  };

  return (
    <Combobox
      items={items}
      value={selectedPropertyId ?? null}
      onValueChange={handlePropertySelect}
      onOpenChange={(open) => {
        if (open) onOpen?.();
      }}
    >
      <ComboboxTrigger
        className="flex max-w-full min-w-0 items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-foreground hover:bg-accent data-popup-open:bg-accent"
        aria-label={t`Select property`}
      >
        <ComboboxValue>
          <span className="truncate text-sm">{renderTriggerContent()}</span>
        </ComboboxValue>
      </ComboboxTrigger>
      {/*
        The popup caps the height and the list fills what is left of it: room
        for seven and a half Properties, so the cut-off row hints at more.
      */}
      <ComboboxContent className="max-h-[min(--spacing(94),var(--available-height))] w-96">
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
        <ComboboxList className="mb-0 max-h-none min-h-0 flex-1 scroll-fade-y space-y-1 p-1">
          {(item: PropertyItem) => (
            <ComboboxItem
              key={item.value}
              value={item.value}
              showIndicator={false}
              className="group flex h-9 items-center rounded-md px-2 py-1.5"
            >
              {/* A fixed slot, so names line up whether or not checked. */}
              <span className="flex size-4 shrink-0 items-center justify-center">
                {item.value === selectedPropertyId && (
                  <CheckIcon className="size-4" aria-hidden="true" />
                )}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              <StageBadge stage={item.stage} />
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxSeparator className="my-0" />
        <div className="shrink-0 px-3 py-2 text-xs text-muted-foreground">
          <Plural
            value={properties.length}
            one="# property"
            other="# properties"
          />
        </div>
      </ComboboxContent>
    </Combobox>
  );
}

export default PropertySelector;
