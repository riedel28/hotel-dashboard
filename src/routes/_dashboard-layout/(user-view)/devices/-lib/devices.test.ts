import type { Device } from 'shared/types/devices';
import { describe, expect, test } from 'vitest';

import {
  type DeviceFilters,
  type DeviceSort,
  formatRelativeTime,
  listDevices,
  withConnection
} from './devices';

const now = Date.parse('2026-10-08T12:00:00Z');
const minutes = (count: number) => count * 60_000;
const ago = (count: number) => new Date(now - minutes(count)).toISOString();

const room = (id: number, room_number: string) => ({
  id,
  name: `Room ${room_number}`,
  room_number
});

const device = (id: number, overrides: Partial<Device> = {}): Device => ({
  id,
  serial_number: `SN-${id}`,
  name: `Device ${id}`,
  room: null,
  last_seen_at: ago(1),
  app_version: '2.4.1',
  ...overrides
});

describe('withConnection', () => {
  const view = (last_seen_at: string | null) =>
    withConnection(device(1, { last_seen_at }), now);

  test('follows the 15 min and 24 h thresholds', () => {
    expect(view(ago(14)).status).toBe('online');
    expect(view(ago(15)).status).toBe('recently_offline');
    expect(view(ago(24 * 60)).status).toBe('recently_offline');
    expect(view(ago(24 * 60 + 1)).status).toBe('offline');
    expect(view(null).status).toBe('offline');
  });

  test('keeps the last signal with its age, or nothing', () => {
    expect(view(ago(5)).signal).toEqual({ at: ago(5), ageMs: minutes(5) });
    expect(view(null).signal).toBeNull();
  });
});

describe('formatRelativeTime', () => {
  test('uses the largest unit that fits', () => {
    expect(formatRelativeTime(0, 'en')).toBe('now');
    expect(formatRelativeTime(minutes(5), 'en')).toBe('5 min. ago');
    expect(formatRelativeTime(minutes(90), 'en')).toBe('1 hr. ago');
    expect(formatRelativeTime(minutes(3 * 24 * 60), 'en')).toBe('3 days ago');
  });
});

describe('listDevices', () => {
  const ids = (
    devices: Device[],
    filters: DeviceFilters = {},
    sort?: DeviceSort
  ) =>
    listDevices(
      devices.map((item) => withConnection(item, now)),
      filters,
      sort
    ).map((item) => item.id);

  describe('filters', () => {
    const devices = [
      device(1, { room: room(1, '204'), name: 'Tablet 204' }),
      device(2, { name: 'New tablet' }),
      device(3, { room: room(2, '118'), last_seen_at: ago(3 * 24 * 60) }),
      device(4, { room: room(1, '204'), last_seen_at: ago(60) })
    ];

    test('puts unassigned devices first, then orders by room', () => {
      expect(ids(devices)).toEqual([2, 3, 1, 4]);
    });

    test('combines the tab, the search and the status', () => {
      expect(ids(devices, { tab: 'unassigned' })).toEqual([2]);
      expect(ids(devices, { tab: 'assigned' })).toEqual([3, 1, 4]);
      expect(ids(devices, { q: '204' })).toEqual([1, 4]);
      expect(ids(devices, { q: 'sn-3' })).toEqual([3]);
      expect(ids(devices, { q: '204', status: 'recently_offline' })).toEqual([
        4
      ]);
      expect(ids(devices, { tab: 'unassigned', status: 'offline' })).toEqual(
        []
      );
    });
  });

  describe('sorting', () => {
    const devices = [
      device(1, {
        name: 'Tablet 10',
        room: room(1, '204'),
        app_version: '2.4.1'
      }),
      device(2, { name: null, last_seen_at: null, app_version: null }),
      device(3, {
        name: 'Tablet 9',
        room: room(2, '118'),
        last_seen_at: ago(90),
        app_version: '2.10.0'
      })
    ];
    const sorted = (by: DeviceSort['by'], order: DeviceSort['order']) =>
      ids(devices, {}, { by, order });

    test('orders text and numbers the way a person would', () => {
      expect(sorted('name', 'asc')).toEqual([3, 1, 2]);
      expect(sorted('room', 'asc')).toEqual([3, 1, 2]);
      expect(sorted('app_version', 'asc')).toEqual([1, 3, 2]);
      expect(sorted('serial_number', 'desc')).toEqual([3, 2, 1]);
    });

    test('starts "last signal" with the most recent and keeps blanks last', () => {
      expect(sorted('last_seen_at', 'asc')).toEqual([1, 3, 2]);
      expect(sorted('last_seen_at', 'desc')).toEqual([3, 1, 2]);
      expect(sorted('name', 'desc')).toEqual([1, 3, 2]);
    });

    test('applies to what the filters let through', () => {
      expect(
        ids(devices, { tab: 'assigned' }, { by: 'name', order: 'desc' })
      ).toEqual([1, 3]);
    });
  });
});
