import {
  type Device,
  DEVICE_OFFLINE_THRESHOLD_MS,
  DEVICE_ONLINE_THRESHOLD_MS,
  type DeviceConnectionStatus
} from 'shared/types/devices';
import { z } from 'zod';

import { byLabel, matchesRoomQuery, roomLabel } from './rooms';

// Which devices a tab shows; no tab means all of them
export const deviceTabSchema = z.enum(['assigned', 'unassigned']);
export type DeviceTab = z.infer<typeof deviceTabSchema>;

export interface DeviceFilters {
  tab?: DeviceTab;
  q?: string;
  status?: DeviceConnectionStatus;
}

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

/**
 * A device with its connection worked out for one moment — the moment the
 * list was fetched — so the filter, the table and the drawer all agree.
 */
export interface DeviceView extends Device {
  status: DeviceConnectionStatus;
  /** The last signal and how old it is; null if the device never reported. */
  signal: { at: string; ageMs: number } | null;
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
  const signal = device.last_seen_at
    ? {
        at: device.last_seen_at,
        ageMs: now - new Date(device.last_seen_at).getTime()
      }
    : null;
  return { ...device, signal, status: connectionStatus(signal?.ageMs ?? null) };
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

/**
 * The devices the filters let through: the tab, the search (name, serial
 * number, room) and the connection status combined. They come in the default
 * order: unassigned devices first, the rest by room.
 */
function filterDevices(
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
  last_seen_at: (device) => device.signal?.ageMs ?? null,
  app_version: (device) => device.app_version
};

// Devices with nothing in the column (no name, no room, never seen) come
// last in either direction.
function sortDevices(devices: DeviceView[], { by, order }: DeviceSort) {
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

/**
 * Every device the table lists, across all its pages, in the order it lists
 * them: filtered, then ordered by the column the user picked, or left in the
 * default order when none is.
 */
export function listDevices(
  devices: DeviceView[],
  filters: DeviceFilters,
  sort: DeviceSort | undefined
) {
  const filtered = filterDevices(devices, filters);
  return sort ? sortDevices(filtered, sort) : filtered;
}
