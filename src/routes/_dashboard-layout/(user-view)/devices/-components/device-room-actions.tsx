import { Trans } from '@lingui/react/macro';
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState
} from 'react';
import type { Device, DeviceRoom } from 'shared/types/devices';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import { useAssignDeviceRoom } from '../-hooks/use-assign-device-room';
import { deviceLabel } from '../-lib/devices';
import { roomLabel } from '../-lib/rooms';

interface DeviceRoomActions {
  /** Saves the room right away. */
  assign: (device: Device, room: DeviceRoom) => void;
  /** Asks for confirmation, then unassigns the device from its room. */
  requestUnassign: (device: Device) => void;
}

const DeviceRoomActionsContext = createContext<DeviceRoomActions | null>(null);

export function useDeviceRoomActions() {
  const actions = useContext(DeviceRoomActionsContext);
  if (!actions) {
    throw new Error(
      'useDeviceRoomActions must be used within DeviceRoomActionsProvider'
    );
  }
  return actions;
}

/**
 * Owns changing a device's room for everything inside it: one mutation and
 * one confirmation dialog, however many rows offer the action. The dialog
 * lives here rather than in a row, so a row that leaves the list on unassign
 * does not take it along.
 */
export function DeviceRoomActionsProvider({
  children
}: {
  children: ReactNode;
}) {
  const { mutate } = useAssignDeviceRoom();
  // Kept after the dialog closes, so its text holds while it animates out
  const [unassigning, setUnassigning] = useState<Device | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const actions = useMemo<DeviceRoomActions>(
    () => ({
      assign: (device, room) => mutate({ device, room }),
      requestUnassign: (device) => {
        setUnassigning(device);
        setIsConfirmOpen(true);
      }
    }),
    [mutate]
  );

  return (
    <DeviceRoomActionsContext value={actions}>
      {children}

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans>Unassign from room?</Trans>
            </AlertDialogTitle>
            {unassigning?.room && (
              <AlertDialogDescription className="py-4">
                <Trans>
                  <span className="font-medium text-foreground">
                    {deviceLabel(unassigning)}
                  </span>{' '}
                  will no longer belong to room{' '}
                  <span className="font-medium text-foreground">
                    {roomLabel(unassigning.room)}
                  </span>
                  . You can assign it again at any time.
                </Trans>
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Trans>Cancel</Trans>
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                setIsConfirmOpen(false);
                if (unassigning) {
                  mutate({ device: unassigning, room: null });
                }
              }}
            >
              <Trans>Unassign</Trans>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DeviceRoomActionsContext>
  );
}
