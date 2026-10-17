import { Trans } from '@lingui/react/macro';
import type { DeviceConnectionStatus } from 'shared/types/devices';

import { cn } from '@/lib/utils';

const dotColors: Record<DeviceConnectionStatus, string> = {
  online: 'bg-success',
  recently_offline: 'bg-warning',
  offline: 'bg-subtle-foreground'
};

export function ConnectionStatusDot({
  status
}: {
  status: DeviceConnectionStatus;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn('size-1.5 shrink-0 rounded-full', dotColors[status])}
    />
  );
}

export function ConnectionStatusName({
  status
}: {
  status: DeviceConnectionStatus;
}) {
  switch (status) {
    case 'online':
      return <Trans>Online</Trans>;
    case 'recently_offline':
      return <Trans>Recently offline</Trans>;
    case 'offline':
      return <Trans>Offline</Trans>;
  }
}

/** The dot with the status spelled out, for filters. */
export function ConnectionStatusLabel({
  status
}: {
  status: DeviceConnectionStatus;
}) {
  return (
    <span className="flex items-center gap-2">
      <ConnectionStatusDot status={status} />
      <ConnectionStatusName status={status} />
    </span>
  );
}
