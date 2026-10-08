import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import type { Device } from 'shared/types/devices';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { roomLabel } from '../-lib/devices';
import { RoomPicker } from './room-picker';
import { useAssignDeviceRoom } from './use-assign-device-room';

/**
 * The room of a device: "Assign" for an unassigned one, otherwise the room
 * number. Either opens the room picker; picking a room saves immediately.
 */
export function RoomCell({
  device,
  outlined = false
}: {
  device: Device;
  /** Keeps the border once a room is assigned, for use outside the table. */
  outlined?: boolean;
}) {
  const { t } = useLingui();
  const assign = useAssignDeviceRoom();
  const [isConfirmingUnassign, setIsConfirmingUnassign] = useState(false);
  const { room } = device;
  const name = device.name || device.serial_number;

  return (
    <>
      <RoomPicker
        value={room}
        onValueChange={(next) => {
          if (next.id !== room?.id) {
            assign.mutate({ device, room: next });
          }
        }}
        clearLabel={<Trans>Unassign from room</Trans>}
        onClear={() => setIsConfirmingUnassign(true)}
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
          room && 'tabular-nums'
        )}
      >
        {room ? roomLabel(room) : <Trans>Assign</Trans>}
      </RoomPicker>

      <AlertDialog
        open={isConfirmingUnassign}
        onOpenChange={setIsConfirmingUnassign}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans>Unassign from room?</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription className="py-4">
              <Trans>
                <span className="font-medium text-foreground">{name}</span> will
                no longer belong to room{' '}
                <span className="font-medium text-foreground">
                  {room && roomLabel(room)}
                </span>
                . You can assign it again at any time.
              </Trans>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Trans>Cancel</Trans>
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                setIsConfirmingUnassign(false);
                assign.mutate({ device, room: null });
              }}
            >
              <Trans>Unassign</Trans>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
