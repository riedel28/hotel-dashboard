import { type RequestHandler, Router } from 'express';
import rateLimit from 'express-rate-limit';

import {
  assignDeviceRoomSchema,
  claimDeviceSchema,
  deviceIdParamsSchema
} from '../../../shared/types/devices';
import env from '../../env';
import {
  assignDeviceRoom,
  claimDevice,
  getDeviceRoomOptions,
  getDevices
} from '../controllers/device-controller';
import { authenticateToken } from '../middleware/auth';
import { attachSelectedProperty } from '../middleware/selected-property';
import { validateBody, validateParams } from '../middleware/validation';

const router = Router();

// Claiming checks a PIN, so it gets the auth routes' stricter limit against
// guessing (disabled in test environment, like the other limiters).
const claimLimiter: RequestHandler =
  env.NODE_ENV === 'test'
    ? (_req, _res, next) => next()
    : rateLimit({
        windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
        max: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { error: 'Too many attempts, please try again later' }
      });

// Authenticate, then resolve the caller's selected property onto the request.
router.use(authenticateToken);
router.use(attachSelectedProperty);

// List the property's devices
router.get('/', getDevices);

// Rooms a device can be assigned to
router.get('/room-options', getDeviceRoomOptions);

// Add a device to the property by serial number and PIN
router.post(
  '/claim',
  claimLimiter,
  validateBody(claimDeviceSchema),
  claimDevice
);

// Assign the device to a room, move it, or unassign it (room_id: null)
router.patch(
  '/:id',
  validateParams(deviceIdParamsSchema),
  validateBody(assignDeviceRoomSchema),
  assignDeviceRoom
);

export default router;
