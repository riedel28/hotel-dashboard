import { describe, expect, test } from 'vitest';

import {
  type ExistingRoom,
  planRoomImport
} from '../src/utils/room-import-plan';

const room = (
  id: number,
  room_number: string,
  extra: Partial<ExistingRoom> = {}
): ExistingRoom => ({
  id,
  room_number,
  name: `Room ${room_number}`,
  room_type: 'Standard',
  floor: 1,
  has_active_reservation: false,
  ...extra
});

const row = (line: number, number: string, type = 'Standard', extra = {}) => ({
  line,
  number,
  type,
  ...extra
});

describe('planRoomImport', () => {
  test('sorts rows into new, changed and unchanged', () => {
    const plan = planRoomImport(
      [
        row(2, '101'),
        row(3, '102', 'Suite', { floor: '', name: '' }),
        row(4, '12a', 'Loft', { floor: '-1', name: 'Cellar' })
      ],
      [room(1, '101'), room(2, '102')],
      'merge'
    );

    expect(plan.rows.map((r) => r.status)).toEqual([
      'unchanged',
      'changed',
      'new'
    ]);
    // An empty cell clears: the floor to nothing, the name to the number
    expect(plan.rows[1].changes).toEqual([
      { field: 'name', from: 'Room 102', to: '102' },
      { field: 'room_type', from: 'Standard', to: 'Suite' },
      { field: 'floor', from: 1, to: null }
    ]);
    expect(plan.rows[2]).toMatchObject({
      name: 'Cellar',
      floor: -1,
      is_new_type: true
    });
    expect(plan.summary).toEqual({
      create: 1,
      update: 1,
      unchanged: 1,
      errors: 0,
      delete: 0
    });
    expect(plan.deletions).toEqual([]);
  });

  test('a missing column leaves the value alone', () => {
    const [changed] = planRoomImport(
      [row(2, '101', 'Suite')],
      [room(1, '101', { floor: 4 })],
      'merge'
    ).rows;
    expect(changed.changes).toEqual([
      { field: 'room_type', from: 'Standard', to: 'Suite' }
    ]);
    expect(changed).toMatchObject({ name: 'Room 101', floor: 4 });
  });

  test('matches numbers whatever their case and keeps the stored spelling', () => {
    const [matched] = planRoomImport(
      [row(2, ' 12a')],
      [room(1, '12A')],
      'merge'
    ).rows;
    expect(matched).toMatchObject({ status: 'unchanged', room_number: '12A' });
  });

  test('reports row errors', () => {
    const plan = planRoomImport(
      [
        row(2, '', 'Suite'),
        row(3, '101', ''),
        row(4, '102', 'Suite', { floor: '1.5' }),
        row(5, '7'),
        row(6, '7'),
        row(7, '103', 'Standard', { name: 'Garden' })
      ],
      [room(1, '103', { has_active_reservation: true })],
      'merge'
    );
    expect(plan.rows.map((r) => r.errors)).toEqual([
      ['MISSING_NUMBER'],
      ['MISSING_TYPE'],
      ['INVALID_FLOOR'],
      ['DUPLICATE_NUMBER'],
      ['DUPLICATE_NUMBER'],
      ['NAME_LOCKED']
    ]);
    expect(plan.summary.errors).toBe(6);
  });

  test('replace deletes the rooms the file leaves out', () => {
    const plan = planRoomImport(
      [row(2, '101'), row(3, '102', '')],
      [
        room(1, '101'),
        // In the file, though its row is in error
        room(2, '102'),
        room(3, '103'),
        room(4, '104', { has_active_reservation: true })
      ],
      'replace'
    );
    expect(
      plan.deletions.map((r) => [r.room_number, r.has_active_reservation])
    ).toEqual([
      ['103', false],
      ['104', true]
    ]);
    // The room kept by its reservation is not counted
    expect(plan.summary.delete).toBe(1);
  });

  test('the token changes with the plan and only with it', () => {
    const rows = [row(2, '101', 'Suite')];
    const token = (
      existing: ExistingRoom[],
      mode: 'merge' | 'replace' = 'merge'
    ) => planRoomImport(rows, existing, mode).token;

    expect(token([room(1, '101')])).toBe(token([room(1, '101')]));
    expect(token([room(1, '101')])).not.toBe(
      token([room(1, '101')], 'replace')
    );
    expect(token([room(1, '101')])).not.toBe(
      token([room(1, '101', { room_type: 'Suite' })])
    );
  });
});
