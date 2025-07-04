import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';

// Get reviews for a professional
export const getProfessionalReviews = asyncHandler(async (req: Request, res: Response) => {
  const { professionalId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const rating = parseInt(req.query.rating as string);

  // Verify professional exists
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!professional) {
    throw createError('Professional not found', 404);
  }

  // Build where clause
  const where: any = {
    revieweeId: professional.userId,
  };

  if (rating) {
    where.rating = rating;
  }

  const [reviews, total, ratingStats] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        appointment: {
          select: {
            id: true,
            scheduledDate: true,
            listing: {
              select: {
                title: true,
                category: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
    prisma.review.groupBy({
      by: ['rating'],
      where: { revieweeId: professional.userId },
      _count: { rating: true },
    }),
  ]);

  // Calculate rating distribution
  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  ratingStats.forEach((stat) => {
    ratingDistribution[stat.rating as keyof typeof ratingDistribution] = stat._count.rating;
  });

  res.json({
    success: true,
    data: {
      reviews,
      professional: {
        id: professional.id,
        name: `${professional.user.firstName} ${professional.user.lastName}`,
        rating: professional.rating,
        totalReviews: professional.totalReviews,
      },
      ratingDistribution,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// Get review by ID
export const getReviewById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      reviewee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      appointment: {
        select: {
          id: true,
          scheduledDate: true,
          listing: {
            select: {
              title: true,
              category: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  if (!review) {
    throw createError('Review not found', 404);
  }

  res.json({
    success: true,
    data: review,
  });
});

// Create review
export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { appointmentId, rating, comment } = req.body;

  // Get appointment details
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      listing: {
        include: {
          professional: true,
        },
      },
    },
  });

  if (!appointment) {
    throw createError('Appointment not found', 404);
  }

  // Check if user is the customer of this appointment
  if (appointment.customerId !== userId) {
    throw createError('Only customers can review appointments', 403);
  }

  // Check if appointment is completed
  if (appointment.status !== 'COMPLETED') {
    throw createError('Can only review completed appointments', 400);
  }

  // Check if review already exists
  const existingReview = await prisma.review.findUnique({
    where: { appointmentId },
  });

  if (existingReview) {
    throw createError('Review already exists for this appointment', 400);
  }

  // Create review and update professional rating
  const review = await prisma.$transaction(async (tx) => {
    // Create the review
    const newReview = await tx.review.create({
      data: {
        appointmentId,
        reviewerId: userId,
        revieweeId: appointment.professionalId,
        rating,
        comment,
      },
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
    });

    // Update professional rating
    const professional = appointment.listing.professional;
    const currentTotal = professional.totalReviews;
    const currentRating = professional.rating;
    
    const newTotal = currentTotal + 1;
    const newRating = ((currentRating * currentTotal) + rating) / newTotal;

    await tx.professional.update({
      where: { id: professional.id },
      data: {
        rating: newRating,
        totalReviews: newTotal,
      },
    });

    // Create notification for professional
    await tx.notification.create({
      data: {
        userId: appointment.professionalId,
        type: 'REVIEW_RECEIVED',
        title: 'New Review',
        content: `You received a ${rating}-star review from ${newReview.reviewer.firstName} ${newReview.reviewer.lastName}`,
      },
    });

    return newReview;
  });

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: review,
  });
});

// Update review
export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const { rating, comment } = req.body;

  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      appointment: {
        include: {
          listing: {
            include: {
              professional: true,
            },
          },
        },
      },
    },
  });

  if (!review) {
    throw createError('Review not found', 404);
  }

  // Check if user owns the review
  if (review.reviewerId !== userId) {
    throw createError('Not authorized to update this review', 403);
  }

  // Update review and recalculate professional rating
  const updatedReview = await prisma.$transaction(async (tx) => {
    const oldRating = review.rating;
    
    // Update the review
    const updated = await tx.review.update({
      where: { id },
      data: {
        ...(rating !== undefined && { rating }),
        ...(comment && { comment }),
      },
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
    });

    // Recalculate professional rating if rating changed
    if (rating !== undefined && rating !== oldRating) {
      const professional = review.appointment.listing.professional;
      const currentTotal = professional.totalReviews;
      const currentRating = professional.rating;
      
      // Remove old rating and add new rating
      const newRating = ((currentRating * currentTotal) - oldRating + rating) / currentTotal;

      await tx.professional.update({
        where: { id: professional.id },
        data: { rating: newRating },
      });
    }

    return updated;
  });

  res.json({
    success: true,
    message: 'Review updated successfully',
    data: updatedReview,
  });
});

// Delete review
export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      appointment: {
        include: {
          listing: {
            include: {
              professional: true,
            },
          },
        },
      },
    },
  });

  if (!review) {
    throw createError('Review not found', 404);
  }

  // Check if user owns the review or is admin
  if (review.reviewerId !== userId && req.user!.role !== 'ADMIN') {
    throw createError('Not authorized to delete this review', 403);
  }

  // Delete review and update professional rating
  await prisma.$transaction(async (tx) => {
    // Delete the review
    await tx.review.delete({
      where: { id },
    });

    // Update professional rating
    const professional = review.appointment.listing.professional;
    const currentTotal = professional.totalReviews;
    const currentRating = professional.rating;
    
    if (currentTotal > 1) {
      const newTotal = currentTotal - 1;
      const newRating = ((currentRating * currentTotal) - review.rating) / newTotal;

      await tx.professional.update({
        where: { id: professional.id },
        data: {
          rating: newRating,
          totalReviews: newTotal,
        },
      });
    } else {
      // If this was the only review, reset to 0
      await tx.professional.update({
        where: { id: professional.id },
        data: {
          rating: 0,
          totalReviews: 0,
        },
      });
    }
  });

  res.json({
    success: true,
    message: 'Review deleted successfully',
  });
});

// Get user's reviews (as reviewer)
export const getUserReviews = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { reviewerId: userId },
      include: {
        reviewee: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        appointment: {
          select: {
            id: true,
            scheduledDate: true,
            listing: {
              select: {
                title: true,
                category: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({
      where: { reviewerId: userId },
    }),
  ]);

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});
