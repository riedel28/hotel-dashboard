import { Trans } from '@lingui/react/macro';
import { BuildingIcon } from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';

/** In place of the events pages while the user has no property selected. */
export function NoPropertySelected() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BuildingIcon />
        </EmptyMedia>
        <EmptyTitle>
          <Trans>No property selected</Trans>
        </EmptyTitle>
        <EmptyDescription>
          <Trans>
            Select a property at the top of the page to see its events.
          </Trans>
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
