'use client';

import { useState } from 'react';

import { ChevronsUpDownIcon, RefreshCwIcon } from 'lucide-react';

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

export default function PropertySelector() {
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<Property>(() => properties[0]);
  const [loading, setLoading] = useState(false);

  function handleReloadProperties() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="bg-background hover:bg-background focus-visible:border-ring focus-visible:outline-ring/20 w-full justify-between px-3 font-normal outline-offset-0 focus-visible:outline-[3px]"
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value
              ? properties.find(
                  (property) =>
                    property.name.toLowerCase() === value.name.toLowerCase()
                )?.name
              : 'Select property'}
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
        side="right"
      >
        <Command>
          <CommandInput placeholder="Search for property" />
          <CommandList className="w-[320px]">
            {!loading && <CommandEmpty>No properties found.</CommandEmpty>}
            <CommandGroup>
              <ScrollArea>
                {loading ? (
                  <div className="space-y-1">
                    <Skeleton className="h-[36px] w-full" />
                    <Skeleton className="h-[36px] w-full" />
                    <Skeleton className="h-[36px] w-full" />
                    <Skeleton className="h-[36px] w-full" />
                  </div>
                ) : (
                  properties.map((property) => (
                    <CommandItem
                      key={property.id}
                      value={property.id}
                      onSelect={(currentValue) => {
                        setValue(
                          properties.find(
                            (property) => property.id === currentValue
                          ) ?? properties[0]
                        );
                        setOpen(false);
                      }}
                      className="h-9 gap-1"
                    >
                      <span className="w-[200px] truncate">
                        {property.name}
                      </span>

                      <CommandShortcut className="text-[9px] font-semibold tracking-wide uppercase">
                        {property.stage}
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
                className="w-full font-normal"
                onClick={handleReloadProperties}
                disabled={loading}
              >
                <RefreshCwIcon
                  className={cn(
                    '-ms-2 me-2 mr-0 opacity-60',
                    loading && 'animate-spin'
                  )}
                  aria-hidden="true"
                />
                Reload
              </Button>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
