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

type Field = RoomImportRow['changes'][number]['field'];
const fields: Field[] = ['name', 'room_type', 'floor'];

// What a row asks the room to be. A column the file lacks, or a floor that
// is no number, asks for nothing: the room keeps what it has.
function targetOf(row: RoomFileRow, room: ExistingRoom | undefined) {
  const floor = row.floor === undefined ? undefined : parseFloor(row.floor);
  // An empty name cell names the room by its number, as the form does
  const name =
    row.name === undefined
      ? undefined
      : row.name || room?.room_number || row.number;

  return {
    values: {
      name: name ?? room?.name ?? row.number,
      room_type: row.type || null,
      floor: floor === undefined ? (room?.floor ?? null) : floor
    },
    hasBadFloor: row.floor !== undefined && floor === undefined
  };
}

function errorsOf(
  row: RoomFileRow,
  room: ExistingRoom | undefined,
  { values, hasBadFloor }: ReturnType<typeof targetOf>,
  isDuplicate: boolean
) {
  const errors: RoomImportRowError[] = [];
  if (!row.number) errors.push('MISSING_NUMBER');
  else if (isDuplicate) errors.push('DUPLICATE_NUMBER');
  if (!row.type) errors.push('MISSING_TYPE');
  if (hasBadFloor) errors.push('INVALID_FLOOR');
  // A reservation finds its room by the name
  if (room?.has_active_reservation && values.name !== room.name) {
    errors.push('NAME_LOCKED');
  }
  return errors;
}

function statusOf(
  hasErrors: boolean,
  room: ExistingRoom | undefined,
  hasChanges: boolean
): RoomImportRow['status'] {
  if (hasErrors) return 'error';
  if (!room) return 'new';
  return hasChanges ? 'changed' : 'unchanged';
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

  // How often each number appears in the file
  const seen = new Map<string, number>();
  for (const { number } of fileRows) {
    if (number) seen.set(keyOf(number), (seen.get(keyOf(number)) ?? 0) + 1);
  }

  const rows = fileRows.map((row): RoomImportRow => {
    const room = byKey.get(keyOf(row.number));
    const target = targetOf(row, room);
    const { values } = target;
    const errors = errorsOf(
      row,
      room,
      target,
      (seen.get(keyOf(row.number)) ?? 0) > 1
    );
    const changes =
      room && errors.length === 0
        ? fields
            .filter((field) => room[field] !== values[field])
            .map((field) => ({ field, from: room[field], to: values[field] }))
        : [];

    return {
      line: row.line,
      status: statusOf(errors.length > 0, room, changes.length > 0),
      // The stored spelling wins over the file's (12a for an existing 12A)
      room_number: room?.room_number ?? row.number,
      ...values,
      is_new_type: Boolean(row.type) && !knownTypes.has(row.type),
      errors,
      changes
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
