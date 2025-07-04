import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { asyncHandler, createError } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';

// Get user profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      onlineStatus: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          bio: true,
          location: true,
          timezone: true,
          verificationStatus: true,
        },
      },
      professional: {
        select: {
          id: true,
          hourlyRate: true,
          experience: true,
          skills: true,
          rating: true,
          totalReviews: true,
          status: true,
          verifications: true,
        },
      },
      wallet: {
        select: {
          balance: true,
        },
      },
    },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    data: user,
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { firstName, lastName, phone, bio, location, timezone } = req.body;

  // Update user basic info
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone && { phone }),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
    },
  });

  // Update profile info
  await prisma.userProfile.update({
    where: { userId },
    data: {
      ...(bio && { bio }),
      ...(location && { location }),
      ...(timezone && { timezone }),
    },
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser,
  });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || 'uploads/avatars');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
  },
});

// Upload avatar
export const uploadAvatar = [
  upload.single('avatar'),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user avatar
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
      },
    });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        user: updatedUser,
        avatarUrl,
      },
    });
  }),
];

// Change password
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  // Get current password
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw createError('Current password is incorrect', 400);
  }

  // Hash new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  // Delete all refresh tokens for security
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  res.json({
    success: true,
    message: 'Password changed successfully. Please log in again.',
  });
});

// Delete user account
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // Check for active appointments
  const activeAppointments = await prisma.appointment.count({
    where: {
      OR: [
        { customerId: userId },
        { professionalId: userId },
      ],
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
      },
    },
  });

  if (activeAppointments > 0) {
    throw createError('Cannot delete account with active appointments', 400);
  }

  // Soft delete - deactivate account instead of hard delete
  await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false,
      email: `deleted_${Date.now()}_${userId}@deleted.com`, // Prevent email conflicts
    },
  });

  // Delete all refresh tokens
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  res.json({
    success: true,
    message: 'Account deactivated successfully',
  });
});

// Get user notifications
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({
      where: { userId },
    }),
  ]);

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// Mark notifications as read
export const markNotificationsAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { notificationIds } = req.body;

  await prisma.notification.updateMany({
    where: {
      id: { in: notificationIds },
      userId,
    },
    data: { isRead: true },
  });

  res.json({
    success: true,
    message: 'Notifications marked as read',
  });
});

// Get user statistics
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;

  let stats: any = {};

  if (userRole === 'CUSTOMER') {
    const [totalAppointments, completedAppointments, walletBalance] = await Promise.all([
      prisma.appointment.count({
        where: { customerId: userId },
      }),
      prisma.appointment.count({
        where: { customerId: userId, status: 'COMPLETED' },
      }),
      prisma.wallet.findUnique({
        where: { userId },
        select: { balance: true },
      }),
    ]);

    stats = {
      totalAppointments,
      completedAppointments,
      walletBalance: walletBalance?.balance || 0,
    };
  } else if (userRole === 'PROFESSIONAL') {
    const [totalAppointments, totalEarnings, activeListings, avgRating] = await Promise.all([
      prisma.appointment.count({
        where: { professionalId: userId },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EARNING',
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
      prisma.listing.count({
        where: {
          professional: { userId },
          status: 'ACTIVE',
        },
      }),
      prisma.professional.findUnique({
        where: { userId },
        select: { rating: true, totalReviews: true },
      }),
    ]);

    stats = {
      totalAppointments,
      totalEarnings: totalEarnings._sum.amount || 0,
      activeListings,
      rating: avgRating?.rating || 0,
      totalReviews: avgRating?.totalReviews || 0,
    };
  }

  res.json({
    success: true,
    data: stats,
  });
});
