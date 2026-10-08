import {
  type Device,
  DEVICE_OFFLINE_THRESHOLD_MS,
  DEVICE_ONLINE_THRESHOLD_MS,
  type DeviceConnectionStatus,
  type DeviceRoom
} from 'shared/types/devices';
import { z } from 'zod';

// Which devices a tab shows; no tab means all of them
export const deviceTabSchema = z.enum(['assigned', 'unassigned']);
export type DeviceTab = z.infer<typeof deviceTabSchema>;

export interface DeviceFilters {
  tab?: DeviceTab;
  q?: string;
  status?: DeviceConnectionStatus;
}

/**
 * A device with its connection worked out for one moment — the moment the
 * list was fetched — so the filter, the table and the drawer all agree.
 */
export interface DeviceView extends Device {
  status: DeviceConnectionStatus;
  /** Milliseconds since the last signal; null if the device never reported. */
  signalAgeMs: number | null;
}

export function connectionStatus(
  signalAgeMs: number | null
): DeviceConnectionStatus {
  if (signalAgeMs === null) return 'offline';
  if (signalAgeMs < DEVICE_ONLINE_THRESHOLD_MS) return 'online';
  return signalAgeMs <= DEVICE_OFFLINE_THRESHOLD_MS
    ? 'recently_offline'
    : 'offline';
}

export function withConnection(device: Device, now: number): DeviceView {
  const signalAgeMs = device.last_seen_at
    ? now - new Date(device.last_seen_at).getTime()
    : null;
  return { ...device, signalAgeMs, status: connectionStatus(signalAgeMs) };
}

/** "5 min. ago" in the given locale, in the largest unit that fits. */
export function formatRelativeTime(ageMs: number, locale: string) {
  const format = new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto',
    style: 'short'
  });
  const minutes = Math.floor(ageMs / 60_000);
  if (minutes < 1) return format.format(0, 'second');
  if (minutes < 60) return format.format(-minutes, 'minute');
  if (minutes < 24 * 60)
    return format.format(-Math.floor(minutes / 60), 'hour');
  return format.format(-Math.floor(minutes / (24 * 60)), 'day');
}

/** What a device is called in messages: its name, else its serial number. */
export const deviceLabel = (device: Device) =>
  device.name || device.serial_number;

/** What a room is called in the table and the picker. */
export const roomLabel = (room: DeviceRoom) => room.room_number || room.name;

// ponytail: the floor is read off the room number — everything but its last
// two digits (204 → 2). Numbering like "A12" lands in "no floor"; add a floor
// column to rooms if a property needs that.
export function floorOf(roomNumber: string | null): number | null {
  const match = roomNumber?.trim().match(/^(\d+)\d{2}$/);
  return match ? Number(match[1]) : null;
}

const byLabel = new Intl.Collator(undefined, { numeric: true }).compare;

/** Rooms by floor, lowest first; rooms without a floor come last. */
export function groupRoomsByFloor(rooms: DeviceRoom[]) {
  const groups = new Map<number | null, DeviceRoom[]>();
  for (const room of rooms) {
    const floor = floorOf(room.room_number);
    groups.set(floor, [...(groups.get(floor) ?? []), room]);
  }
  return [...groups]
    .sort(([a], [b]) => (a ?? Infinity) - (b ?? Infinity))
    .map(([floor, items]) => ({
      floor,
      items: items.sort((a, b) => byLabel(roomLabel(a), roomLabel(b)))
    }));
}

export function matchesRoomQuery(room: DeviceRoom, query: string) {
  const q = query.trim().toLowerCase();
  return [room.room_number, room.name].some((text) =>
    text?.toLowerCase().includes(q)
  );
}

/**
 * The rows of the table: the tab, the search (name, serial number, room) and
 * the status filter combined. Unassigned devices come first, the rest are
 * ordered by room.
 */
export function filterDevices(
  devices: DeviceView[],
  { tab, q, status }: DeviceFilters
) {
  const query = q?.trim().toLowerCase();

  return devices
    .filter((device) => {
      if (tab === 'assigned' && !device.room) return false;
      if (tab === 'unassigned' && device.room) return false;
      if (status && device.status !== status) return false;
      if (!query) return true;
      return (
        [device.name, device.serial_number].some((text) =>
          text?.toLowerCase().includes(query)
        ) || Boolean(device.room && matchesRoomQuery(device.room, query))
      );
    })
    .sort((a, b) => {
      if (!a.room || !b.room)
        return Number(Boolean(a.room)) - Number(Boolean(b.room));
      return byLabel(roomLabel(a.room), roomLabel(b.room));
    });
}
