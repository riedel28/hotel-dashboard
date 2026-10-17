import { Router } from 'express';

import {
  eventIdParamsSchema,
  eventImageMaxBytes,
  fetchEventsParamsSchema,
  saveEventSchema
} from '../../../shared/types/events';
import { imageExtensions } from '../../../shared/types/images';
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent
} from '../controllers/event-controller';
import { uploadImage } from '../controllers/image-controller';
import { authenticateToken } from '../middleware/auth';
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

// Into the image store, served by GET /cms/images/:id; event photos may be
// larger than the CMS's own.
router.post(
  '/images',
  upload({ maxBytes: eventImageMaxBytes, extensions: imageExtensions }),
  uploadImage
);

router.get('/', validateQuery(fetchEventsParamsSchema), getEvents);

router.post('/', validateBody(saveEventSchema), createEvent);

router.get('/:id', validateParams(eventIdParamsSchema), getEventById);

router.put(
  '/:id',
  validateParams(eventIdParamsSchema),
  validateBody(saveEventSchema),
  updateEvent
);

router.delete('/:id', validateParams(eventIdParamsSchema), deleteEvent);

export default router;
