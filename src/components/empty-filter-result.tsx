import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

/** In place of a list's rows when its filters match nothing. */
export function EmptyFilterResult({
  description,
  onClearFilters
}: {
  description: ReactNode;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-6 text-sm">
      <p className="font-medium text-foreground">
        <Trans>Nothing found</Trans>
      </p>
      <p className="text-muted-foreground">{description}</p>
      <Button
        variant="secondary"
        size="sm"
        className="mt-2"
        onClick={onClearFilters}
      >
        <Trans>Clear filters</Trans>
      </Button>
    </div>
  );
}
