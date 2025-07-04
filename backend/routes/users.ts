import express from 'express';
import { validate, schemas } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  deleteAccount,
  getNotifications,
  markNotificationsAsRead,
  getUserStats,
} from '../controllers/userController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', getProfile);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put(
  '/profile',
  validate({ body: schemas.updateProfile }),
  updateProfile
);

// @desc    Upload profile picture
// @route   POST /api/users/avatar
// @access  Private
router.post('/avatar', uploadAvatar);

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
router.put(
  '/change-password',
  validate({ body: schemas.changePassword }),
  changePassword
);

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', deleteAccount);

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
router.get(
  '/notifications',
  validate({ query: schemas.pagination }),
  getNotifications
);

// @desc    Mark notifications as read
// @route   PUT /api/users/notifications/read
// @access  Private
router.put('/notifications/read', markNotificationsAsRead);

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', getUserStats);

export default router;
