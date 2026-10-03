import { Router } from 'express';

import {
  createProductSchema,
  fetchProductsParamsSchema,
  productIdParamsSchema,
  updateProductSchema
} from '../../../shared/types/products';
import { attachSelectedProperty } from '../controllers/guest-abc-controller';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from '../controllers/product-controller';
import { authenticateToken } from '../middleware/auth';
import {
  validateBody,
  validateParams,
  validateQuery
} from '../middleware/validation';

const router = Router();

// Authenticate, then resolve the caller's selected property onto the request.
router.use(authenticateToken);
router.use(attachSelectedProperty);

// List products, optionally filtered by ?category_id (that category only)
router.get('/', validateQuery(fetchProductsParamsSchema), getProducts);

// Get product by id
router.get('/:id', validateParams(productIdParamsSchema), getProductById);

// Create product
router.post('/', validateBody(createProductSchema), createProduct);

// Update product
router.patch(
  '/:id',
  validateParams(productIdParamsSchema),
  validateBody(updateProductSchema),
  updateProduct
);

// Delete product
router.delete('/:id', validateParams(productIdParamsSchema), deleteProduct);

export default router;
