import { Router } from 'express';

import {
  checkinBackgroundMaxBytes,
  saveCheckinSettingsSchema,
  setCheckinEnabledSchema
} from '../../../shared/types/checkin';
import { imageExtensions } from '../../../shared/types/images';
import {
  getCheckinSettings,
  saveCheckinSettings,
  setCheckinEnabled
} from '../controllers/checkin-controller';
import { uploadImage } from '../controllers/image-controller';
import { authenticateToken } from '../middleware/auth';
import { attachSelectedProperty } from '../middleware/selected-property';
import { upload } from '../middleware/upload';
import { validateBody } from '../middleware/validation';

const router = Router();

// Authenticate, then resolve the caller's selected property onto the request.
// Property scope is derived server-side; the client never sends property_id.
router.use(authenticateToken);
router.use(attachSelectedProperty);

router.get('/', getCheckinSettings);

// Save the form
router.put('/', validateBody(saveCheckinSettingsSchema), saveCheckinSettings);

// Switch online check-in on or off, at once and apart from the form
router.put(
  '/enabled',
  validateBody(setCheckinEnabledSchema),
  setCheckinEnabled
);

// The guest app's background, into the image store (GET /cms/images/:id)
router.post(
  '/background',
  upload({ maxBytes: checkinBackgroundMaxBytes, extensions: imageExtensions }),
  uploadImage
);

export default router;
