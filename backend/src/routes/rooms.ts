import { Router } from 'express';

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
  getRooms,
  updateRoom
} from '../controllers/room-controller';
import { authenticateToken } from '../middleware/auth';
import {
  validateBody,
  validateParams,
  validateQuery
} from '../middleware/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Create room
router.post('/', validateBody(createRoomSchema), createRoom);

// Get rooms
router.get('/', validateQuery(fetchRoomsParamsSchema), getRooms);

// Get room by id
router.get(
  '/:id',
  validateParams(roomIdParamsSchema),
  getRoomById
);

// Update room
router.patch(
  '/:id',
  validateParams(roomIdParamsSchema),
  validateBody(updateRoomSchema),
  updateRoom
);

// Delete room
router.delete(
  '/:id',
  validateParams(roomIdParamsSchema),
  deleteRoom
);

export default router;

