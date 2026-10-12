import { Trans } from '@lingui/react/macro';
import { type Control, useWatch } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';

import type { AdyenFormData } from './adyen-form-types';

/** Whether the form is set to Adyen's test or live environment. */
export function AdyenEnvironmentBadge({
  control
}: {
  control: Control<AdyenFormData>;
}) {
  const environment = useWatch({ control, name: 'environment' });

  return (
    <Badge color={environment === 'live' ? 'orange' : 'sky'} size="sm">
      {environment === 'live' ? <Trans>Live</Trans> : <Trans>Test</Trans>}
    </Badge>
  );
}
