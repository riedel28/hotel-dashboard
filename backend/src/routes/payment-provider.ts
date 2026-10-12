import { Router } from 'express';

import { savePaymentProviderSchema } from '../../../shared/types/payment-provider';
import {
  getPaymentProvider,
  savePaymentProvider
} from '../controllers/payment-provider-controller';
import { authenticateToken } from '../middleware/auth';
import { attachSelectedProperty } from '../middleware/selected-property';
import { validateBody } from '../middleware/validation';

const router = Router();

// Authenticate, then resolve the caller's selected property onto the request.
// Property scope is derived server-side; the client never sends property_id.
router.use(authenticateToken);
router.use(attachSelectedProperty);

// The selected property's payment provider, or null when none is set up
router.get('/', getPaymentProvider);

// Set up the provider or update its configuration
router.put('/', validateBody(savePaymentProviderSchema), savePaymentProvider);

export default router;
