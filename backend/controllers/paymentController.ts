import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Get wallet balance
export const getWallet = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          appointment: {
            select: {
              listing: {
                select: { title: true },
              },
            },
          },
        },
      },
    },
  });

  if (!wallet) {
    throw createError('Wallet not found', 404);
  }

  res.json({
    success: true,
    data: wallet,
  });
});

// Get transaction history
export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const type = req.query.type as string;
  const status = req.query.status as string;

  // Build where clause
  const where: any = { userId };

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        appointment: {
          select: {
            id: true,
            scheduledDate: true,
            listing: {
              select: {
                title: true,
                professional: {
                  select: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
            customer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// Top up wallet
export const topUpWallet = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { amount, paymentMethodId } = req.body;

  if (amount < 10) {
    throw createError('Minimum top-up amount is $10', 400);
  }

  if (amount > 5000) {
    throw createError('Maximum top-up amount is $5000', 400);
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    throw createError('Wallet not found', 404);
  }

  try {
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/wallet`,
      metadata: {
        userId,
        type: 'wallet_topup',
      },
    });

    if (paymentIntent.status === 'succeeded') {
      // Update wallet balance and create transaction
      const transaction = await prisma.$transaction(async (tx) => {
        // Update wallet balance
        await tx.wallet.update({
          where: { userId },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

        // Create transaction record
        return tx.transaction.create({
          data: {
            userId,
            walletId: wallet.id,
            amount,
            type: 'TOPUP',
            status: 'COMPLETED',
            externalId: paymentIntent.id,
            description: `Wallet top-up via ${paymentIntent.payment_method_types[0]}`,
          },
        });
      });

      res.json({
        success: true,
        message: 'Wallet topped up successfully',
        data: {
          transaction,
          newBalance: wallet.balance + amount,
        },
      });
    } else {
      throw createError('Payment failed', 400);
    }
  } catch (error: any) {
    if (error.type === 'StripeCardError') {
      throw createError(`Payment failed: ${error.message}`, 400);
    }
    throw error;
  }
});

// Withdraw from wallet
export const withdrawFromWallet = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { amount } = req.body;

  if (amount < 10) {
    throw createError('Minimum withdrawal amount is $10', 400);
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    throw createError('Wallet not found', 404);
  }

  if (wallet.balance < amount) {
    throw createError('Insufficient wallet balance', 400);
  }

  // For demo purposes, we'll just update the balance
  // In production, you'd integrate with a payment processor for actual withdrawals
  const transaction = await prisma.$transaction(async (tx) => {
    // Update wallet balance
    await tx.wallet.update({
      where: { userId },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    // Create transaction record
    return tx.transaction.create({
      data: {
        userId,
        walletId: wallet.id,
        amount: -amount,
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        description: `Wallet withdrawal`,
      },
    });
  });

  res.json({
    success: true,
    message: 'Withdrawal processed successfully',
    data: {
      transaction,
      newBalance: wallet.balance - amount,
    },
  });
});

// Process payment for appointment
export const processPayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { appointmentId, paymentMethodId } = req.body;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      listing: true,
      customer: true,
    },
  });

  if (!appointment) {
    throw createError('Appointment not found', 404);
  }

  if (appointment.customerId !== userId) {
    throw createError('Not authorized to pay for this appointment', 403);
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    throw createError('Wallet not found', 404);
  }

  const amount = appointment.listing.price;

  // Check if using wallet or card
  if (paymentMethodId === 'wallet') {
    if (wallet.balance < amount) {
      throw createError('Insufficient wallet balance', 400);
    }

    // Process wallet payment (already implemented in appointment creation)
    res.json({
      success: true,
      message: 'Payment processed from wallet',
    });
  } else {
    // Process card payment
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        return_url: `${process.env.FRONTEND_URL}/appointments/${appointmentId}`,
        metadata: {
          userId,
          appointmentId,
          type: 'appointment_payment',
        },
      });

      if (paymentIntent.status === 'succeeded') {
        // Create transaction record
        await prisma.transaction.create({
          data: {
            userId,
            walletId: wallet.id,
            amount: -amount,
            type: 'PAYMENT',
            status: 'COMPLETED',
            appointmentId,
            externalId: paymentIntent.id,
            description: `Payment for ${appointment.listing.title}`,
          },
        });

        res.json({
          success: true,
          message: 'Payment processed successfully',
          data: {
            paymentIntentId: paymentIntent.id,
          },
        });
      } else {
        throw createError('Payment failed', 400);
      }
    } catch (error: any) {
      if (error.type === 'StripeCardError') {
        throw createError(`Payment failed: ${error.message}`, 400);
      }
      throw error;
    }
  }
});

// Get payment methods
export const getPaymentMethods = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // In a real implementation, you'd fetch from Stripe
  // For now, return mock data
  const paymentMethods = [
    {
      id: 'pm_1234567890',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2025,
      },
      isDefault: true,
    },
  ];

  res.json({
    success: true,
    data: paymentMethods,
  });
});

// Add payment method
export const addPaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { paymentMethodId } = req.body;

  try {
    // Attach payment method to customer in Stripe
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: userId, // In production, you'd use Stripe customer ID
    });

    res.json({
      success: true,
      message: 'Payment method added successfully',
      data: paymentMethod,
    });
  } catch (error: any) {
    throw createError(`Failed to add payment method: ${error.message}`, 400);
  }
});

// Remove payment method
export const removePaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await stripe.paymentMethods.detach(id);

    res.json({
      success: true,
      message: 'Payment method removed successfully',
    });
  } catch (error: any) {
    throw createError(`Failed to remove payment method: ${error.message}`, 400);
  }
});
