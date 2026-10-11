import { useLingui } from '@lingui/react/macro';

import type { ReservationState } from '@/api/reservations';
import { Badge } from '@/components/ui/badge';

import { reservationStatusDisplay } from './reservation-status';

interface ReservationStatusBadgeProps {
  status: ReservationState;
}

/** A reservation's status, wherever it is shown: the list, the drawer, the filter, the page title. */
export function ReservationStatusBadge({
  status
}: ReservationStatusBadgeProps) {
  const { t } = useLingui();
  const { label, badgeColor } = reservationStatusDisplay[status];

  return (
    <Badge size="sm" variant="outline" color={badgeColor}>
      {t(label)}
    </Badge>
  );
}
