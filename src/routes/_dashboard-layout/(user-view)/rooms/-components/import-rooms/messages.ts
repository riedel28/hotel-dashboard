import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import type {
  RoomImportFileError,
  RoomImportRow,
  RoomImportRowError
} from 'shared/types/room-imports';
import type { UploadError } from 'shared/types/uploads';

// Everything the import says about a file, its rows and their changes.
// Descriptors, resolved with t() where they are shown.

/** Why a file is refused, by the code the server (or the browser check) gives. */
const fileProblems: Partial<
  Record<RoomImportFileError | UploadError, MessageDescriptor>
> = {
  FILE_TOO_LARGE: msg`The file is larger than 5 MB.`,
  UNSUPPORTED_FILE: msg`Only .csv and .xlsx files can be imported.`,
  UNREADABLE_FILE: msg`The file could not be read. Check that it is a valid CSV or XLSX file.`,
  EMPTY_FILE: msg`The file has no rows.`,
  MISSING_COLUMNS: msg`The file needs the columns "number" and "type".`,
  TOO_MANY_ROWS: msg`The file has more than 5000 rows.`
};

const fileCheckFailed = msg`The file could not be checked. Try again.`;

/** What to say about a refused file; a code not listed gets the general message. */
export const fileProblemOf = (code: string | undefined) =>
  new Map<string, MessageDescriptor>(Object.entries(fileProblems)).get(
    code ?? ''
  ) ?? fileCheckFailed;

export const rowErrors: Record<RoomImportRowError, MessageDescriptor> = {
  MISSING_NUMBER: msg`No room number`,
  MISSING_TYPE: msg`No room type`,
  INVALID_FLOOR: msg`The floor is not a whole number`,
  DUPLICATE_NUMBER: msg`The number appears more than once in the file`,
  NAME_LOCKED: msg`The room has an active reservation and cannot be renamed`
};

export const statusLabels: Record<RoomImportRow['status'], MessageDescriptor> =
  {
    new: msg`New`,
    changed: msg`Changed`,
    unchanged: msg`Unchanged`,
    error: msg`Error`
  };

export const fieldLabels: Record<
  RoomImportRow['changes'][number]['field'],
  MessageDescriptor
> = {
  name: msg`Name`,
  room_type: msg`Type`,
  floor: msg`Floor`
};

/** The columns of the file, in the order the templates have them. */
export const fileColumns: {
  name: string;
  required: boolean;
  description: MessageDescriptor;
}[] = [
  {
    name: 'number',
    required: true,
    description: msg`Room number, e.g. 12A. Rooms are matched by it.`
  },
  {
    name: 'type',
    required: true,
    description: msg`Room type, e.g. Standard or Suite.`
  },
  {
    name: 'name',
    required: false,
    description: msg`An empty cell names the room by its number.`
  },
  {
    name: 'floor',
    required: false,
    description: msg`A whole number; an empty cell clears the floor.`
  }
];
