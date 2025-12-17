import { Router } from 'express';

import {
  createUserSchema,
  fetchUserByIdSchema,
  fetchUsersParamsSchema,
  updateUserSchema,
  userIdParamsSchema
} from '../../../shared/types/users';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser
} from '../controllers/user-controller';
import { authenticateToken } from '../middleware/auth';
import {
  validateBody,
  validateParams,
  validateQuery
} from '../middleware/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Create user
router.post('/', validateBody(createUserSchema), createUser);

// Get users (paginated)
router.get('/', validateQuery(fetchUsersParamsSchema), getUsers);

// Get user by id
router.get('/:id', validateParams(fetchUserByIdSchema), getUserById);

// Update user
router.patch(
  '/:id',
  validateParams(userIdParamsSchema),
  validateBody(updateUserSchema),
  updateUser
);

// Delete user
router.delete('/:id', validateParams(userIdParamsSchema), deleteUser);

export default router;
