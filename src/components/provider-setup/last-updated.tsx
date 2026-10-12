import { Trans } from '@lingui/react/macro';
import type { Provider } from 'shared/types/providers';

import { useFormatLocalized } from '@/hooks/use-format-localized';

/** When a provider's configuration was last saved. */
export function LastUpdated({
  saved
}: {
  saved: Pick<Provider, 'updated_at'>;
}) {
  const formatLocalized = useFormatLocalized();
  const date = formatLocalized(saved.updated_at, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return <Trans>Last updated {date}</Trans>;
}
