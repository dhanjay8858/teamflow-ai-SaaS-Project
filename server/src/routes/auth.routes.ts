import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { uploadAvatar } from '../middleware/upload.middleware.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  refreshTokenSchema,
} from '../validators/auth.validator.js';

const router = Router();

// Public Authentication Routes
router.post('/register', authRateLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authRateLimiter, validateRequest(loginSchema), authController.login);
router.post('/refresh', validateRequest(refreshTokenSchema), authController.refreshToken);

// Protected Authentication Routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);
router.patch('/profile', authenticate, uploadAvatar, validateRequest(updateProfileSchema), authController.updateProfile);
router.patch('/change-password', authenticate, validateRequest(changePasswordSchema), authController.changePassword);

export const authRoutes = router;
