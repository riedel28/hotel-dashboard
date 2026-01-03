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
      variant="ghost"
      onClick={onClear}
      className="text-muted-foreground hover:text-foreground"
    >
      <XIcon />
      <Trans>Clear filters</Trans>
    </Button>
  );
}
