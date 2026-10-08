import { Router } from 'express';

import {
  createCustomerSchema,
  customerIdParamsSchema,
  fetchCustomersParamsSchema,
  updateCustomerSchema
} from '../../../shared/types/customers';
import {
  createCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer
} from '../controllers/customer-controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorization';
import {
  validateBody,
  validateParams,
  validateQuery
} from '../middleware/validation';

const router = Router();

// Customers are visible to Administrators only
router.use(authenticateToken, requireAdmin);

router.get('/', validateQuery(fetchCustomersParamsSchema), getCustomers);

router.get('/:id', validateParams(customerIdParamsSchema), getCustomerById);

router.post('/', validateBody(createCustomerSchema), createCustomer);

router.patch(
  '/:id',
  validateParams(customerIdParamsSchema),
  validateBody(updateCustomerSchema),
  updateCustomer
);

export default router;
