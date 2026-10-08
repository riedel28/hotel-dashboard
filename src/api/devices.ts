import { queryOptions } from '@tanstack/react-query';
import {
  type ClaimDeviceData,
  claimDeviceSchema,
  type Device,
  type DeviceRoom,
  deviceRoomSchema,
  deviceSchema
} from 'shared/types/devices';
import { z } from 'zod';

import { client, handleApiError } from './client';

async function fetchDevices(): Promise<Device[]> {
  try {
    const response = await client.get('/devices');
    return z.array(deviceSchema).parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchDevices');
  }
}

// The whole list: tabs, search and filters run in the browser. Refetching
// every minute keeps the connection statuses current.
function devicesQueryOptions() {
  return queryOptions({
    queryKey: ['devices'] as const,
    queryFn: fetchDevices,
    refetchInterval: 60_000
  });
}

async function fetchDeviceRoomOptions(): Promise<DeviceRoom[]> {
  try {
    const response = await client.get('/devices/room-options');
    return z.array(deviceRoomSchema).parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchDeviceRoomOptions');
  }
}

function deviceRoomOptionsQueryOptions() {
  return queryOptions({
    queryKey: ['devices', 'room-options'] as const,
    queryFn: fetchDeviceRoomOptions
  });
}

async function claimDevice(data: ClaimDeviceData): Promise<Device> {
  try {
    const validated = claimDeviceSchema.parse(data);
    const response = await client.post('/devices/claim', validated);
    return deviceSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'claimDevice');
  }
}

/** Assigns the device to a room, or unassigns it with `null`. */
async function assignDeviceRoom(
  id: number,
  roomId: number | null
): Promise<Device> {
  try {
    const response = await client.patch(`/devices/${id}`, { room_id: roomId });
    return deviceSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'assignDeviceRoom');
  }
}

export {
  assignDeviceRoom,
  claimDevice,
  deviceRoomOptionsQueryOptions,
  devicesQueryOptions
};
