import type { Device } from 'shared/types/devices';
import { describe, expect, test } from 'vitest';

import {
  filterDevices,
  floorOf,
  formatRelativeTime,
  groupRoomsByFloor,
  withConnection
} from './devices';

const now = Date.parse('2026-10-08T12:00:00Z');
const ago = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

const room = (id: number, room_number: string | null, name = `Room ${id}`) => ({
  id,
  name,
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

const minutes = (count: number) => count * 60_000;

describe('withConnection', () => {
  const statusAfter = (last_seen_at: string | null) =>
    withConnection(device(1, { last_seen_at }), now).status;

  test('follows the 15 min and 24 h thresholds', () => {
    expect(statusAfter(ago(14))).toBe('online');
    expect(statusAfter(ago(15))).toBe('recently_offline');
    expect(statusAfter(ago(24 * 60))).toBe('recently_offline');
    expect(statusAfter(ago(24 * 60 + 1))).toBe('offline');
    expect(statusAfter(null)).toBe('offline');
  });

  test('keeps the age of the last signal', () => {
    const view = (last_seen_at: string | null) =>
      withConnection(device(1, { last_seen_at }), now);
    expect(view(ago(5)).signalAgeMs).toBe(minutes(5));
    expect(view(null).signalAgeMs).toBeNull();
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

describe('floors', () => {
  test('reads the floor off the room number', () => {
    expect(floorOf('204')).toBe(2);
    expect(floorOf('1203')).toBe(12);
    expect(floorOf('12')).toBeNull();
    expect(floorOf('A12')).toBeNull();
    expect(floorOf(null)).toBeNull();
  });

  test('groups rooms by floor with the floorless ones last', () => {
    const groups = groupRoomsByFloor([
      room(1, '301'),
      room(2, null, 'Spa'),
      room(3, '205'),
      room(4, '203')
    ]);
    expect(
      groups.map(({ floor, items }) => [floor, items.map((item) => item.id)])
    ).toEqual([
      [2, [4, 3]],
      [3, [1]],
      [null, [2]]
    ]);
  });
});

describe('filterDevices', () => {
  const devices = [
    device(1, { room: room(1, '204'), name: 'Tablet 204' }),
    device(2, { name: 'New tablet' }),
    device(3, { room: room(2, '118'), last_seen_at: ago(3 * 24 * 60) }),
    device(4, { room: room(1, '204'), last_seen_at: ago(60) })
  ].map((item) => withConnection(item, now));
  const ids = (filters: Parameters<typeof filterDevices>[1]) =>
    filterDevices(devices, filters).map((item) => item.id);

  test('puts unassigned devices first, then orders by room', () => {
    expect(ids({})).toEqual([2, 3, 1, 4]);
  });

  test('combines the tab, the search and the status', () => {
    expect(ids({ tab: 'unassigned' })).toEqual([2]);
    expect(ids({ tab: 'assigned' })).toEqual([3, 1, 4]);
    expect(ids({ q: '204' })).toEqual([1, 4]);
    expect(ids({ q: 'sn-3' })).toEqual([3]);
    expect(ids({ q: '204', status: 'recently_offline' })).toEqual([4]);
    expect(ids({ tab: 'unassigned', status: 'offline' })).toEqual([]);
  });
});
