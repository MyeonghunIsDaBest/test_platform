import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';

// Get all listings with filtering and pagination
export const getAllListings = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const categoryId = req.query.categoryId as string;
  const minPrice = parseFloat(req.query.minPrice as string);
  const maxPrice = parseFloat(req.query.maxPrice as string);
  const rating = parseFloat(req.query.rating as string);
  const sortBy = req.query.sortBy as string || 'createdAt';
  const sortOrder = req.query.sortOrder as string || 'desc';

  // Build where clause
  const where: any = {
    status: 'ACTIVE',
    professional: {
      status: 'ACTIVE',
      user: {
        isActive: true,
      },
    },
  };

  // Add search filter
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      {
        professional: {
          skills: { hasSome: [search] },
        },
      },
    ];
  }

  // Add category filter
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Add price filter
  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    where.price = {};
    if (!isNaN(minPrice)) where.price.gte = minPrice;
    if (!isNaN(maxPrice)) where.price.lte = maxPrice;
  }

  // Add rating filter
  if (!isNaN(rating)) {
    where.professional = {
      ...where.professional,
      rating: { gte: rating },
    };
  }

  // Build order by clause
  const orderBy: any = {};
  if (sortBy === 'price') {
    orderBy.price = sortOrder;
  } else if (sortBy === 'rating') {
    orderBy.professional = { rating: sortOrder };
  } else {
    orderBy.createdAt = sortOrder;
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        category: true,
        professional: {
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
          },
        },
        availability: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// Get listing by ID
export const getListingById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      category: true,
      professional: {
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
        },
      },
      availability: true,
    },
  });

  if (!listing) {
    throw createError('Listing not found', 404);
  }

  if (listing.status !== 'ACTIVE') {
    throw createError('Listing is not available', 400);
  }

  // Get recent reviews for this professional
  const reviews = await prisma.review.findMany({
    where: { revieweeId: listing.professional.userId },
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
    take: 5,
  });

  res.json({
    success: true,
    data: {
      listing,
      reviews,
    },
  });
});

// Create new listing (Professional only)
export const createListing = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { title, description, categoryId, price, duration, availability } = req.body;

  // Check if user is a professional
  const professional = await prisma.professional.findUnique({
    where: { userId },
  });

  if (!professional) {
    throw createError('Only professionals can create listings', 403);
  }

  if (professional.status !== 'ACTIVE') {
    throw createError('Professional profile must be active to create listings', 400);
  }

  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw createError('Invalid category', 400);
  }

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      categoryId,
      price,
      duration,
      professionalId: professional.id,
      availability: availability
        ? {
            create: availability,
          }
        : undefined,
    },
    include: {
      category: true,
      professional: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      },
      availability: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Listing created successfully',
    data: listing,
  });
});

// Update listing
export const updateListing = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const { title, description, categoryId, price, duration, status } = req.body;

  // Check if listing exists
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      professional: true,
    },
  });

  if (!listing) {
    throw createError('Listing not found', 404);
  }

  // Check if user owns the listing or is admin
  if (listing.professional.userId !== userId && req.user!.role !== 'ADMIN') {
    throw createError('Not authorized to update this listing', 403);
  }

  // Verify category if provided
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw createError('Invalid category', 400);
    }
  }

  const updatedListing = await prisma.listing.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(categoryId && { categoryId }),
      ...(price !== undefined && { price }),
      ...(duration !== undefined && { duration }),
      ...(status && { status }),
    },
    include: {
      category: true,
      professional: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      },
      availability: true,
    },
  });

  res.json({
    success: true,
    message: 'Listing updated successfully',
    data: updatedListing,
  });
});

// Delete listing
export const deleteListing = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  // Check if listing exists
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      professional: true,
    },
  });

  if (!listing) {
    throw createError('Listing not found', 404);
  }

  // Check if user owns the listing or is admin
  if (listing.professional.userId !== userId && req.user!.role !== 'ADMIN') {
    throw createError('Not authorized to delete this listing', 403);
  }

  // Check for active appointments
  const activeAppointments = await prisma.appointment.count({
    where: {
      listingId: id,
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
      },
    },
  });

  if (activeAppointments > 0) {
    throw createError('Cannot delete listing with active appointments', 400);
  }

  // Soft delete - archive instead of hard delete
  await prisma.listing.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  });

  res.json({
    success: true,
    message: 'Listing deleted successfully',
  });
});

// Get categories
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          listings: {
            where: { status: 'ACTIVE' },
          },
        },
      },
    },
  });

  res.json({
    success: true,
    data: categories,
  });
});

// Get professional's listings
export const getProfessionalListings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status as string;

  // Get professional
  const professional = await prisma.professional.findUnique({
    where: { userId },
  });

  if (!professional) {
    throw createError('Professional profile not found', 404);
  }

  // Build where clause
  const where: any = {
    professionalId: professional.id,
  };

  if (status) {
    where.status = status;
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        category: true,
        availability: true,
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});
