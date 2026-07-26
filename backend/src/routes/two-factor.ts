import { Router } from 'express';

import {
  regenerateRecoveryCodesSchema,
  twoFactorDisableSchema,
  twoFactorEnableSchema,
  twoFactorSetupSchema
} from '../../../shared/types/profile';
import {
  disable,
  enable,
  getStatus,
  regenerateRecoveryCodes,
  setup
} from '../controllers/two-factor-controller';
import { authenticateToken } from '../middleware/auth';
import { requireFreshAuth } from '../middleware/require-fresh-auth';
import { validateBody } from '../middleware/validation';

const router = Router();

router.use(authenticateToken);

router.get('/', getStatus);

// Everything below changes the account's security posture, so a valid session
// alone isn't enough — see middleware/require-fresh-auth.
router.post(
  '/setup',
  validateBody(twoFactorSetupSchema),
  requireFreshAuth,
  setup
);

router.post(
  '/enable',
  validateBody(twoFactorEnableSchema),
  requireFreshAuth,
  enable
);

router.post(
  '/disable',
  validateBody(twoFactorDisableSchema),
  requireFreshAuth,
  disable
);

router.post(
  '/recovery-codes',
  validateBody(regenerateRecoveryCodesSchema),
  requireFreshAuth,
  regenerateRecoveryCodes
);

export default router;
