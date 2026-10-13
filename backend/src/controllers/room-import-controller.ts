import { and, asc, eq, inArray, not, sql } from 'drizzle-orm';
import type { Response } from 'express';

import type { RoomImportMode } from '../../../shared/types/room-imports';
import { db } from '../db/pool';
import { rooms } from '../db/schema';
import { withFailMessage } from '../middleware/error';
import {
  requireSelectedProperty,
  type SelectedPropertyRequest
} from '../middleware/selected-property';
import { readRoomFile, RoomImportFileProblem } from '../utils/room-import-file';
import { planRoomImport } from '../utils/room-import-plan';
import { isUniqueViolation } from '../utils/sql';
import { hasActiveReservation, naturalRoomNumber } from './room-controller';

// Both steps take the file itself: nothing is kept on the server between the
// preview and the apply. The apply step plans again and runs only when its
// plan is the one the preview showed (same token), otherwise answers 409.
const handle = withFailMessage<SelectedPropertyRequest>;

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const BATCH = 500;
const batches = <T>(items: T[]) =>
  Array.from({ length: Math.ceil(items.length / BATCH) }, (_, index) =>
    items.slice(index * BATCH, (index + 1) * BATCH)
  );

const fileProblems = {
  FILE_REQUIRED: 'No file uploaded',
  FILE_TOO_LARGE: 'File is too large',
  UNSUPPORTED_FILE: 'Unsupported file type',
  UNREADABLE_FILE: 'The file could not be read',
  EMPTY_FILE: 'The file has no rows',
  MISSING_COLUMNS: 'The file needs the columns "number" and "type"',
  TOO_MANY_ROWS: 'The file has too many rows'
};

const loadRooms = (executor: typeof db | Transaction, propertyId: string) =>
  executor
    .select({
      id: rooms.id,
      room_number: rooms.room_number,
      name: rooms.name,
      room_type: rooms.room_type,
      floor: rooms.floor,
      has_active_reservation: hasActiveReservation
    })
    .from(rooms)
    .where(eq(rooms.property_id, propertyId))
    .orderBy(asc(naturalRoomNumber));

// The rows of the uploaded file, or undefined after answering 400
async function readUpload(req: SelectedPropertyRequest, res: Response) {
  try {
    return await readRoomFile(req.file!.buffer, req.file!.originalname);
  } catch (error) {
    if (error instanceof RoomImportFileProblem) {
      res
        .status(400)
        .json({ error: fileProblems[error.code], code: error.code });
      return undefined;
    }
    throw error;
  }
}

const previewRoomImport = handle(
  'Failed to preview the import',
  async (req, res) => {
    const propertyId = requireSelectedProperty(req, res);
    if (!propertyId) return;
    const fileRows = await readUpload(req, res);
    if (!fileRows) return;

    const { mode } = req.body as { mode: RoomImportMode };
    res
      .status(200)
      .json(planRoomImport(fileRows, await loadRooms(db, propertyId), mode));
  }
);

class StalePreview extends Error {}

const applyRoomImport = handle('Failed to import rooms', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;
  const fileRows = await readUpload(req, res);
  if (!fileRows) return;

  const { mode, token } = req.body as { mode: RoomImportMode; token?: string };

  try {
    // All of it or none of it
    const result = await db.transaction(async (tx) => {
      const existing = await loadRooms(tx, propertyId);
      const plan = planRoomImport(fileRows, existing, mode);
      if (plan.token !== token) {
        throw new StalePreview();
      }

      const created = plan.rows.filter((row) => row.status === 'new');
      for (const batch of batches(created)) {
        await tx.insert(rooms).values(
          batch.map((row) => ({
            property_id: propertyId,
            room_number: row.room_number,
            name: row.name ?? row.room_number,
            room_type: row.room_type,
            floor: row.floor
          }))
        );
      }

      const idOf = new Map(existing.map((room) => [room.room_number, room.id]));
      const updated = plan.rows.filter((row) => row.status === 'changed');
      for (const batch of batches(updated)) {
        const values = sql.join(
          batch.map(
            (row) =>
              sql`(${idOf.get(row.room_number)}::bigint, ${row.name}::text, ${row.room_type}::text, ${row.floor}::integer)`
          ),
          sql`, `
        );
        await tx.execute(sql`
          update rooms
          set name = v.name, room_type = v.room_type, floor = v.floor,
              updated_at = now()
          from (values ${values}) as v(id, name, room_type, floor)
          where rooms.id = v.id and rooms.property_id = ${propertyId}
        `);
      }

      const deletable = plan.deletions
        .filter((room) => !room.has_active_reservation)
        .map((room) => room.id);
      if (deletable.length) {
        const deleted = await tx
          .delete(rooms)
          .where(
            and(
              eq(rooms.property_id, propertyId),
              inArray(rooms.id, deletable),
              not(hasActiveReservation)
            )
          )
          .returning({ id: rooms.id });
        // A reservation arrived after the plan was read
        if (deleted.length !== deletable.length) {
          throw new StalePreview();
        }
      }

      return {
        created: created.length,
        updated: updated.length,
        deleted: deletable.length,
        skipped: plan.summary.errors + plan.deletions.length - deletable.length
      };
    });

    res.status(200).json(result);
  } catch (error) {
    // A room created meanwhile under a number the plan wanted is stale too
    if (error instanceof StalePreview || isUniqueViolation(error)) {
      return res.status(409).json({
        error: 'The rooms have changed since the preview',
        code: 'IMPORT_PREVIEW_STALE'
      });
    }
    throw error;
  }
});

export { applyRoomImport, previewRoomImport };
