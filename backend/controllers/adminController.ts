import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';

// Get admin dashboard statistics
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalUsers,
    totalProfessionals,
    totalCustomers,
    totalAppointments,
    totalTransactions,
    totalRevenue,
    monthlyStats,
    recentUsers,
    recentAppointments,
  ] = await Promise.all([
    // Total users
    prisma.user.count(),
    
    // Total professionals
    prisma.user.count({
      where: { role: 'PROFESSIONAL' },
    }),
    
    // Total customers
    prisma.user.count({
      where: { role: 'CUSTOMER' },
    }),
    
    // Total appointments
    prisma.appointment.count(),
    
    // Total transactions
    prisma.transaction.count(),
    
    // Total revenue (platform fees)
    prisma.transaction.aggregate({
      where: {
        type: 'FEE',
        status: 'COMPLETED',
      },
      _sum: { platformFee: true },
    }),
    
    // Monthly stats for the last 12 months
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as appointments,
        SUM(CASE WHEN type = 'FEE' AND status = 'COMPLETED' THEN platform_fee ELSE 0 END) as revenue
      FROM appointments a
      LEFT JOIN transactions t ON a.id = t.appointment_id
      WHERE a.created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `,
    
    // Recent users (last 10)
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        isActive: true,
      },
    }),
    
    // Recent appointments (last 10)
    prisma.appointment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        professional: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        listing: {
          select: {
            title: true,
            price: true,
          },
        },
      },
    }),
  ]);

  const stats = {
    overview: {
      totalUsers,
      totalProfessionals,
      totalCustomers,
      totalAppointments,
      totalTransactions,
      totalRevenue: totalRevenue._sum.platformFee || 0,
    },
    monthlyStats,
    recentActivity: {
      users: recentUsers,
      appointments: recentAppointments,
    },
  };

  res.json({
    success: true,
    data: stats,
  });
});

// Get all users with filtering and pagination
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const role = req.query.role as string;
  const status = req.query.status as string;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (status === 'active') {
    where.isActive = true;
  } else if (status === 'inactive') {
    where.isActive = false;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        profile: true,
        professional: {
          select: {
            rating: true,
            totalReviews: true,
            status: true,
          },
        },
        wallet: {
          select: {
            balance: true,
          },
        },
        _count: {
          select: {
            customerAppointments: true,
            professionalAppointments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// Update user status
export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Prevent admin from deactivating themselves
  if (user.id === req.user!.id && !isActive) {
    throw createError('Cannot deactivate your own account', 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: updatedUser,
  });
});

// Get all appointments with filtering
export const getAllAppointments = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status as string;
  const dateFrom = req.query.dateFrom as string;
  const dateTo = req.query.dateTo as string;

  // Build where clause
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.scheduledDate = {};
    if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
    if (dateTo) where.scheduledDate.lte = new Date(dateTo);
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        listing: {
          select: {
            title: true,
            price: true,
            category: {
              select: { name: true },
            },
          },
        },
        transactions: {
          select: {
            amount: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.appointment.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// Get all transactions with filtering
export const getAllTransactions = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const type = req.query.type as string;
  const status = req.query.status as string;
  const dateFrom = req.query.dateFrom as string;
  const dateTo = req.query.dateTo as string;

  // Build where clause
  const where: any = {};

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        appointment: {
          select: {
            id: true,
            listing: {
              select: { title: true },
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

// Update professional status
export const updateProfessionalStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const professional = await prisma.professional.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!professional) {
    throw createError('Professional not found', 404);
  }

  const updatedProfessional = await prisma.professional.update({
    where: { id },
    data: { status },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  // Create notification for professional
  await prisma.notification.create({
    data: {
      userId: professional.userId,
      type: 'VERIFICATION_UPDATE',
      title: 'Professional Status Updated',
      content: `Your professional status has been updated to: ${status}`,
    },
  });

  res.json({
    success: true,
    message: 'Professional status updated successfully',
    data: updatedProfessional,
  });
});

// Get system settings
export const getSystemSettings = asyncHandler(async (req: Request, res: Response) => {
  // In a real implementation, you'd have a settings table
  // For now, return mock settings
  const settings = {
    platformFeePercentage: 10,
    minimumWalletTopup: 10,
    maximumWalletTopup: 5000,
    appointmentCancellationWindow: 24, // hours
    autoApproveListings: false,
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
  };

  res.json({
    success: true,
    data: settings,
  });
});

// Update system settings
export const updateSystemSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = req.body;

  // In a real implementation, you'd update the settings in database
  // For now, just return the updated settings
  res.json({
    success: true,
    message: 'System settings updated successfully',
    data: settings,
  });
});
