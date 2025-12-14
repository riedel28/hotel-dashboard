import { t } from '@lingui/core/macro';
import type { BadgeProps } from '@/components/ui/badge';
import type { ReservationStatus } from '@/api/reservations';

import { Badge } from '@/components/ui/badge';

interface StatusCellProps {
  status: ReservationStatus;
}

function getStatusVariant(status: ReservationStatus): BadgeProps['variant'] {
  switch (status) {
    case 'done':
      return 'success';
    case 'pending':
      return 'warning';
    case 'started':
      return 'info';
    default:
      return 'secondary';
  }
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
    <Badge size="sm" variant={getStatusVariant(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
}
