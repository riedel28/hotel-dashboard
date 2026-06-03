import { Trans } from '@lingui/react/macro';
import type { RoomStatus } from 'shared/types/rooms';
import { Badge, type BadgeProps } from '@/components/ui/badge';

const statusVariantMap: Record<RoomStatus, BadgeProps['color']> = {
  available: 'emerald',
  occupied: 'yellow',
  maintenance: 'sky',
  out_of_order: 'red'
};

function getStatusMessage(status: RoomStatus) {
  switch (status) {
    case 'available':
      return <Trans>Available</Trans>;
    case 'occupied':
      return <Trans>Occupied</Trans>;
    case 'maintenance':
      return <Trans>Maintenance</Trans>;
    case 'out_of_order':
      return <Trans>Out of Order</Trans>;
    default:
      return status;
  }
}

interface RoomStatusCellProps {
  status: RoomStatus;
}

export function RoomStatusCell({ status }: RoomStatusCellProps) {
  return (
    <Badge
      variant="outline"
      color={statusVariantMap[status] ?? 'gray'}
      size="sm"
    >
      {getStatusMessage(status)}
    </Badge>
  );
}
