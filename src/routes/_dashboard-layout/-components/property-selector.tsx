import { Trans, useLingui } from '@lingui/react/macro';
import { RefreshCwIcon, SearchIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Property, PropertyStage } from 'shared/types/properties';
import { toast } from 'sonner';
import { Badge, type BadgeProps } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';

const stageVariantMap = {
  demo: 'info',
  production: 'success',
  staging: 'default',
  template: 'warning'
} as const;

interface StageBadgeProps extends BadgeProps {
  stage: PropertyStage;
}

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

const getStageMessage = (stage: PropertyStage) => {
  switch (stage) {
    case 'demo':
      return <Trans>Demo</Trans>;
    case 'production':
      return <Trans>Production</Trans>;
    case 'staging':
      return <Trans>Staging</Trans>;
    case 'template':
      return <Trans>Template</Trans>;
    default:
      return stage;
  }
};

function StageBadge({ stage, className, ...props }: StageBadgeProps) {
  return (
    <Badge
      variant={stageVariantMap[stage] ?? 'secondary'}
      size="sm"
      className={cn(
        'shrink-0 rounded-md border border-foreground/10 px-1.5 py-0.5 text-[11px] capitalize',
        className
      )}
      {...props}
    >
      {getStageMessage(stage)}
    </Badge>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-1 p-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="bg-muted h-9 w-full rounded-md"
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
        className="min-w-0 max-w-xs flex items-center justify-between hover:bg-accent px-3 py-2 rounded-md text-foreground gap-2 data-popup-open:bg-accent sm:max-w-sm md:max-w-lg"
        aria-label={t`Select property`}
      >
        <ComboboxValue>
          <span className="truncate text-sm">{renderTriggerContent()}</span>
        </ComboboxValue>
      </ComboboxTrigger>
      <ComboboxContent className="w-sm">
        <ComboboxInput
          variant="popup"
          placeholder={t`Search property`}
          iconLeft={
            <SearchIcon
              className="h-4 w-4 shrink-0 opacity-50"
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
            <ComboboxEmpty className="py-8 text-center text-sm text-muted-foreground">
              <Trans>No properties found.</Trans>
            </ComboboxEmpty>
            <ComboboxList className="mb-0 space-y-1">
              {(item) => renderPropertyItem(item)}
            </ComboboxList>
          </>
        )}
        <ComboboxSeparator className="my-0" />
        <div className="p-1">
          <Button
            variant="ghost"
            className="w-full h-8 text-sm font-normal text-muted-foreground"
            aria-label={t`Reload properties`}
            onClick={handleReloadProperties}
            disabled={loading}
          >
            <RefreshCwIcon
              className={cn('-ms-2 me-2 size-3.5', loading && 'animate-spin')}
            />
            <Trans>Reload</Trans>
          </Button>
        </div>
      </ComboboxContent>
    </Combobox>
  );
}

export default PropertySelector;
