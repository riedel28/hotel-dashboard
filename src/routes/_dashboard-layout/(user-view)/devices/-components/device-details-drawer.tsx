import { Trans, useLingui } from '@lingui/react/macro';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import type { Device, DeviceConnectionStatus } from 'shared/types/devices';

import { Badge, type BadgeColorProps } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/copy-button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

import { connectionStatus, formatRelativeTime } from '../-lib/devices';
import { ConnectionStatusName } from './connection-status';
import { RoomCell } from './room-cell';

const statusColors: Record<DeviceConnectionStatus, BadgeColorProps> = {
  online: 'emerald',
  recently_offline: 'yellow',
  offline: 'gray'
};

interface DeviceDetailsDrawerProps {
  /** Whether a device is selected; it may still be missing from the list. */
  open: boolean;
  device: Device | undefined;
  /** The moment the connection status is computed for. */
  now: number;
  onClose: () => void;
}

export function DeviceDetailsDrawer({
  open,
  device,
  now,
  onClose
}: DeviceDetailsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
      <DrawerContent>
        {device ? (
          <DeviceDetails device={device} now={now} />
        ) : (
          <DrawerHeader className="space-y-1 pr-14">
            <DrawerTitle>
              <Trans>Device not found</Trans>
            </DrawerTitle>
            <p className="text-sm font-normal text-muted-foreground">
              <Trans>This device does not exist or was removed.</Trans>
            </p>
          </DrawerHeader>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function Detail({
  label,
  children
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex items-center">{children}</dd>
    </>
  );
}

function DeviceDetails({ device, now }: { device: Device; now: number }) {
  const { t, i18n } = useLingui();
  const status = connectionStatus(device.last_seen_at, now);
  const lastSeen = device.last_seen_at;

  return (
    <>
      <DrawerHeader className="space-y-2">
        {/* Only the title row shares its line with the close button */}
        <DrawerTitle className="pr-10">
          {device.name || <Trans>Unnamed device</Trans>}
        </DrawerTitle>
        <div className="flex flex-wrap items-center gap-2 text-sm font-normal text-muted-foreground">
          <Badge
            size="sm"
            variant="outline"
            color={statusColors[status]}
            className="rounded-md"
          >
            <span className="mr-0.5 size-1.25 rounded-full bg-current/80"></span>
            <ConnectionStatusName status={status} />
          </Badge>
          {lastSeen && (
            <time dateTime={lastSeen}>
              {formatRelativeTime(lastSeen, i18n.locale, now)}
            </time>
          )}
        </div>
      </DrawerHeader>

      <DrawerBody>
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2 text-sm">
          <Detail label={<Trans>Serial number</Trans>}>
            <span className="font-mono text-[13px]">
              {device.serial_number}
            </span>
            <CopyButton
              text={device.serial_number}
              copyLabel={t`Copy serial number`}
              copiedLabel={t`Serial number copied`}
              // Negative margins: the controls of a row do not make it taller
              // than the plain rows
              buttonClassName="-my-1 ml-1"
            />
          </Detail>
          <Detail label={<Trans>Room</Trans>}>
            <div className={cn('-my-1', device.room && '-ml-2.5')}>
              <RoomCell device={device} />
            </div>
          </Detail>
          <Detail label={<Trans>Last signal</Trans>}>
            {lastSeen ? (
              <time dateTime={lastSeen} className="tabular-nums">
                {dayjs(lastSeen).format('DD.MM.YYYY HH:mm:ss')}
              </time>
            ) : (
              <span className="text-muted-foreground">
                <Trans>Never</Trans>
              </span>
            )}
          </Detail>
          <Detail label={<Trans>App version</Trans>}>
            <span className="tabular-nums">{device.app_version || '-'}</span>
          </Detail>
        </dl>
      </DrawerBody>
    </>
  );
}
