import { Router } from 'express';
import { z } from 'zod';

import { strongPasswordSchema } from '../../../shared/types/users';
import {
  acceptInvitation,
  forgotPassword,
  resendVerification,
  resetPassword,
  signUp,
  verifyEmail
} from '../controllers/verification-controller';
import { validateBody } from '../middleware/validation';

const router = Router();

const signUpSchema = z.object({
  email: z.email('Invalid email format'),
  password: strongPasswordSchema,
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50)
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

const resendSchema = z.object({
  email: z.email('Invalid email format')
});

const acceptSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: strongPasswordSchema,
  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional()
});

router.post('/sign-up', validateBody(signUpSchema), signUp);
router.post('/verify-email', validateBody(verifyEmailSchema), verifyEmail);
router.post(
  '/resend-verification',
  validateBody(resendSchema),
  resendVerification
);
router.post('/accept-invitation', validateBody(acceptSchema), acceptInvitation);

const forgotPasswordSchema = z.object({
  email: z.email('Invalid email format')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: strongPasswordSchema
});

router.post(
  '/forgot-password',
  validateBody(forgotPasswordSchema),
  forgotPassword
);
router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  resetPassword
);

export default router;
