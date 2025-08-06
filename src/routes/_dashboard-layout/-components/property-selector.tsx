'use client';

import { useState } from 'react';

import { ChevronsUpDownIcon, RefreshCwIcon } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { toast } from 'sonner';

import { Badge, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';

export interface Property {
  id: string;
  name: string;
  stage: 'demo' | 'production' | 'staging' | 'template';
}

interface StageBadgeProps extends BadgeProps {
  stage: keyof typeof stageVariantMap;
}

const stageVariantMap = {
  demo: 'info',
  production: 'success',
  staging: 'primary',
  template: 'warning'
} as const;

const getStageMessage = (stage: keyof typeof stageVariantMap) => {
  switch (stage) {
    case 'demo':
      return (
        <FormattedMessage id="property.stage.demo" defaultMessage="Demo" />
      );
    case 'production':
      return (
        <FormattedMessage
          id="property.stage.production"
          defaultMessage="Production"
        />
      );
    case 'staging':
      return (
        <FormattedMessage
          id="property.stage.staging"
          defaultMessage="Staging"
        />
      );
    case 'template':
      return (
        <FormattedMessage
          id="property.stage.template"
          defaultMessage="Template"
        />
      );
    default:
      return stage;
  }
};

function StageBadge({ stage, ...props }: StageBadgeProps) {
  return (
    <Badge
      variant={stageVariantMap[stage]}
      appearance="outline"
      size="sm"
      className="capitalize"
      {...props}
    >
      {getStageMessage(stage)}
    </Badge>
  );
}

export const properties: Property[] = [
  {
    id: '9cb0e66a-9937-465d-a188-2c4c4ae2401f',
    name: 'Development (2)',
    stage: 'demo'
  },
  {
    id: '61eb0e32-2391-4cd3-adc3-66efe09bc0b7',
    name: 'Staging',
    stage: 'staging'
  },
  {
    id: 'a4e1fa51-f4ce-4e45-892c-224030a00bdd',
    name: 'Development 13, Adyen',
    stage: 'template'
  },
  {
    id: 'cc198b13-4933-43aa-977e-dcd95fa30770',
    name: 'Kullturboden-Hallstadt',
    stage: 'production'
  },
  {
    id: 'cc198b13-4933-43aa-977e-dcd95fa30771',
    name: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae, reiciendis dolor! Tempora, animi debitis itaque nihil quidem laborum consectetur dolorem.',
    stage: 'production'
  }
];

const truncatePropertyName = (name: string, maxLength: number = 40) => {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

export default function PropertySelector() {
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<Property>(() => properties[0]);
  const [loading, setLoading] = useState(false);
  const intl = useIntl();

  function handleReloadProperties() {
    setLoading(true);
    toast.info(
      intl.formatMessage({
        id: 'property.toast.reloading',
        defaultMessage: 'Reloading properties'
      })
    );

    setTimeout(() => {
      setLoading(false);
      toast.info(
        intl.formatMessage({
          id: 'property.toast.reloaded',
          defaultMessage: 'Properties reloaded'
        })
      );
    }, 2000);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="text-secondary-foreground data-[state=open]:bg-accent focus-visible:border-ring focus-visible:outline-ring/20 w-full max-w-[300px] justify-between px-3 text-sm outline-offset-0 focus-visible:outline-[3px]"
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value
              ? properties.find(
                  (property) =>
                    property.name.toLowerCase() === value.name.toLowerCase()
                )?.name
              : intl.formatMessage({
                  id: 'placeholders.selectProperty',
                  defaultMessage: 'Select property'
                })}
          </span>
          <ChevronsUpDownIcon
            size={16}
            strokeWidth={2}
            className="text-muted-foreground/80 shrink-0"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
        align="start"
        side="bottom"
      >
        <Command>
          <CommandInput
            placeholder={intl.formatMessage({
              id: 'placeholders.searchProperty',
              defaultMessage: 'Search for property'
            })}
          />
          <CommandList className="w-[400px] max-w-[400px]">
            {!loading && (
              <CommandEmpty>
                <FormattedMessage
                  id="properties.notFound"
                  defaultMessage="No properties found."
                />
              </CommandEmpty>
            )}
            <CommandGroup>
              <ScrollArea>
                {loading ? (
                  <div className="space-y-1">
                    <Skeleton className="h-[34px] w-full" />
                    <Skeleton className="h-[34px] w-full" />
                    <Skeleton className="h-[34px] w-full" />
                    <Skeleton className="h-[34px] w-full" />
                  </div>
                ) : (
                  properties.map((property) => (
                    <CommandItem
                      key={property.id}
                      value={property.id}
                      onSelect={(currentValue) => {
                        const selectedProperty =
                          properties.find(
                            (property) => property.id === currentValue
                          ) ?? properties[0];

                        setValue(selectedProperty);
                        setOpen(false);

                        toast.info(
                          intl.formatMessage(
                            {
                              id: 'property.toast.changed.description',
                              defaultMessage: 'Switched to "{propertyName}"'
                            },
                            {
                              propertyName: truncatePropertyName(property.name)
                            }
                          )
                        );
                      }}
                      className="h-[38px] gap-1"
                    >
                      <span className="w-[250px] truncate">
                        {property.name}
                      </span>

                      <CommandShortcut className="text-[9px] font-semibold tracking-wide uppercase">
                        <StageBadge stage={property.stage} />
                      </CommandShortcut>
                    </CommandItem>
                  ))
                )}
              </ScrollArea>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-full text-sm font-normal"
                onClick={handleReloadProperties}
                disabled={loading}
              >
                <RefreshCwIcon
                  className={cn(
                    '-ms-2 me-2 mr-0 size-3.5 opacity-60',
                    loading && 'animate-spin'
                  )}
                  aria-hidden="true"
                />
                <FormattedMessage id="actions.reload" defaultMessage="Reload" />
              </Button>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
