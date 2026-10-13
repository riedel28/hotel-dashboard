import Papa from 'papaparse';
import { readSheet } from 'read-excel-file/node';

import {
  ROOM_IMPORT_MAX_ROWS,
  type RoomImportFileError
} from '../../../shared/types/room-imports';

// A row of the file as typed: every cell trimmed text, '' when empty. `name`
// and `floor` are undefined when the file has no such column.
export interface RoomFileRow {
  line: number;
  number: string;
  type: string;
  name?: string;
  floor?: string;
}

export class RoomImportFileProblem extends Error {
  constructor(public code: RoomImportFileError) {
    super(code);
  }
}

const cellText = (cell: unknown) =>
  cell === null || cell === undefined ? '' : String(cell).trim();

async function readCells(buffer: Buffer, filename: string) {
  try {
    if (filename.toLowerCase().endsWith('.xlsx')) {
      // The first sheet
      return (await readSheet(buffer)) as unknown[][];
    }
    // TextDecoder drops a leading BOM; Excel in many locales writes ';'
    const text = new TextDecoder('utf-8').decode(buffer);
    return Papa.parse<string[]>(text, {
      skipEmptyLines: 'greedy',
      delimitersToGuess: [',', ';', '\t']
    }).data;
  } catch {
    throw new RoomImportFileProblem('UNREADABLE_FILE');
  }
}

/** The data rows of a CSV or XLSX file, or a RoomImportFileProblem. */
export async function readRoomFile(
  buffer: Buffer,
  filename: string
): Promise<RoomFileRow[]> {
  const [header, ...body] = await readCells(buffer, filename);
  if (!header) {
    throw new RoomImportFileProblem('EMPTY_FILE');
  }

  // Headers in any order and case; columns the import does not know are ignored
  const columns = header.map((cell) => cellText(cell).toLowerCase());
  const at = (name: string) => columns.indexOf(name);
  const [number, type, name, floor] = ['number', 'type', 'name', 'floor'].map(
    at
  );
  if (number < 0 || type < 0) {
    throw new RoomImportFileProblem('MISSING_COLUMNS');
  }

  const rows = body
    .map((cells, index) => ({ cells: cells.map(cellText), line: index + 2 }))
    .filter(({ cells }) => cells.some(Boolean));
  if (rows.length === 0) {
    throw new RoomImportFileProblem('EMPTY_FILE');
  }
  if (rows.length > ROOM_IMPORT_MAX_ROWS) {
    throw new RoomImportFileProblem('TOO_MANY_ROWS');
  }

  return rows.map(({ cells, line }) => ({
    line,
    number: cells[number] ?? '',
    type: cells[type] ?? '',
    ...(name >= 0 && { name: cells[name] ?? '' }),
    ...(floor >= 0 && { floor: cells[floor] ?? '' })
  }));
}
