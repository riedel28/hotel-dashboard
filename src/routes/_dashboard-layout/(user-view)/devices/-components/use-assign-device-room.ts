import { useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Device, DeviceRoom } from 'shared/types/devices';
import { toast } from 'sonner';

import { assignDeviceRoom, devicesQueryOptions } from '@/api/devices';

import { roomLabel } from '../-lib/devices';

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

  return useMutation({
    mutationFn: ({ device, room }: AssignDeviceRoom) =>
      assignDeviceRoom(device.id, room?.id ?? null),
    onMutate: async ({ device, room }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (devices) =>
        devices?.map((item) =>
          item.id === device.id ? { ...item, room } : item
        )
      );
      return { previous };
    },
    onError: (_error, { device }, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      const name = device.name || device.serial_number;
      toast.error(t`Failed to change the room of ${name}`);
    },
    onSuccess: (_data, { device, room }) => {
      const name = device.name || device.serial_number;
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
