import { Router } from 'express';
import { z } from 'zod';

import { login, register } from '../controllers/auth-controller';
import { validateBody } from '../middleware/validation';

const router = Router();

const registerSchema = z.object({
  email: z.email('Invalid email format'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long'),
  password: z.string().min(8, 'Passwords must be a least 8 characters')
});

const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Passwords is required')
});

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);

export default router;
