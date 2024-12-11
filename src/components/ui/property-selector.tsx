'use client';

import * as React from 'react';

import { PopoverProps } from '@radix-ui/react-popover';
import { AlertCircle, ChevronsUpDown, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
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

export function Stage({
  stage,
  className
}: {
  stage: Property['stage'];
  className?: string;
}) {
  return (
    <Badge
      className={cn(
        'rounded-md border-0 border-gray-200 bg-gray-200 px-2 py-0.5 text-[11px] font-medium capitalize tracking-wide text-gray-700 group-hover:border-gray-200 group-hover:bg-gray-200',
        'dark:border-gray-800  dark:bg-gray-800 dark:text-gray-400 dark:group-hover:border-gray-800 dark:group-hover:bg-gray-900',
        stage === 'demo' &&
          'border-amber-200 bg-amber-100 text-amber-700 group-hover:border-amber-200 group-hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900  dark:text-amber-400  dark:group-hover:border-amber-800 dark:group-hover:bg-amber-900',
        stage === 'staging' &&
          'border-sky-200 bg-sky-100  text-sky-700 group-hover:border-sky-200 group-hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-900 dark:text-sky-400 dark:group-hover:border-sky-800 dark:group-hover:bg-sky-900',
        stage === 'production' &&
          'border-emerald-200 bg-emerald-100 text-emerald-700 group-hover:border-emerald-200 group-hover:bg-emerald-100  dark:border-emerald-800 dark:bg-emerald-900 dark:text-emerald-400 dark:group-hover:border-emerald-800 dark:group-hover:bg-emerald-900',
        className
      )}
      variant="secondary"
    >
      {stage}
    </Badge>
  );
}

interface PropertySelectorProps extends PopoverProps {
  properties: Property[];
}

export function PropertySelector({
  properties,
  ...props
}: PropertySelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = React.useState<Property>();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const propertyId = localStorage.getItem('property');

    if (propertyId) {
      setSelectedProperty(properties.find((p) => p.id === propertyId));
    }
  }, [properties]);

  const handleSelectPropery = (property: Property) => {
    setSelectedProperty(property);
    localStorage.setItem('property', property.id);

    toast.info(
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="font-bold">Property changed</span>
        </div>
        <div>
          You&apos;ve changed the property to{' '}
          <span className="font-medium">{property.name}</span>
        </div>
      </div>
    );

    setOpen(false);
  };

  const handleReloadProperties = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-label="Select a property"
          aria-expanded={open}
          className="flex-1 justify-between hover:bg-[#283962] hover:text-white focus-visible:ring-offset-0  data-[state=open]:bg-[#283962] md:max-w-[200px] lg:max-w-[250px]"
        >
          {selectedProperty ? (
            <span className="truncate">{selectedProperty.name}</span>
          ) : (
            'Select a property'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <Command>
          <CommandInput placeholder="Search properties..." />
          {!loading && <CommandEmpty>No properties found</CommandEmpty>}
          <CommandGroup>
            <ScrollArea className="w-full">
              {loading ? (
                <div className="space-y-1">
                  <Skeleton className="h-[39px] w-full" />
                  <Skeleton className="h-[39px] w-full" />
                  <Skeleton className="h-[39px] w-full" />
                  <Skeleton className="h-[39px] w-full" />
                </div>
              ) : (
                properties.map((property) => (
                  <CommandItem
                    key={property.id}
                    onSelect={() => handleSelectPropery(property)}
                    className="group gap-1 py-2.5"
                  >
                    <span className="w-[200px] truncate">{property.name}</span>
                    <CommandShortcut>
                      <Stage stage={property.stage} />
                    </CommandShortcut>
                  </CommandItem>
                ))
              )}
            </ScrollArea>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup className="pt-0">
            <div className="relative flex cursor-default select-none items-center rounded-sm py-1 pb-0 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <Button
                variant="ghost"
                size="xs"
                className="ml-auto w-full font-medium text-muted-foreground"
                onClick={handleReloadProperties}
                disabled={loading}
              >
                <RotateCw
                  size={16}
                  className={cn('mr-2', loading && 'animate-spin ')}
                />
                Refresh
              </Button>
            </div>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
