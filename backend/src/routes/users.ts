import { Router } from 'express';

import { updateProfileSchema } from '../../../shared/types/profile';
import {
  createUserSchema,
  fetchUserByIdSchema,
  fetchUsersParamsSchema,
  inviteUserSchema,
  updateSelectedPropertySchema,
  updateUserSchema,
  userIdParamsSchema
} from '../../../shared/types/users';
import {
  createUser,
  deleteUser,
  getMe,
  getUserById,
  getUsers,
  inviteUser,
  resendInvitation,
  updateMe,
  updateSelectedProperty,
  updateUser
} from '../controllers/user-controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, requireSelfOrAdmin } from '../middleware/authorization';
import { forbidDemo, guardDemoUserEdit } from '../middleware/demo';
import {
  validateBody,
  validateParams,
  validateQuery
} from '../middleware/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Invite user (admin only)
router.post(
  '/invite',
  requireAdmin,
  forbidDemo,
  validateBody(inviteUserSchema),
  inviteUser
);

// Resend invitation (admin only)
router.post(
  '/invite/:id/resend',
  requireAdmin,
  forbidDemo,
  validateParams(userIdParamsSchema),
  resendInvitation
);

// Create user (admin only)
router.post('/', requireAdmin, validateBody(createUserSchema), createUser);

// Get users (paginated)
router.get('/', validateQuery(fetchUsersParamsSchema), getUsers);

// Update current user's selected property
router.patch(
  '/me/selected-property',
  validateBody(updateSelectedPropertySchema),
  updateSelectedProperty
);

// Current user's own profile. Declared before '/:id' so "me" isn't parsed as an id.
router.get('/me', getMe);
router.patch('/me', validateBody(updateProfileSchema), updateMe);

// Get user by id — a user may read their own record, admins may read anyone's
router.get(
  '/:id',
  validateParams(fetchUserByIdSchema),
  requireSelfOrAdmin(),
  getUserById
);

// Update user (admin only; users edit themselves via PATCH /me)
router.patch(
  '/:id',
  requireAdmin,
  validateParams(userIdParamsSchema),
  validateBody(updateUserSchema),
  guardDemoUserEdit,
  updateUser
);

// Delete user (admin only)
router.delete(
  '/:id',
  requireAdmin,
  validateParams(userIdParamsSchema),
  guardDemoUserEdit,
  deleteUser
);

export default router;
