import { Router } from 'express';

import {
  fetchPaymentsParamsSchema,
  paymentIdParamsSchema
} from '../../../shared/types/payments';
import { getPaymentById, getPayments } from '../controllers/payment-controller';
import { authenticateToken } from '../middleware/auth';
import { validateParams, validateQuery } from '../middleware/validation';

// Read-only: payments come from the gateway, nothing here changes them
const router = Router();

router.use(authenticateToken);

router.get('/', validateQuery(fetchPaymentsParamsSchema), getPayments);

router.get('/:id', validateParams(paymentIdParamsSchema), getPaymentById);

export default router;
