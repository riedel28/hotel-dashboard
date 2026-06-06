import { t } from '@lingui/core/macro';
import type { ReservationStatus } from '@/api/reservations';
import type { BadgeProps } from '@/components/ui/badge';

import { Badge } from '@/components/ui/badge';

interface StatusCellProps {
  status: ReservationStatus;
}

function getStatusVariant(status: ReservationStatus): BadgeProps['color'] {
  switch (status) {
    case 'done':
      return 'emerald';
    case 'pending':
      return 'yellow';
    case 'started':
      return 'sky';
    default:
      return 'gray';
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
    <Badge size="sm" variant="outline" color={getStatusVariant(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
}
