import { Router } from 'express';

import {
  createGuestAbcEntrySchema,
  guestAbcIdParamsSchema,
  updateGuestAbcEntrySchema
} from '../../../shared/types/guest-abc';
import {
  attachSelectedProperty,
  createGuestAbcEntry,
  deleteGuestAbcEntry,
  getGuestAbcEntries,
  updateGuestAbcEntry
} from '../controllers/guest-abc-controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';

const router = Router();

// Authenticate, then resolve the caller's selected property onto the request.
// Property scope is derived server-side; the client never sends property_id.
router.use(authenticateToken);
router.use(attachSelectedProperty);

// List entries for the caller's selected property
router.get('/', getGuestAbcEntries);

// Create an entry
router.post('/', validateBody(createGuestAbcEntrySchema), createGuestAbcEntry);

// Update entry
router.patch(
  '/:id',
  validateParams(guestAbcIdParamsSchema),
  validateBody(updateGuestAbcEntrySchema),
  updateGuestAbcEntry
);

// Delete entry
router.delete(
  '/:id',
  validateParams(guestAbcIdParamsSchema),
  deleteGuestAbcEntry
);

export default router;
