import { useLingui } from '@lingui/react/macro';

import type { ReservationState } from '@/api/reservations';
import { Badge } from '@/components/ui/badge';

import { reservationStatusDisplay } from '../../../reservation-status';

interface StatusCellProps {
  status: ReservationState;
}

export function StatusCell({ status }: StatusCellProps) {
  const { t } = useLingui();
  const { label, badgeColor } = reservationStatusDisplay[status];

  return (
    <Badge size="sm" variant="outline" color={badgeColor}>
      {t(label)}
    </Badge>
  );
}
