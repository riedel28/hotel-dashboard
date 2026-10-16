import { Router } from 'express';

import {
  eventIdParamsSchema,
  eventImageExtensions,
  eventImageMaxBytes,
  fetchEventsParamsSchema,
  saveEventSchema
} from '../../../shared/types/events';
import { uploadCmsImage } from '../controllers/cms-controller';
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent
} from '../controllers/event-controller';
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

// Into the CMS image store, served by GET /cms/images/:id; event photos may
// be larger than the CMS's own.
router.post(
  '/images',
  upload({ maxBytes: eventImageMaxBytes, extensions: eventImageExtensions }),
  uploadCmsImage
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
