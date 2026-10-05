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
import {
  requireAdmin,
  requireSelfOrAdmin,
  stripAdminFields
} from '../middleware/authorization';
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
  validateBody(inviteUserSchema),
  inviteUser
);

// Resend invitation (admin only)
router.post(
  '/invite/:id/resend',
  requireAdmin,
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

// Update user (strip admin fields for non-admins to prevent privilege escalation)
router.patch(
  '/:id',
  stripAdminFields,
  validateParams(userIdParamsSchema),
  validateBody(updateUserSchema),
  updateUser
);

// Delete user (admin only)
router.delete(
  '/:id',
  requireAdmin,
  validateParams(userIdParamsSchema),
  deleteUser
);

export default router;
