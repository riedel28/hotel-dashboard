import { t } from '@lingui/core/macro';
import type { RoomStatus } from 'shared/types/rooms';
import type { BadgeProps } from '@/components/ui/badge';

import { Badge } from '@/components/ui/badge';

interface RoomStatusCellProps {
  status: RoomStatus;
}

function getStatusVariant(status: RoomStatus): BadgeProps['variant'] {
  switch (status) {
    case 'available':
      return 'success';
    case 'occupied':
      return 'info';
    case 'maintenance':
      return 'warning';
    case 'out_of_order':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function getStatusLabel(status: RoomStatus): string {
  switch (status) {
    case 'available':
      return t`Available`;
    case 'occupied':
      return t`Occupied`;
    case 'maintenance':
      return t`Maintenance`;
    case 'out_of_order':
      return t`Out of Order`;
    default:
      return status;
  }
}

export function RoomStatusCell({ status }: RoomStatusCellProps) {
  return (
    <Badge size="sm" variant={getStatusVariant(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
}
