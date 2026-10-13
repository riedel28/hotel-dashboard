import { Trans } from '@lingui/react/macro';
import { XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClearFiltersButtonProps {
  hasActiveFilters: boolean;
  onClear: () => void;
}

/**
 * Resets a table's filters. It always holds its place in the row, hidden
 * while no filter is set, so that picking one moves nothing.
 */
export function ClearFiltersButton({
  hasActiveFilters,
  onClear
}: ClearFiltersButtonProps) {
  return (
    <Button
      variant="secondary"
      onClick={onClear}
      // Out of reach of the pointer, the keyboard and screen readers alike
      disabled={!hasActiveFilters}
      aria-hidden={!hasActiveFilters}
      className={cn(
        'text-muted-foreground transition-[color,opacity] hover:text-foreground',
        !hasActiveFilters && 'opacity-0 disabled:opacity-0'
      )}
    >
      <XIcon />
      <Trans>Clear filters</Trans>
    </Button>
  );
}
