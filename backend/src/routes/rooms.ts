import { Router } from 'express';

import {
  ROOM_IMPORT_EXTENSIONS,
  ROOM_IMPORT_MAX_BYTES,
  roomImportBodySchema
} from '../../../shared/types/room-imports';
import {
  createRoomSchema,
  fetchRoomsParamsSchema,
  roomIdParamsSchema,
  updateRoomSchema
} from '../../../shared/types/rooms';
import {
  createRoom,
  deleteRoom,
  getRoomById,
  getRoomFilterOptions,
  getRooms,
  updateRoom
} from '../controllers/room-controller';
import {
  applyRoomImport,
  previewRoomImport
} from '../controllers/room-import-controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorization';
import { attachSelectedProperty } from '../middleware/selected-property';
import { upload } from '../middleware/upload';
import {
  validateBody,
  validateParams,
  validateQuery
} from '../middleware/validation';

const router = Router();

// Authenticate, then resolve the caller's selected property onto the request.
router.use(authenticateToken);
router.use(attachSelectedProperty);

// Create room (admin only)
router.post('/', requireAdmin, validateBody(createRoomSchema), createRoom);

// Import from CSV or XLSX (admin only): the preview plans, the apply runs the
// plan the preview showed. Both take the file as multipart field `file`.
const importUpload = [
  requireAdmin,
  upload({
    maxBytes: ROOM_IMPORT_MAX_BYTES,
    extensions: ROOM_IMPORT_EXTENSIONS
  }),
  validateBody(roomImportBodySchema)
];
router.post('/import/preview', importUpload, previewRoomImport);
router.post('/import/apply', importUpload, applyRoomImport);

// Get rooms
router.get('/', validateQuery(fetchRoomsParamsSchema), getRooms);

// Types and floors in use, for the filters and the form
router.get('/filter-options', getRoomFilterOptions);

// Get room by id
router.get('/:id', validateParams(roomIdParamsSchema), getRoomById);

// Update room (admin only)
router.patch(
  '/:id',
  requireAdmin,
  validateParams(roomIdParamsSchema),
  validateBody(updateRoomSchema),
  updateRoom
);

// Delete room (admin only)
router.delete(
  '/:id',
  requireAdmin,
  validateParams(roomIdParamsSchema),
  deleteRoom
);

export default router;
