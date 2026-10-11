import { Trans, useLingui } from '@lingui/react/macro';
import type { Device } from 'shared/types/devices';

import { RoomPicker } from '@/components/room-picker';
import { buttonVariants } from '@/components/ui/button';
import { roomLabel } from '@/lib/rooms';
import { cn } from '@/lib/utils';

import { deviceLabel } from '../-lib/devices';
import { useDeviceRoomActions } from './device-room-actions';

/**
 * The room of a device: "Assign" for an unassigned one, otherwise the room
 * number. Either opens the room picker; picking a room saves immediately.
 * Used as the table's Room cell and in the details drawer.
 */
export function DeviceRoomControl({
  device,
  outlined = false
}: {
  device: Device;
  /** Keeps the border once a room is assigned, for use outside the table. */
  outlined?: boolean;
}) {
  const { t } = useLingui();
  const { assign, requestUnassign } = useDeviceRoomActions();
  const { room } = device;
  const name = deviceLabel(device);

  return (
    <RoomPicker
      value={room}
      onValueChange={(next) => {
        if (next.id !== room?.id) {
          assign(device, next);
        }
      }}
      clearLabel={<Trans>Unassign from room</Trans>}
      onClear={() => requestUnassign(device)}
      isClearDestructive
      aria-label={
        room
          ? t`Room ${roomLabel(room)} of ${name}, change`
          : t`Assign ${name} to a room`
      }
      className={cn(
        buttonVariants({
          variant: room && !outlined ? 'ghost' : 'outline',
          size: 'sm'
        }),
        // Both states share one box, so the column reads as one aligned
        // stack whichever of them a row shows
        'font-normal',
        // In the table, no taller than the other cells' content, so the rows
        // match the other data grids
        !outlined && 'h-6',
        room && 'tabular-nums'
      )}
    >
      {room ? roomLabel(room) : <Trans>Assign</Trans>}
    </RoomPicker>
  );
}
