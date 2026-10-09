import { Trans } from '@lingui/react/macro';
import { XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ClearFiltersButtonProps {
  hasActiveFilters: boolean;
  onClear: () => void;
}

/** Resets a table's filters; renders nothing while none is set. */
export function ClearFiltersButton({
  hasActiveFilters,
  onClear
}: ClearFiltersButtonProps) {
  if (!hasActiveFilters) {
    return null;
  }

  return (
    <Button
      variant="secondary"
      onClick={onClear}
      className="text-muted-foreground transition-colors hover:text-foreground"
    >
      <XIcon />
      <Trans>Clear filters</Trans>
    </Button>
  );
}
