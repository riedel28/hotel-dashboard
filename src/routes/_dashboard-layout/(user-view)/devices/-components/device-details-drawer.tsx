import { Trans, useLingui } from '@lingui/react/macro';
import type { ReactNode } from 'react';

import { CopyButton } from '@/components/ui/copy-button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { formatDate } from '@/utils/date';

import { type DeviceView, formatRelativeTime } from '../-lib/devices';
import { ConnectionStatusLabel } from './connection-status';
import { DeviceRoomControl } from './device-room-control';

interface DeviceDetailsDrawerProps {
  /** Whether a device is selected; it may still be missing from the list. */
  open: boolean;
  device: DeviceView | undefined;
  onClose: () => void;
}

export function DeviceDetailsDrawer({
  open,
  device,
  onClose
}: DeviceDetailsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
      <DrawerContent>
        {device ? (
          <DeviceDetails device={device} />
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

function DeviceDetails({ device }: { device: DeviceView }) {
  const { t, i18n } = useLingui();
  const { signal } = device;

  return (
    <>
      <DrawerHeader className="space-y-1">
        {/* Only the title row shares its line with the close button */}
        <DrawerTitle className="pr-10">
          {device.name || <Trans>Unnamed device</Trans>}
        </DrawerTitle>
        <div className="flex flex-wrap items-center gap-2 text-sm font-normal text-muted-foreground">
          <ConnectionStatusLabel status={device.status} />
          {signal && (
            <time dateTime={signal.at}>
              {formatRelativeTime(signal.ageMs, i18n.locale)}
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
            <DeviceRoomControl device={device} outlined />
          </Detail>
          <Detail label={<Trans>Last signal</Trans>}>
            {signal ? (
              <time dateTime={signal.at} className="tabular-nums">
                {formatDate(signal.at, { preset: 'dateTimeWithSeconds' })}
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
