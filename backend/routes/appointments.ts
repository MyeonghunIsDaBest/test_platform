import express from 'express';
import { validate, schemas } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import {
  getUserAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
} from '../controllers/appointmentController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// @desc    Get user appointments
// @route   GET /api/appointments
// @access  Private
router.get(
  '/',
  validate({
    query: {
      ...schemas.pagination,
      ...schemas.appointmentFilters,
    },
  }),
  getUserAppointments
);

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
router.get(
  '/:id',
  validate({ params: schemas.idParam }),
  getAppointmentById
);

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
router.post(
  '/',
  validate({ body: schemas.createAppointment }),
  createAppointment
);

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private
router.put(
  '/:id',
  validate({
    params: schemas.idParam,
    body: schemas.updateAppointment,
  }),
  updateAppointment
);

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
router.delete(
  '/:id',
  validate({ params: schemas.idParam }),
  cancelAppointment
);

export default router;
