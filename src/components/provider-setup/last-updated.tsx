import { Trans } from '@lingui/react/macro';
import type { Provider } from 'shared/types/providers';

import { useFormatLocalized } from '@/hooks/use-format-localized';
import { getFullName } from '@/utils/user';

/** When a provider's configuration was last saved, and by whom if known. */
export function LastUpdated({
  saved
}: {
  saved: Pick<Provider, 'updated_at' | 'updated_by'>;
}) {
  const formatLocalized = useFormatLocalized();
  const date = formatLocalized(saved.updated_at, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  const name =
    saved.updated_by &&
    (getFullName(saved.updated_by) || saved.updated_by.email);

  return name ? (
    <Trans>
      Last updated {date} · {name}
    </Trans>
  ) : (
    <Trans>Last updated {date}</Trans>
  );
}
