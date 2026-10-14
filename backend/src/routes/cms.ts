import { Router } from 'express';

import {
  cmsImageExtensions,
  cmsImageIdParamsSchema,
  cmsImageMaxBytes,
  cmsNodeIdParamsSchema,
  createCmsNodeSchema,
  moveCmsNodeSchema,
  saveCmsNodeSchema,
  setCmsNodeVisibilitySchema
} from '../../../shared/types/cms';
import {
  createCmsNode,
  deleteCmsNode,
  duplicateCmsNode,
  getCmsImage,
  getCmsNodes,
  moveCmsNode,
  saveCmsNode,
  setCmsNodeVisibility,
  uploadCmsImage
} from '../controllers/cms-controller';
import { authenticateToken } from '../middleware/auth';
import { attachSelectedProperty } from '../middleware/selected-property';
import { upload } from '../middleware/upload';
import { validateBody, validateParams } from '../middleware/validation';

const router = Router();

// Public, before authentication: the mobile app loads images without a login.
router.get('/images/:id', validateParams(cmsImageIdParamsSchema), getCmsImage);

// Authenticate, then resolve the caller's selected property onto the request.
// Property scope is derived server-side; the client never sends property_id.
router.use(authenticateToken);
router.use(attachSelectedProperty);

router.post(
  '/images',
  upload({ maxBytes: cmsImageMaxBytes, extensions: cmsImageExtensions }),
  uploadCmsImage
);

// Every node of the property, flat; the client builds the tree from parent_id
router.get('/nodes', getCmsNodes);

router.post('/nodes', validateBody(createCmsNodeSchema), createCmsNode);

// Save the editor form
router.put(
  '/nodes/:id',
  validateParams(cmsNodeIdParamsSchema),
  validateBody(saveCmsNodeSchema),
  saveCmsNode
);

// Reorder or move to another parent
router.post(
  '/nodes/:id/move',
  validateParams(cmsNodeIdParamsSchema),
  validateBody(moveCmsNodeSchema),
  moveCmsNode
);

router.patch(
  '/nodes/:id/visibility',
  validateParams(cmsNodeIdParamsSchema),
  validateBody(setCmsNodeVisibilitySchema),
  setCmsNodeVisibility
);

router.post(
  '/nodes/:id/duplicate',
  validateParams(cmsNodeIdParamsSchema),
  duplicateCmsNode
);

router.delete(
  '/nodes/:id',
  validateParams(cmsNodeIdParamsSchema),
  deleteCmsNode
);

export default router;
