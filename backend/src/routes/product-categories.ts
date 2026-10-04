import { Router } from 'express';

import {
  createProductCategorySchema,
  productIdParamsSchema,
  updateProductCategorySchema
} from '../../../shared/types/products';
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategories,
  getProductCategoryById,
  updateProductCategory
} from '../controllers/product-controller';
import { authenticateToken } from '../middleware/auth';
import { attachSelectedProperty } from '../middleware/selected-property';
import { validateBody, validateParams } from '../middleware/validation';

const router = Router();

// Authenticate, then resolve the caller's selected property onto the request.
// Property scope is derived server-side; the client never sends property_id.
router.use(authenticateToken);
router.use(attachSelectedProperty);

// List categories (flat; the client builds the tree from parent_id)
router.get('/', getProductCategories);

// Get category by id
router.get(
  '/:id',
  validateParams(productIdParamsSchema),
  getProductCategoryById
);

// Create category
router.post(
  '/',
  validateBody(createProductCategorySchema),
  createProductCategory
);

// Update category (rename or move)
router.patch(
  '/:id',
  validateParams(productIdParamsSchema),
  validateBody(updateProductCategorySchema),
  updateProductCategory
);

// Delete category (409 if it still has subcategories or products)
router.delete(
  '/:id',
  validateParams(productIdParamsSchema),
  deleteProductCategory
);

export default router;
