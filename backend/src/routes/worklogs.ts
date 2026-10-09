import { Router } from 'express';

import {
  worklogMessageSchema,
  worklogParamsSchema
} from '../../../shared/types/worklogs';
import {
  createWorklog,
  deleteWorklog,
  getWorklogs,
  requireProperty,
  updateWorklog
} from '../controllers/worklog-controller';
import { validateBody, validateParams } from '../middleware/validation';

// Mounted under /properties/:id/worklogs, which authenticates, requires an
// admin and validates `:id` — mergeParams brings that `:id` in here.
const router = Router({ mergeParams: true });

router.get('/', requireProperty, getWorklogs);

router.post(
  '/',
  requireProperty,
  validateBody(worklogMessageSchema),
  createWorklog
);

router.patch(
  '/:worklogId',
  validateParams(worklogParamsSchema),
  validateBody(worklogMessageSchema),
  updateWorklog
);

router.delete(
  '/:worklogId',
  validateParams(worklogParamsSchema),
  deleteWorklog
);

export default router;
