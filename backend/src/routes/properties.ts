import { Router } from 'express';

import {
  createPropertySchema,
  fetchPropertiesParamsSchema,
  propertyIdParamsSchema,
  updatePropertySchema
} from '../../../shared/types/properties';
import {
  createProperty,
  deleteProperty,
  getProperties,
  getPropertyById,
  updateProperty
} from '../controllers/property-controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorization';
import {
  validateBody,
  validateParams,
  validateQuery
} from '../middleware/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Create property (admin only)
router.post(
  '/',
  requireAdmin,
  validateBody(createPropertySchema),
  createProperty
);

// Get properties
router.get('/', validateQuery(fetchPropertiesParamsSchema), getProperties);

// Get property by id
router.get('/:id', validateParams(propertyIdParamsSchema), getPropertyById);

// Update property (admin only)
router.patch(
  '/:id',
  requireAdmin,
  validateParams(propertyIdParamsSchema),
  validateBody(updatePropertySchema),
  updateProperty
);

// Delete property (admin only)
router.delete(
  '/:id',
  requireAdmin,
  validateParams(propertyIdParamsSchema),
  deleteProperty
);

export default router;
