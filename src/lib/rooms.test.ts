import { describe, expect, test } from 'vitest';

import { byLabel, groupRoomsByFloor } from './rooms';

const room = (id: number, room_number: string, floor: number | null) => ({
  id,
  name: `Room ${id}`,
  room_number,
  floor
});

describe('room numbers', () => {
  test('sort the way a person reads them', () => {
    expect(['10A', '2', '10', '1', 'B2', 'B10'].sort(byLabel)).toEqual([
      '1',
      '2',
      '10',
      '10A',
      'B2',
      'B10'
    ]);
  });
});

describe('floors', () => {
  test('groups rooms by floor with the floorless ones last', () => {
    const groups = groupRoomsByFloor([
      room(1, '301', 3),
      room(2, 'Spa', null),
      room(3, '205', 2),
      room(4, '203', 2),
      room(5, 'P1', -1)
    ]);
    expect(
      groups.map(({ floor, items }) => [floor, items.map((item) => item.id)])
    ).toEqual([
      [-1, [5]],
      [2, [4, 3]],
      [3, [1]],
      [null, [2]]
    ]);
  });
});
