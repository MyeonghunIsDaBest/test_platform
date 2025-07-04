import express from 'express';
import { validate, schemas } from '../middleware/validation';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post(
  '/register',
  validate({ body: schemas.register }),
  register
);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post(
  '/login',
  validate({ body: schemas.login }),
  login
);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post(
  '/logout',
  optionalAuth,
  logout
);

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post(
  '/refresh',
  validate({ body: schemas.refreshToken }),
  refreshToken
);

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post(
  '/forgot-password',
  validate({ body: schemas.forgotPassword }),
  forgotPassword
);

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post(
  '/reset-password',
  validate({ body: schemas.resetPassword }),
  resetPassword
);

export default router;
