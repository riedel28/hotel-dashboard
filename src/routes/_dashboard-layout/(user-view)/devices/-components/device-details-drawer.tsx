import { Trans, useLingui } from '@lingui/react/macro';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import type { Device } from 'shared/types/devices';

import { CopyButton } from '@/components/ui/copy-button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';

import { connectionStatus, formatRelativeTime } from '../-lib/devices';
import { ConnectionStatusLabel } from './connection-status';
import { RoomCell } from './room-cell';

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
      <dd className="flex min-h-7 items-center">{children}</dd>
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
          <ConnectionStatusLabel status={status} />
          {lastSeen && (
            <time dateTime={lastSeen}>
              {formatRelativeTime(lastSeen, i18n.locale, now)}
            </time>
          )}
        </div>
      </DrawerHeader>

      <DrawerBody>
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-10 gap-y-3 text-sm">
          <Detail label={<Trans>Serial number</Trans>}>
            <span className="font-mono text-[13px]">
              {device.serial_number}
            </span>
            <CopyButton
              text={device.serial_number}
              copyLabel={t`Copy serial number`}
              copiedLabel={t`Serial number copied`}
              buttonClassName="ml-1"
            />
          </Detail>
          <Detail label={<Trans>Room</Trans>}>
            <RoomCell device={device} outlined />
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
