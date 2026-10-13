import { createHash } from 'node:crypto';

import type {
  RoomImportMode,
  RoomImportPreview,
  RoomImportRow,
  RoomImportRowError
} from '../../../shared/types/room-imports';
import type { RoomFileRow } from './room-import-file';

export interface ExistingRoom {
  id: number;
  room_number: string;
  name: string;
  room_type: string | null;
  floor: number | null;
  has_active_reservation: boolean;
}

// Numbers are matched the way the unique index sees them
const keyOf = (roomNumber: string) => roomNumber.trim().toLowerCase();

// '' clears the floor; undefined marks text that is no whole number
function parseFloor(text: string) {
  if (text === '') return null;
  return /^-?\d+$/.test(text) ? Number(text) : undefined;
}

/**
 * What importing `fileRows` into `existing` would do. Pure: the preview shows
 * it and the apply step runs it, and the token ties the two together.
 */
export function planRoomImport(
  fileRows: RoomFileRow[],
  existing: ExistingRoom[],
  mode: RoomImportMode
): RoomImportPreview {
  const byKey = new Map(
    existing.map((room) => [keyOf(room.room_number), room])
  );
  const knownTypes = new Set(existing.map((room) => room.room_type));

  const seen = new Map<string, number>();
  for (const row of fileRows) {
    if (row.number) {
      seen.set(keyOf(row.number), (seen.get(keyOf(row.number)) ?? 0) + 1);
    }
  }

  const rows = fileRows.map((row): RoomImportRow => {
    const room = byKey.get(keyOf(row.number));
    const floor = row.floor === undefined ? undefined : parseFloor(row.floor);
    // An empty name cell names the room by its number, as the form does
    const name =
      row.name === undefined
        ? undefined
        : row.name || room?.room_number || row.number;

    const errors: RoomImportRowError[] = [];
    if (!row.number) errors.push('MISSING_NUMBER');
    else if (seen.get(keyOf(row.number))! > 1) errors.push('DUPLICATE_NUMBER');
    if (!row.type) errors.push('MISSING_TYPE');
    if (row.floor !== undefined && floor === undefined) {
      errors.push('INVALID_FLOOR');
    }
    if (
      room?.has_active_reservation &&
      name !== undefined &&
      name !== room.name
    ) {
      errors.push('NAME_LOCKED');
    }

    // A column the file lacks leaves the room's value alone
    const target = {
      name: name ?? room?.name ?? row.number,
      room_type: row.type || null,
      floor: floor === undefined ? (room?.floor ?? null) : floor
    };
    const changes = room
      ? (['name', 'room_type', 'floor'] as const)
          .filter((field) => room[field] !== target[field])
          .map((field) => ({ field, from: room[field], to: target[field] }))
      : [];

    return {
      line: row.line,
      status: errors.length
        ? 'error'
        : !room
          ? 'new'
          : changes.length
            ? 'changed'
            : 'unchanged',
      // The stored spelling wins over the file's (12a for an existing 12A)
      room_number: room?.room_number ?? row.number,
      ...target,
      is_new_type: Boolean(row.type) && !knownTypes.has(row.type),
      errors,
      changes: errors.length ? [] : changes
    };
  });

  // A room whose row is in error is still in the file: a typo in its type
  // must not delete it
  const deletions =
    mode === 'replace'
      ? existing
          .filter((room) => !seen.has(keyOf(room.room_number)))
          .map(({ id, room_number, name, has_active_reservation }) => ({
            id,
            room_number,
            name,
            has_active_reservation
          }))
      : [];

  const count = (status: RoomImportRow['status']) =>
    rows.filter((row) => row.status === status).length;
  const plan = { mode, rows, deletions };

  return {
    ...plan,
    token: createHash('sha256').update(JSON.stringify(plan)).digest('hex'),
    summary: {
      create: count('new'),
      update: count('changed'),
      unchanged: count('unchanged'),
      errors: count('error'),
      delete: deletions.filter((room) => !room.has_active_reservation).length
    }
  };
}
