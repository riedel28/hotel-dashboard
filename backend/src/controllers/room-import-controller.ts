import type { Response } from 'express';

import type {
  RoomImportFileError,
  RoomImportMode
} from '../../../shared/types/room-imports';
import { db } from '../db/pool';
import { loadPropertyRooms } from '../db/room-queries';
import { withFailMessage } from '../middleware/error';
import {
  requireSelectedProperty,
  type SelectedPropertyRequest
} from '../middleware/selected-property';
import { applyRoomImportPlan, StalePreview } from '../utils/room-import-apply';
import { readRoomFile, RoomImportFileProblem } from '../utils/room-import-file';
import { planRoomImport } from '../utils/room-import-plan';
import { isUniqueViolation } from '../utils/sql';

// Both steps take the file itself: nothing is kept on the server between the
// preview and the apply. The apply step plans again and runs only when its
// plan is the one the preview showed (same token), otherwise answers 409.
const handle = withFailMessage<SelectedPropertyRequest>;

const fileProblems: Record<RoomImportFileError, string> = {
  UNREADABLE_FILE: 'The file could not be read',
  EMPTY_FILE: 'The file has no rows',
  MISSING_COLUMNS: 'The file needs the columns "number" and "type"',
  TOO_MANY_ROWS: 'The file has too many rows'
};

// What both steps start from: the property and the rows of the uploaded
// file. Undefined after answering 400.
async function readRequest(req: SelectedPropertyRequest, res: Response) {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return undefined;

  try {
    const fileRows = await readRoomFile(
      req.file!.buffer,
      req.file!.originalname
    );
    return { propertyId, fileRows };
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
    const request = await readRequest(req, res);
    if (!request) return;

    const { mode } = req.body as { mode: RoomImportMode };
    const existing = await loadPropertyRooms(db, request.propertyId);
    res.status(200).json(planRoomImport(request.fileRows, existing, mode));
  }
);

const applyRoomImport = handle('Failed to import rooms', async (req, res) => {
  const request = await readRequest(req, res);
  if (!request) return;

  const { propertyId, fileRows } = request;
  const { mode, token } = req.body as { mode: RoomImportMode; token?: string };

  try {
    const result = await db.transaction(async (tx) => {
      const existing = await loadPropertyRooms(tx, propertyId);
      const plan = planRoomImport(fileRows, existing, mode);
      if (plan.token !== token) {
        throw new StalePreview();
      }
      return applyRoomImportPlan(tx, propertyId, plan, existing);
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
