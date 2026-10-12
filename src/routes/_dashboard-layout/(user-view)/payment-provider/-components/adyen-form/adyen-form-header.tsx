import { Trans } from '@lingui/react/macro';
import { ArrowUpRightIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { type Control, useWatch } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle } from '@/components/ui/card';

import type { AdyenFormData } from './adyen-form-types';

interface AdyenFormHeaderProps {
  control: Control<AdyenFormData>;
  /** Shown after the badges, e.g. the link to change the provider. */
  actions?: ReactNode;
  /** A notice under the title row. */
  children?: ReactNode;
}

/** The card header of an Adyen form: its name, environment, guide and logo. */
export function AdyenFormHeader({
  control,
  actions,
  children
}: AdyenFormHeaderProps) {
  const environment = useWatch({ control, name: 'environment' });

  return (
    <CardHeader>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center-safe gap-2">
          <CardTitle>
            <Trans>Adyen</Trans>
          </CardTitle>

          <Badge color={environment === 'live' ? 'orange' : 'sky'} size="sm">
            {environment === 'live' ? <Trans>Live</Trans> : <Trans>Test</Trans>}
          </Badge>

          <Badge
            variant="outline"
            size="sm"
            className="cursor-pointer bg-accent text-accent-foreground"
            render={
              <a
                href="https://docs.adyen.com/development-resources/api-credentials/"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <Trans>Integration Guide</Trans>
            <ArrowUpRightIcon aria-hidden="true" />
          </Badge>

          {actions}
        </div>
        <div className="flex h-8 w-24 shrink-0 items-center justify-end">
          <img
            src="/adyen-logo.svg"
            alt="Adyen"
            className="max-h-7 max-w-full object-contain"
          />
        </div>
      </div>

      {children}
    </CardHeader>
  );
}
