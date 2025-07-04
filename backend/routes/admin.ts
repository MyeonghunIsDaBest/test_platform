import express from 'express';
import { validate, schemas } from '../middleware/validation';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllAppointments,
  getAllTransactions,
  updateProfessionalStatus,
  getSystemSettings,
  updateSystemSettings,
} from '../controllers/adminController';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
router.get('/dashboard', getDashboardStats);

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get(
  '/users',
  validate({ query: schemas.pagination }),
  getAllUsers
);

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
router.put(
  '/users/:id/status',
  validate({ params: schemas.idParam }),
  updateUserStatus
);

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private (Admin only)
router.get(
  '/appointments',
  validate({
    query: {
      ...schemas.pagination,
      ...schemas.appointmentFilters,
    },
  }),
  getAllAppointments
);

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private (Admin only)
router.get(
  '/transactions',
  validate({ query: schemas.pagination }),
  getAllTransactions
);

// @desc    Update professional status
// @route   PUT /api/admin/professionals/:id/status
// @access  Private (Admin only)
router.put(
  '/professionals/:id/status',
  validate({ params: schemas.idParam }),
  updateProfessionalStatus
);

// @desc    Get platform settings
// @route   GET /api/admin/settings
// @access  Private (Admin only)
router.get('/settings', getSystemSettings);

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Private (Admin only)
router.put('/settings', updateSystemSettings);

export default router;
