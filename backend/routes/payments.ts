import express from 'express';
import { validate, schemas } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import {
  getWallet,
  getTransactions,
  topUpWallet,
  withdrawFromWallet,
  processPayment,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
} from '../controllers/paymentController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// @desc    Get wallet balance
// @route   GET /api/payments/wallet
// @access  Private
router.get('/wallet', getWallet);

// @desc    Get transaction history
// @route   GET /api/payments/transactions
// @access  Private
router.get(
  '/transactions',
  validate({ query: schemas.pagination }),
  getTransactions
);

// @desc    Top up wallet
// @route   POST /api/payments/topup
// @access  Private
router.post(
  '/topup',
  validate({ body: schemas.topUpWallet }),
  topUpWallet
);

// @desc    Withdraw from wallet
// @route   POST /api/payments/withdraw
// @access  Private
router.post(
  '/withdraw',
  validate({ body: schemas.withdrawFromWallet }),
  withdrawFromWallet
);

// @desc    Process payment
// @route   POST /api/payments/process
// @access  Private
router.post('/process', processPayment);

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Private
router.get('/methods', getPaymentMethods);

// @desc    Add payment method
// @route   POST /api/payments/methods
// @access  Private
router.post('/methods', addPaymentMethod);

// @desc    Remove payment method
// @route   DELETE /api/payments/methods/:id
// @access  Private
router.delete(
  '/methods/:id',
  validate({ params: schemas.idParam }),
  removePaymentMethod
);

export default router;
