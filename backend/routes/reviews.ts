import express from 'express';
import { validate, schemas } from '../middleware/validation';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import {
  getProfessionalReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
} from '../controllers/reviewController';

const router = express.Router();

// @desc    Get reviews for a professional
// @route   GET /api/reviews/professional/:professionalId
// @access  Public
router.get(
  '/professional/:professionalId',
  optionalAuth,
  validate({
    params: { professionalId: schemas.idParam.shape.id },
    query: schemas.pagination,
  }),
  getProfessionalReviews
);

// @desc    Get user's own reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
router.get(
  '/my-reviews',
  authenticateToken,
  validate({ query: schemas.pagination }),
  getUserReviews
);

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
router.get(
  '/:id',
  validate({ params: schemas.idParam }),
  getReviewById
);

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
router.post(
  '/',
  authenticateToken,
  validate({ body: schemas.createReview }),
  createReview
);

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
router.put(
  '/:id',
  authenticateToken,
  validate({
    params: schemas.idParam,
    body: schemas.createReview.partial(),
  }),
  updateReview
);

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete(
  '/:id',
  authenticateToken,
  validate({ params: schemas.idParam }),
  deleteReview
);

export default router;
