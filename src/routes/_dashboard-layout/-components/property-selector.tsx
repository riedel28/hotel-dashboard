'use client';

import { Trans, useLingui } from '@lingui/react/macro';
import { ChevronsUpDownIcon, RefreshCwIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge, type BadgeProps } from '@/components/ui/badge';
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

function StageBadge({ stage, ...props }: StageBadgeProps) {
  return (
    <Badge
      variant={stageVariantMap[stage] ?? 'secondary'}
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
  },
  {
    id: 'f8a2b4c6-d8e0-4f2a-9b1c-3d5e7f9a1b2c',
    name: 'Grand Hotel Vienna',
    stage: 'production'
  },
  {
    id: 'e7d6c5b4-a3f2-1e0d-9c8b-7a6f5e4d3c2b',
    name: 'Seaside Resort Barcelona',
    stage: 'staging'
  },
  {
    id: 'b1a2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Mountain Lodge Switzerland',
    stage: 'demo'
  },
  {
    id: 'c2d3e4f5-a6b7-8901-cdef-234567890123',
    name: 'Urban Boutique Hotel Berlin',
    stage: 'template'
  },
  {
    id: 'd3e4f5a6-b7c8-9012-def3-456789012345',
    name: 'Historic Palace Hotel Prague',
    stage: 'production'
  }
];

const truncatePropertyName = (name: string, maxLength: number = 40) => {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

export default function PropertySelector() {
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<Property>(properties[0]!);
  const [loading, setLoading] = useState(false);
  const { t } = useLingui();

  function handleReloadProperties() {
    setLoading(true);
    toast.info(t`Reloading properties`);

    setTimeout(() => {
      setLoading(false);
      toast.info(t`Properties reloaded`);
    }, 2000);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-[300px] justify-between px-3 text-sm text-secondary-foreground outline-offset-0 focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20 data-[state=open]:bg-accent"
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value ? (
              properties.find(
                (property) =>
                  property.name.toLowerCase() === value.name.toLowerCase()
              )?.name
            ) : (
              <Trans>Select property</Trans>
            )}
          </span>
          <ChevronsUpDownIcon
            size={16}
            strokeWidth={2}
            className="shrink-0 text-muted-foreground/80"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
        align="start"
        side="bottom"
      >
        <Command>
          <CommandInput placeholder={t`Search for property`} />
          <CommandList className="w-[400px] max-w-[400px]">
            {!loading && (
              <CommandEmpty>
                <Trans>No properties found.</Trans>
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
                  properties.map((property) => {
                    const propertyName = truncatePropertyName(property.name);

                    return (
                      <CommandItem
                        key={property.id}
                        value={property.id}
                        onSelect={(currentValue) => {
                          const selectedProperty =
                            properties.find(
                              (property) => property.id === currentValue
                            ) ?? properties[0]!;

                          if (selectedProperty) {
                            setValue(selectedProperty);
                            setOpen(false);

                            toast.info(t`Switched to ${propertyName}`);
                          }
                        }}
                        className="h-[38px] gap-1"
                      >
                        <span className="w-[250px] truncate">
                          {propertyName}
                        </span>

                        <CommandShortcut className="text-[9px] font-semibold tracking-wide uppercase">
                          <StageBadge stage={property.stage} />
                        </CommandShortcut>
                      </CommandItem>
                    );
                  })
                )}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
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
                  '-ms-2 me-2 mr-1 size-3.5 opacity-60',
                  loading && 'animate-spin'
                )}
                aria-hidden="true"
              />
              <Trans>Reload</Trans>
            </Button>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
