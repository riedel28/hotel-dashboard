import { describe, expect, test } from 'vitest';

import { floorOf, groupRoomsByFloor } from './rooms';

const room = (id: number, room_number: string | null, name = `Room ${id}`) => ({
  id,
  name,
  room_number
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
