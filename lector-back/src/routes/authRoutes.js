import { Router } from 'express'
import { AuthController } from '../controllers/authController.js'
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js'
import { authRateLimiter } from '../middleware/rateLimitMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/authValidators.js'

const router = Router()

router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  AuthController.register
)

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  AuthController.login
)

router.post(
  '/refresh',
  validate(refreshTokenSchema),
  AuthController.refresh
)

router.post(
  '/logout',
  optionalAuth,
  AuthController.logout
)

router.get(
  '/me',
  authenticate,
  AuthController.getMe
)

export default router
