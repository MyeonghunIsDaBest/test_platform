import express from 'express';
import { validate, schemas } from '../middleware/validation';
import { authenticateToken, requireProfessional, optionalAuth } from '../middleware/auth';
import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getCategories,
  getProfessionalListings,
} from '../controllers/listingController';

const router = express.Router();

// @desc    Get categories
// @route   GET /api/listings/categories
// @access  Public
router.get('/categories', getCategories);

// @desc    Get professional's own listings
// @route   GET /api/listings/my-listings
// @access  Private (Professional only)
router.get(
  '/my-listings',
  authenticateToken,
  requireProfessional,
  validate({ query: schemas.pagination }),
  getProfessionalListings
);

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
router.get(
  '/',
  optionalAuth,
  validate({ query: { ...schemas.pagination, ...schemas.listingFilters } }),
  getAllListings
);

// @desc    Get listing by ID
// @route   GET /api/listings/:id
// @access  Public
router.get(
  '/:id',
  validate({ params: schemas.idParam }),
  getListingById
);

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private (Professional only)
router.post(
  '/',
  authenticateToken,
  requireProfessional,
  validate({ body: schemas.createListing }),
  createListing
);

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private (Owner or Admin)
router.put(
  '/:id',
  authenticateToken,
  validate({
    params: schemas.idParam,
    body: schemas.updateListing,
  }),
  updateListing
);

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private (Owner or Admin)
router.delete(
  '/:id',
  authenticateToken,
  validate({ params: schemas.idParam }),
  deleteListing
);

export default router;
