import { useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Device, DeviceRoom } from 'shared/types/devices';
import { toast } from 'sonner';

import { assignDeviceRoom, devicesQueryOptions } from '@/api/devices';

import { deviceLabel, roomLabel } from '../-lib/devices';

interface AssignDeviceRoom {
  device: Device;
  /** The room to assign the device to, or null to unassign it. */
  room: DeviceRoom | null;
}

/**
 * Saves a device's room right away: the row and the tab counts change before
 * the server answers, and go back to what they were if it refuses.
 */
export function useAssignDeviceRoom() {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const { queryKey } = devicesQueryOptions();

  // Changes one device in the cached list and leaves the others as they are,
  // so assignments still on their way to the server are not undone.
  const setRoom = (deviceId: number, room: DeviceRoom | null) =>
    queryClient.setQueryData(queryKey, (devices) =>
      devices?.map((item) => (item.id === deviceId ? { ...item, room } : item))
    );

  return useMutation({
    mutationFn: ({ device, room }: AssignDeviceRoom) =>
      assignDeviceRoom(device.id, room?.id ?? null),
    onMutate: async ({ device, room }) => {
      await queryClient.cancelQueries({ queryKey });
      setRoom(device.id, room);
    },
    // `device` is the device as it was before the change
    onError: (_error, { device }) => {
      setRoom(device.id, device.room);
      const name = deviceLabel(device);
      toast.error(t`Failed to change the room of ${name}`);
    },
    onSuccess: (_data, { device, room }) => {
      const name = deviceLabel(device);
      if (room) {
        const label = roomLabel(room);
        toast.success(t`${name} assigned to room ${label}`);
      } else {
        toast.success(t`${name} unassigned from its room`);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey })
  });
}
