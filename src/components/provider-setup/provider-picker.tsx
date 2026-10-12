import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ProviderOption<Id extends string = string> {
  id: Id;
  name: string;
  /** A file in public/. Without one the tile shows the name alone. */
  logo?: string;
  /** Its variant for the dark theme, when there is one. */
  darkLogo?: string;
  /**
   * Set when the logo only reads on one kind of surface. A dark one gets a
   * light plate in the dark theme; a light one is shown black in the light one.
   */
  ink?: 'dark' | 'light';
  /** Whether it can be set up yet. */
  available?: boolean;
}

interface ProviderPickerProps<Id extends string> {
  title: ReactNode;
  description: ReactNode;
  options: ProviderOption<Id>[];
  /** The provider already set up, when the picker is opened to change it. */
  current?: string;
  onSelect: (provider: Id) => void;
  /** Leaves the picker without choosing; omitted when there is nothing to go back to. */
  onBack?: () => void;
}

/** The providers of one kind to choose from, as tiles. */
export function ProviderPicker<Id extends string>({
  title,
  description,
  options,
  current,
  onSelect,
  onBack
}: ProviderPickerProps<Id>) {
  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((provider) => (
            <li key={provider.id}>
              <button
                type="button"
                disabled={!provider.available}
                onClick={() => onSelect(provider.id)}
                className="flex h-28 w-full flex-col justify-between rounded-xl border border-border bg-card p-4 text-left transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-card dark:bg-input/30 dark:hover:bg-input/50 dark:disabled:hover:bg-input/30"
              >
                <span className="flex h-8 items-center">
                  {provider.logo && (
                    <img
                      src={provider.logo}
                      alt=""
                      className={cn(
                        'max-h-8 max-w-24 object-contain',
                        provider.darkLogo && 'dark:hidden',
                        provider.available
                          ? {
                              'dark:rounded-md dark:bg-white dark:px-2 dark:py-1':
                                provider.ink === 'dark',
                              'brightness-0 dark:brightness-100':
                                provider.ink === 'light'
                            }
                          : // Not available yet: no colour, white in the dark theme
                            'grayscale dark:brightness-0 dark:invert'
                      )}
                    />
                  )}
                  {provider.darkLogo && (
                    <img
                      src={provider.darkLogo}
                      alt=""
                      className="hidden max-h-8 max-w-24 object-contain dark:block"
                    />
                  )}
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{provider.name}</span>
                  {provider.id === current ? (
                    <Badge color="sky" size="sm">
                      <Trans>Current</Trans>
                    </Badge>
                  ) : provider.available ? null : (
                    <Badge variant="outline" size="sm">
                      <Trans>Coming soon</Trans>
                    </Badge>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>

      {onBack && (
        <CardFooter className="justify-end">
          <Button type="button" variant="outline" onClick={onBack}>
            <Trans>Back</Trans>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
