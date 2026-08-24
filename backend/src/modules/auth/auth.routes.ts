import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../middleware/validate';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema';
import { authenticate } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validateRequest({ body: registerSchema }),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  authLimiter,
  validateRequest({ body: loginSchema }),
  asyncHandler(authController.login)
);

router.post(
  '/refresh-token',
  validateRequest({ body: refreshTokenSchema }),
  asyncHandler(authController.refreshToken)
);

router.post(
  '/logout',
  authenticate,
  asyncHandler(authController.logout)
);

router.post(
  '/forgot-password',
  authLimiter,
  validateRequest({ body: forgotPasswordSchema }),
  asyncHandler(authController.forgotPassword)
);

router.post(
  '/reset-password',
  authLimiter,
  validateRequest({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword)
);

router.get(
  '/me',
  authenticate,
  asyncHandler(authController.getMe)
);

export default router;
