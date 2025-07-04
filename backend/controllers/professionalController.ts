import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';

// Get all professionals with filtering and pagination
export const getAllProfessionals = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const categoryId = req.query.categoryId as string;
  const minPrice = parseFloat(req.query.minPrice as string);
  const maxPrice = parseFloat(req.query.maxPrice as string);
  const rating = parseFloat(req.query.rating as string);
  const sortBy = req.query.sortBy as string || 'rating';
  const sortOrder = req.query.sortOrder as string || 'desc';

  // Build where clause
  const where: any = {
    status: 'ACTIVE',
    user: {
      isActive: true,
    },
  };

  // Add search filter
  if (search) {
    where.OR = [
      {
        user: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
      { experience: { contains: search, mode: 'insensitive' } },
      { skills: { hasSome: [search] } },
    ];
  }

  // Add price filter
  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    where.hourlyRate = {};
    if (!isNaN(minPrice)) where.hourlyRate.gte = minPrice;
    if (!isNaN(maxPrice)) where.hourlyRate.lte = maxPrice;
  }

  // Add rating filter
  if (!isNaN(rating)) {
    where.rating = { gte: rating };
  }

  // Add category filter through listings
  if (categoryId) {
    where.listings = {
      some: {
        categoryId,
        status: 'ACTIVE',
      },
    };
  }

  // Build order by clause
  const orderBy: any = {};
  if (sortBy === 'rating') {
    orderBy.rating = sortOrder;
  } else if (sortBy === 'price') {
    orderBy.hourlyRate = sortOrder;
  } else if (sortBy === 'reviews') {
    orderBy.totalReviews = sortOrder;
  } else {
    orderBy.createdAt = 'desc';
  }

  const [professionals, total] = await Promise.all([
    prisma.professional.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            onlineStatus: true,
          },
        },
        verifications: true,
        listings: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            title: true,
            price: true,
            category: {
              select: { name: true },
            },
          },
          take: 3,
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.professional.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      professionals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// Get professional by ID
export const getProfessionalById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const professional = await prisma.professional.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          onlineStatus: true,
          profile: {
            select: {
              bio: true,
              location: true,
              timezone: true,
            },
          },
        },
      },
      verifications: true,
      listings: {
        where: { status: 'ACTIVE' },
        include: {
          category: true,
          availability: true,
        },
      },
    },
  });

  if (!professional) {
    throw createError('Professional not found', 404);
  }

  // Get recent reviews
  const reviews = await prisma.review.findMany({
    where: { revieweeId: professional.userId },
    include: {
      reviewer: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      appointment: {
        select: {
          listing: {
            select: { title: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  res.json({
    success: true,
    data: {
      professional,
      reviews,
    },
  });
});

// Create professional profile
export const createProfessional = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { hourlyRate, experience, skills } = req.body;

  // Check if user is already a professional
  const existingProfessional = await prisma.professional.findUnique({
    where: { userId },
  });

  if (existingProfessional) {
    throw createError('Professional profile already exists', 400);
  }

  // Check if user role is PROFESSIONAL
  if (req.user!.role !== 'PROFESSIONAL') {
    throw createError('Only users with PROFESSIONAL role can create professional profiles', 403);
  }

  const professional = await prisma.professional.create({
    data: {
      userId,
      hourlyRate,
      experience,
      skills,
      verifications: {
        create: {
          emailVerified: true, // Email is already verified during registration
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
      },
      verifications: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Professional profile created successfully',
    data: professional,
  });
});

// Update professional profile
export const updateProfessional = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const { hourlyRate, experience, skills } = req.body;

  // Check if professional exists and belongs to user
  const professional = await prisma.professional.findUnique({
    where: { id },
  });

  if (!professional) {
    throw createError('Professional profile not found', 404);
  }

  if (professional.userId !== userId && req.user!.role !== 'ADMIN') {
    throw createError('Not authorized to update this professional profile', 403);
  }

  const updatedProfessional = await prisma.professional.update({
    where: { id },
    data: {
      ...(hourlyRate !== undefined && { hourlyRate }),
      ...(experience && { experience }),
      ...(skills && { skills }),
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
      },
      verifications: true,
    },
  });

  res.json({
    success: true,
    message: 'Professional profile updated successfully',
    data: updatedProfessional,
  });
});

// Get professional statistics
export const getProfessionalStats = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  // Check if professional exists and belongs to user (or user is admin)
  const professional = await prisma.professional.findUnique({
    where: { id },
  });

  if (!professional) {
    throw createError('Professional profile not found', 404);
  }

  if (professional.userId !== userId && req.user!.role !== 'ADMIN') {
    throw createError('Not authorized to view this professional statistics', 403);
  }

  const [
    totalAppointments,
    completedAppointments,
    totalEarnings,
    activeListings,
    monthlyAppointments,
    monthlyEarnings,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { professionalId: professional.userId },
    }),
    prisma.appointment.count({
      where: {
        professionalId: professional.userId,
        status: 'COMPLETED',
      },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: professional.userId,
        type: 'EARNING',
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    }),
    prisma.listing.count({
      where: {
        professionalId: professional.id,
        status: 'ACTIVE',
      },
    }),
    prisma.appointment.count({
      where: {
        professionalId: professional.userId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: professional.userId,
        type: 'EARNING',
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amount: true },
    }),
  ]);

  const stats = {
    totalAppointments,
    completedAppointments,
    totalEarnings: totalEarnings._sum.amount || 0,
    activeListings,
    rating: professional.rating,
    totalReviews: professional.totalReviews,
    monthlyStats: {
      appointments: monthlyAppointments,
      earnings: monthlyEarnings._sum.amount || 0,
    },
  };

  res.json({
    success: true,
    data: stats,
  });
});
