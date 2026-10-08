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

// The columns the table can be ordered by
export const deviceSortColumnSchema = z.enum([
  'name',
  'serial_number',
  'room',
  'last_seen_at',
  'app_version'
]);
export type DeviceSortColumn = z.infer<typeof deviceSortColumnSchema>;

export interface DeviceSort {
  by: DeviceSortColumn;
  order: 'asc' | 'desc';
}

export const DEVICE_PAGE_SIZES = [10, 25, 50, 100];
export const DEFAULT_DEVICE_PAGE_SIZE = 25;

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
 * The devices the table lists: the tab, the search (name, serial number,
 * room) and the status filter combined. This is also the default order, used
 * until the user sorts by a column: unassigned devices first, the rest by
 * room.
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

// What each column is ordered by. "Last signal" goes by the age of the
// signal, so ascending starts with the devices heard from most recently.
const sortKeys: Record<
  DeviceSortColumn,
  (device: DeviceView) => string | number | null
> = {
  name: (device) => device.name,
  serial_number: (device) => device.serial_number,
  room: (device) => device.room && roomLabel(device.room),
  last_seen_at: (device) => device.signalAgeMs,
  app_version: (device) => device.app_version
};

/**
 * The devices ordered by a column the user picked. Devices with nothing in
 * that column (no name, no room, never seen) come last in either direction.
 */
export function sortDevices(devices: DeviceView[], { by, order }: DeviceSort) {
  const key = sortKeys[by];
  const direction = order === 'desc' ? -1 : 1;

  return devices.toSorted((first, second) => {
    const a = key(first);
    const b = key(second);
    if (a === null || b === null) {
      return Number(a === null) - Number(b === null);
    }
    const result =
      typeof a === 'number' && typeof b === 'number'
        ? a - b
        : byLabel(String(a), String(b));
    return result * direction;
  });
}

/** The rows of one page, and that page's index once it is within range. */
export function paginate<T>(rows: T[], pageIndex: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const index = Math.min(pageIndex, pageCount - 1);
  return {
    pageIndex: index,
    pageCount,
    rows: rows.slice(index * pageSize, (index + 1) * pageSize)
  };
}
