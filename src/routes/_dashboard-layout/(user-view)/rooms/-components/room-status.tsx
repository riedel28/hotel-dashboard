import { Trans } from '@lingui/react/macro';
import type { RoomStatus } from 'shared/types/rooms';

import { Badge, type BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

interface RoomStatusProps {
  status: RoomStatus;
}

/** The status as a badge, for the table and the filter. */
export function RoomStatusCell({ status }: RoomStatusProps) {
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

// The badge's colors, as a dot
const dotColors: Record<RoomStatus, string> = {
  available: 'bg-success-solid',
  occupied: 'bg-yellow-500',
  maintenance: 'bg-sky-500',
  out_of_order: 'bg-danger-solid'
};

/** A colored dot with the status spelled out, for selects. */
export function RoomStatusLabel({ status }: RoomStatusProps) {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn('size-1.5 shrink-0 rounded-full', dotColors[status])}
      />
      {getStatusMessage(status)}
    </span>
  );
}
