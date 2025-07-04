import express from 'express';
import { validate, schemas } from '../middleware/validation';
import { authenticateToken, requireProfessional, optionalAuth } from '../middleware/auth';
import {
  getAllProfessionals,
  getProfessionalById,
  createProfessional,
  updateProfessional,
  getProfessionalStats,
} from '../controllers/professionalController';

const router = express.Router();

// @desc    Get all professionals
// @route   GET /api/professionals
// @access  Public
router.get(
  '/',
  optionalAuth,
  validate({ query: schemas.pagination }),
  getAllProfessionals
);

// @desc    Get professional by ID
// @route   GET /api/professionals/:id
// @access  Public
router.get(
  '/:id',
  validate({ params: schemas.idParam }),
  getProfessionalById
);

// @desc    Create professional profile
// @route   POST /api/professionals
// @access  Private (Professional role)
router.post(
  '/',
  authenticateToken,
  requireProfessional,
  validate({ body: schemas.createProfessional }),
  createProfessional
);

// @desc    Update professional profile
// @route   PUT /api/professionals/:id
// @access  Private (Owner or Admin)
router.put(
  '/:id',
  authenticateToken,
  validate({
    params: schemas.idParam,
    body: schemas.updateProfessional,
  }),
  updateProfessional
);

// @desc    Get professional statistics
// @route   GET /api/professionals/:id/stats
// @access  Private (Owner or Admin)
router.get(
  '/:id/stats',
  authenticateToken,
  validate({ params: schemas.idParam }),
  getProfessionalStats
);

export default router;
