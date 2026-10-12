import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';
import type { ProviderKind } from 'shared/types/providers';

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

import { ProviderLogo } from './provider-logo';
import type { ProviderEntry } from './types';

interface ProviderPickerProps<K extends ProviderKind> {
  title: ReactNode;
  description: ReactNode;
  providers: ProviderEntry<K>[];
  /** The id of the provider already set up, when the picker is opened to change it. */
  current?: string;
  onSelect: (provider: ProviderEntry<K>) => void;
  /** Leaves the picker without choosing; omitted when there is nothing to go back to. */
  onBack?: () => void;
}

/** The providers of one kind to choose from, as tiles. */
export function ProviderPicker<K extends ProviderKind>({
  title,
  description,
  providers,
  current,
  onSelect,
  onBack
}: ProviderPickerProps<K>) {
  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <li key={provider.id}>
              <button
                type="button"
                disabled={!provider.Form}
                onClick={() => onSelect(provider)}
                className="flex h-28 w-full flex-col justify-between rounded-xl border border-border bg-card p-4 text-left transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-card dark:bg-input/30 dark:hover:bg-input/50 dark:disabled:hover:bg-input/30"
              >
                <span className="flex h-8 items-center">
                  {provider.logo && (
                    <ProviderLogo
                      logo={provider.logo}
                      muted={!provider.Form}
                      className="max-h-8 max-w-24"
                    />
                  )}
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{provider.name}</span>
                  {provider.id === current ? (
                    <Badge color="sky" size="sm">
                      <Trans>Current</Trans>
                    </Badge>
                  ) : provider.Form ? null : (
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
