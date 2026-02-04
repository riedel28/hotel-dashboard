import { Router } from 'express';

import { fetchMonitoringLogsParamsSchema } from '../../../shared/types/monitoring';
import { getMonitoringLogs } from '../controllers/monitoring-controller';
import { authenticateToken } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get monitoring logs
router.get(
  '/',
  validateQuery(fetchMonitoringLogsParamsSchema),
  getMonitoringLogs
);

export default router;
