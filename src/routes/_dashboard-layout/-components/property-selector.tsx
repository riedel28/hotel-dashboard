import { Trans, useLingui } from '@lingui/react/macro';
import { RefreshCwIcon, SearchIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Property, PropertyStage } from 'shared/types/properties';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

interface PropertySelectorProps {
  properties?: Property[];
  value?: string;
  onValueChange?: (propertyId: string) => void;
  onReload: () => Promise<void>;
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

function LoadingSkeleton() {
  return (
    <div className="space-y-1 p-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-9 w-full rounded-md bg-muted"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function renderPropertyItem(item: PropertyItem) {
  return (
    <ComboboxItem
      key={item.value}
      value={item.value}
      showIndicator={false}
      className="group flex h-9 items-center justify-between rounded-md px-2 py-1.5"
    >
      <span className="truncate">{item.label}</span>
      <StageBadge stage={item.stage} />
    </ComboboxItem>
  );
}

function PropertySelector({
  properties = [],
  value: controlledValue,
  onValueChange,
  onReload
}: PropertySelectorProps) {
  const [internalValue, setInternalValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  const handleReloadProperties = async () => {
    setLoading(true);

    try {
      await onReload();
      toast.info(t`Properties updated`);
    } catch (error) {
      console.error('Failed to reload properties:', error);
      toast.error(t`Failed to reload properties`);
    } finally {
      setLoading(false);
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
    >
      <ComboboxTrigger
        className="flex max-w-full min-w-0 items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-foreground hover:bg-accent data-popup-open:bg-accent"
        aria-label={t`Select property`}
      >
        <ComboboxValue>
          <span className="truncate text-sm">{renderTriggerContent()}</span>
        </ComboboxValue>
      </ComboboxTrigger>
      <ComboboxContent className="w-90">
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
        {loading && (
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {t`Loading properties`}
          </div>
        )}
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <ComboboxEmpty className="py-4 text-center text-sm text-muted-foreground">
              <Trans>No properties found</Trans>
            </ComboboxEmpty>
            <ComboboxList className="mb-0 space-y-1 p-1">
              {(item) => renderPropertyItem(item)}
            </ComboboxList>
          </>
        )}
        <ComboboxSeparator className="my-0" />
        <div className="p-1">
          <Button
            variant="ghost"
            className="h-8 w-full text-sm font-normal text-muted-foreground"
            aria-label={t`Reload properties`}
            onClick={handleReloadProperties}
            disabled={loading}
          >
            <RefreshCwIcon
              className={cn('-ms-2 me-1 size-3.5', loading && 'animate-spin')}
            />
            <Trans>Reload</Trans>
          </Button>
        </div>
      </ComboboxContent>
    </Combobox>
  );
}

export default PropertySelector;
