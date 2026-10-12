import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';
import type { ProviderKind } from 'shared/types/providers';

import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';

import { IntegrationGuideBadge } from './integration-guide-badge';
import { ProviderLogo } from './provider-logo';
import type { ProviderEntry } from './types';

interface ProviderCardHeaderProps {
  entry: ProviderEntry<ProviderKind>;
  /** Shown after the name, e.g. the environment a provider runs in. */
  badges?: ReactNode;
  /** Opens the picker. Omitted while the provider is being set up. */
  onChangeProvider?: () => void;
  /** Leaving for the picker would drop unsaved changes. */
  changeDisabled?: boolean;
  /** A notice under the title row. */
  children?: ReactNode;
}

/** The header of a provider's form: its name, guide and logo. */
export function ProviderCardHeader({
  entry,
  badges,
  onChangeProvider,
  changeDisabled,
  children
}: ProviderCardHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center-safe gap-2">
          <CardTitle>{entry.name}</CardTitle>

          {badges}

          {entry.guideUrl && <IntegrationGuideBadge href={entry.guideUrl} />}

          {onChangeProvider && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              onClick={onChangeProvider}
              disabled={changeDisabled}
            >
              <Trans>Change provider</Trans>
            </Button>
          )}
        </div>
        {entry.logo && (
          <div className="flex h-8 w-24 shrink-0 items-center justify-end">
            <ProviderLogo logo={entry.logo} className="max-h-8 max-w-full" />
          </div>
        )}
      </div>

      {children}
    </CardHeader>
  );
}
