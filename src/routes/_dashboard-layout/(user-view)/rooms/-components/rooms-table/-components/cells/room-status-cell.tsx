import { Trans } from '@lingui/react/macro';
import type { RoomStatus } from 'shared/types/rooms';
import { Badge, type BadgeProps } from '@/components/ui/badge';

const statusVariantMap: Record<RoomStatus, BadgeProps['variant']> = {
  available: 'success',
  occupied: 'info',
  maintenance: 'warning',
  out_of_order: 'destructive'
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
      variant={statusVariantMap[status] ?? 'secondary'}
      size="sm"
      className="shrink-0 rounded-md border border-foreground/10 capitalize"
    >
      {getStatusMessage(status)}
    </Badge>
  );
}
