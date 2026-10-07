import { Router } from 'express';

import {
  fetchMonitoringLogsParamsSchema,
  monitoringLogIdParamsSchema
} from '../../../shared/types/monitoring';
import {
  getMonitoringLogById,
  getMonitoringLogs
} from '../controllers/monitoring-controller';
import { authenticateToken } from '../middleware/auth';
import { validateParams, validateQuery } from '../middleware/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get monitoring logs
router.get(
  '/',
  validateQuery(fetchMonitoringLogsParamsSchema),
  getMonitoringLogs
);

// Get one monitoring log
router.get(
  '/:id',
  validateParams(monitoringLogIdParamsSchema),
  getMonitoringLogById
);

export default router;
