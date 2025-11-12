import { Router } from 'express';
import { register, login, logout, refreshToken } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';
import { loginRateLimiter, registerRateLimiter } from '../middlewares/rateLimiter';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerRateLimiter, validateRequest(registerSchema), register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginRateLimiter, validateRequest(loginSchema), login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', validateRequest(refreshTokenSchema), refreshToken);

export default router;
