import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { sendEmail, emailTemplates } from '../utils/email';

// Get user appointments
export const getUserAppointments = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status as string;
  const dateFrom = req.query.dateFrom as string;
  const dateTo = req.query.dateTo as string;

  // Build where clause based on user role
  const where: any = {};

  if (userRole === 'CUSTOMER') {
    where.customerId = userId;
  } else if (userRole === 'PROFESSIONAL') {
    where.professionalId = userId;
  } else {
    // Admin can see all appointments
  }

  // Add status filter
  if (status) {
    where.status = status;
  }

  // Add date range filter
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
            avatar: true,
            email: true,
          },
        },
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            duration: true,
            category: {
              select: { name: true },
            },
          },
        },
        extensions: true,
      },
      orderBy: { scheduledDate: 'desc' },
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

// Get appointment by ID
export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          email: true,
          phone: true,
        },
      },
      professional: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          email: true,
          phone: true,
        },
      },
      listing: {
        include: {
          category: true,
          professional: {
            include: {
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
      extensions: true,
      messages: {
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!appointment) {
    throw createError('Appointment not found', 404);
  }

  // Check if user has access to this appointment
  if (
    userRole !== 'ADMIN' &&
    appointment.customerId !== userId &&
    appointment.professionalId !== userId
  ) {
    throw createError('Not authorized to view this appointment', 403);
  }

  res.json({
    success: true,
    data: appointment,
  });
});

// Create new appointment
export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { listingId, scheduledDate, scheduledTime, notes } = req.body;

  // Get listing with professional info
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      professional: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!listing) {
    throw createError('Listing not found', 404);
  }

  if (listing.status !== 'ACTIVE') {
    throw createError('Listing is not available for booking', 400);
  }

  // Check if customer is trying to book their own service
  if (listing.professional.userId === userId) {
    throw createError('Cannot book your own service', 400);
  }

  // Check if customer has sufficient wallet balance
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet || wallet.balance < listing.price) {
    throw createError('Insufficient wallet balance', 400);
  }

  // Check for conflicting appointments
  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      professionalId: listing.professional.userId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
      },
    },
  });

  if (conflictingAppointment) {
    throw createError('Time slot is not available', 400);
  }

  // Calculate platform fee (10%)
  const platformFee = listing.price * 0.1;
  const professionalEarning = listing.price - platformFee;

  // Create appointment and related transactions
  const appointment = await prisma.$transaction(async (tx) => {
    // Create appointment
    const newAppointment = await tx.appointment.create({
      data: {
        customerId: userId,
        professionalId: listing.professional.userId,
        listingId,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        notes,
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        professional: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        listing: {
          select: {
            title: true,
            price: true,
            duration: true,
          },
        },
      },
    });

    // Deduct from customer wallet
    await tx.wallet.update({
      where: { userId },
      data: {
        balance: {
          decrement: listing.price,
        },
      },
    });

    // Create payment transaction
    await tx.transaction.create({
      data: {
        userId,
        walletId: wallet.id,
        amount: -listing.price,
        type: 'PAYMENT',
        status: 'COMPLETED',
        appointmentId: newAppointment.id,
        platformFee,
        description: `Payment for ${listing.title}`,
      },
    });

    // Create earning transaction for professional (held until completion)
    const professionalWallet = await tx.wallet.findUnique({
      where: { userId: listing.professional.userId },
    });

    if (professionalWallet) {
      await tx.transaction.create({
        data: {
          userId: listing.professional.userId,
          walletId: professionalWallet.id,
          amount: professionalEarning,
          type: 'EARNING',
          status: 'PENDING',
          appointmentId: newAppointment.id,
          description: `Earning from ${listing.title}`,
        },
      });
    }

    return newAppointment;
  });

  // Send confirmation emails
  await Promise.all([
    sendEmail(
      appointment.customer.email,
      emailTemplates.appointmentConfirmation(
        `${appointment.customer.firstName} ${appointment.customer.lastName}`,
        `${appointment.professional.firstName} ${appointment.professional.lastName}`,
        new Date(scheduledDate).toLocaleDateString(),
        scheduledTime
      )
    ),
    // You could also send a notification to the professional
  ]);

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    data: appointment,
  });
});

// Update appointment status
export const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const { status, notes, zoomMeetingId } = req.body;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      listing: true,
    },
  });

  if (!appointment) {
    throw createError('Appointment not found', 404);
  }

  // Check authorization
  if (
    userRole !== 'ADMIN' &&
    appointment.customerId !== userId &&
    appointment.professionalId !== userId
  ) {
    throw createError('Not authorized to update this appointment', 403);
  }

  // Handle status-specific logic
  if (status === 'COMPLETED') {
    // Release payment to professional
    await prisma.$transaction(async (tx) => {
      // Update earning transaction to completed
      await tx.transaction.updateMany({
        where: {
          appointmentId: id,
          type: 'EARNING',
          status: 'PENDING',
        },
        data: {
          status: 'COMPLETED',
        },
      });

      // Add to professional wallet
      const professionalWallet = await tx.wallet.findUnique({
        where: { userId: appointment.professionalId },
      });

      if (professionalWallet) {
        const earning = await tx.transaction.findFirst({
          where: {
            appointmentId: id,
            type: 'EARNING',
            status: 'COMPLETED',
          },
        });

        if (earning) {
          await tx.wallet.update({
            where: { userId: appointment.professionalId },
            data: {
              balance: {
                increment: earning.amount,
              },
            },
          });
        }
      }
    });
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(notes && { notes }),
      ...(zoomMeetingId && { zoomMeetingId }),
    },
    include: {
      customer: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      professional: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      listing: {
        select: {
          title: true,
        },
      },
    },
  });

  res.json({
    success: true,
    message: 'Appointment updated successfully',
    data: updatedAppointment,
  });
});

// Cancel appointment
export const cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      listing: true,
    },
  });

  if (!appointment) {
    throw createError('Appointment not found', 404);
  }

  // Check authorization
  if (
    userRole !== 'ADMIN' &&
    appointment.customerId !== userId &&
    appointment.professionalId !== userId
  ) {
    throw createError('Not authorized to cancel this appointment', 403);
  }

  if (appointment.status === 'COMPLETED') {
    throw createError('Cannot cancel completed appointment', 400);
  }

  if (appointment.status === 'CANCELLED') {
    throw createError('Appointment is already cancelled', 400);
  }

  // Process refund
  await prisma.$transaction(async (tx) => {
    // Update appointment status
    await tx.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Refund customer
    const customerWallet = await tx.wallet.findUnique({
      where: { userId: appointment.customerId },
    });

    if (customerWallet) {
      await tx.wallet.update({
        where: { userId: appointment.customerId },
        data: {
          balance: {
            increment: appointment.listing.price,
          },
        },
      });

      // Create refund transaction
      await tx.transaction.create({
        data: {
          userId: appointment.customerId,
          walletId: customerWallet.id,
          amount: appointment.listing.price,
          type: 'REFUND',
          status: 'COMPLETED',
          appointmentId: id,
          description: `Refund for cancelled appointment: ${appointment.listing.title}`,
        },
      });
    }

    // Cancel pending earning transaction
    await tx.transaction.updateMany({
      where: {
        appointmentId: id,
        type: 'EARNING',
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    });
  });

  res.json({
    success: true,
    message: 'Appointment cancelled and refund processed',
  });
});
