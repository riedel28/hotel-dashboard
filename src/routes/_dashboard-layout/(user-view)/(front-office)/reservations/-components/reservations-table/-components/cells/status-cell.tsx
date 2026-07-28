import { t } from '@lingui/core/macro';
import type { ReservationStatus } from '@/api/reservations';

import { Badge } from '@/components/ui/badge';

import { getReservationStatusStyle } from '../../../reservation-status';

interface StatusCellProps {
  status: ReservationStatus;
}

function getStatusLabel(status: ReservationStatus): string {
  switch (status) {
    case 'done':
      return t`Done`;
    case 'pending':
      return t`Pending`;
    case 'started':
      return t`Started`;
    default:
      return status;
  }
}

export function StatusCell({ status }: StatusCellProps) {
  return (
    <Badge
      size="sm"
      variant="outline"
      color={getReservationStatusStyle(status).badgeColor}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}
