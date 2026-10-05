import { Trans } from '@lingui/react/macro';
import { XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ReservationClearFiltersProps {
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function ReservationClearFilters({
  hasActiveFilters,
  onClear
}: ReservationClearFiltersProps) {
  if (!hasActiveFilters) {
    return null;
  }

  return (
    <Button
      variant="secondary"
      onClick={onClear}
      className="w-full text-muted-foreground hover:text-foreground lg:w-auto"
    >
      <XIcon />
      <Trans>Clear filters</Trans>
    </Button>
  );
}
