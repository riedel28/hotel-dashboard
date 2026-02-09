import { Router } from 'express';
import { z } from 'zod';

import { strongPasswordSchema } from '../../../shared/types/users';
import { login, logout, register } from '../controllers/auth-controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorization';
import { validateBody } from '../middleware/validation';

const router = Router();

const registerSchema = z.object({
  email: z.email('Invalid email format'),
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long'),
  password: strongPasswordSchema
});

const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Passwords is required'),
  rememberMe: z.boolean().optional()
});

router.post(
  '/register',
  authenticateToken,
  requireAdmin,
  validateBody(registerSchema),
  register
);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', logout);

export { registerSchema, loginSchema };

export default router;
