import { Router } from 'express';

import { fetchPropertiesParamsSchema } from '../../../shared/types/properties';
import { getProperties } from '../controllers/property-controller';
import { authenticateToken } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get properties
router.get('/', validateQuery(fetchPropertiesParamsSchema), getProperties);

export default router;
