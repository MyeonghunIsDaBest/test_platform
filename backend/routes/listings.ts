import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get listings endpoint - to be implemented'
  });
}));

// @desc    Get listing by ID
// @route   GET /api/listings/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get listing by ID endpoint - to be implemented'
  });
}));

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private (Professional only)
router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Create listing endpoint - to be implemented'
  });
}));

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private (Professional only)
router.put('/:id', asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update listing endpoint - to be implemented'
  });
}));

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private (Professional only)
router.delete('/:id', asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Delete listing endpoint - to be implemented'
  });
}));

export default router;
