import { Trans } from '@lingui/react/macro';
import type { PaymentProviderId } from 'shared/types/payment-provider';

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

interface ProviderOption {
  id: PaymentProviderId;
  name: string;
  /** A file in public/. */
  logo: string;
  /** Its ink is too dark for the dark theme, where it gets a light plate. */
  darkInk?: boolean;
  /** Whether it can be set up yet. */
  available?: boolean;
}

const PROVIDERS: ProviderOption[] = [
  {
    id: 'adyen',
    name: 'Adyen',
    logo: '/adyen-logo.svg',
    available: true
  },
  { id: 'payone', name: 'PAYONE', logo: '/payone-logo.svg' },
  {
    id: 'concardis',
    name: 'Concardis',
    logo: '/concardis-logo.svg',
    darkInk: true
  },
  { id: 'six_saferpay', name: 'SIX Saferpay', logo: '/six-logo.svg' },
  { id: 'valitor', name: 'Valitor', logo: '/valitor-logo.png', darkInk: true }
];

interface ProviderPickerProps {
  /** The provider already set up, when the picker is opened to change it. */
  current?: PaymentProviderId;
  onSelect: (provider: PaymentProviderId) => void;
  /** Leaves the picker without choosing; omitted when there is nothing to go back to. */
  onBack?: () => void;
}

export function ProviderPicker({
  current,
  onSelect,
  onBack
}: ProviderPickerProps) {
  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>
          <Trans>Choose a payment provider</Trans>
        </CardTitle>
        <CardDescription>
          <Trans>
            Select the provider this property takes payments with. You enter its
            credentials in the next step.
          </Trans>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROVIDERS.map((provider) => (
            <li key={provider.id}>
              <button
                type="button"
                disabled={!provider.available}
                onClick={() => onSelect(provider.id)}
                className="flex h-28 w-full flex-col justify-between rounded-xl border border-border bg-card p-4 text-left transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-card dark:bg-input/30 dark:hover:bg-input/50 dark:disabled:hover:bg-input/30"
              >
                <span className="flex h-8 items-center">
                  <img
                    src={provider.logo}
                    alt=""
                    className={cn(
                      'max-h-8 max-w-24 object-contain',
                      // Not available yet: no colour, white in the dark theme
                      !provider.available &&
                        'grayscale dark:brightness-0 dark:invert',
                      provider.available &&
                        provider.darkInk &&
                        'dark:rounded-md dark:bg-white dark:px-2 dark:py-1'
                    )}
                  />
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
