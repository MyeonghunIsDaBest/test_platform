import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { createError } from './errorHandler';

// Generic validation middleware
export const validate = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        );
        return next(createError(`Validation error: ${errorMessages.join(', ')}`, 400));
      }
      next(error);
    }
  };
};

// Common validation schemas
export const schemas = {
  // Auth schemas
  register: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().optional(),
    role: z.enum(['CUSTOMER', 'PROFESSIONAL']),
  }),

  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),

  refreshToken: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),

  forgotPassword: z.object({
    email: z.string().email('Invalid email address'),
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),

  // User schemas
  updateProfile: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
    timezone: z.string().optional(),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),

  // Professional schemas
  createProfessional: z.object({
    hourlyRate: z.number().positive('Hourly rate must be positive'),
    experience: z.string().min(10, 'Experience description must be at least 10 characters'),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
  }),

  updateProfessional: z.object({
    hourlyRate: z.number().positive().optional(),
    experience: z.string().min(10).optional(),
    skills: z.array(z.string()).min(1).optional(),
  }),

  // Listing schemas
  createListing: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    categoryId: z.string().cuid('Invalid category ID'),
    price: z.number().positive('Price must be positive'),
    duration: z.number().min(15, 'Duration must be at least 15 minutes'),
    availability: z.array(z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
      breakTimes: z.array(z.object({
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      })).optional(),
    })).optional(),
  }),

  updateListing: z.object({
    title: z.string().min(5).optional(),
    description: z.string().min(20).optional(),
    categoryId: z.string().cuid().optional(),
    price: z.number().positive().optional(),
    duration: z.number().min(15).optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
  }),

  // Appointment schemas
  createAppointment: z.object({
    listingId: z.string().cuid('Invalid listing ID'),
    scheduledDate: z.string().datetime('Invalid date format'),
    scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    notes: z.string().optional(),
  }),

  updateAppointment: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
    notes: z.string().optional(),
    zoomMeetingId: z.string().optional(),
  }),

  // Payment schemas
  topUpWallet: z.object({
    amount: z.number().positive('Amount must be positive'),
    paymentMethodId: z.string().min(1, 'Payment method is required'),
  }),

  withdrawFromWallet: z.object({
    amount: z.number().positive('Amount must be positive'),
  }),

  // Message schemas
  sendMessage: z.object({
    receiverId: z.string().cuid('Invalid receiver ID'),
    content: z.string().min(1, 'Message content is required'),
    appointmentId: z.string().cuid().optional(),
  }),

  // Review schemas
  createReview: z.object({
    appointmentId: z.string().cuid('Invalid appointment ID'),
    rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
    comment: z.string().min(10, 'Comment must be at least 10 characters'),
  }),

  // Common parameter schemas
  idParam: z.object({
    id: z.string().cuid('Invalid ID format'),
  }),

  // Pagination schemas
  pagination: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),

  // Filter schemas
  appointmentFilters: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    professionalId: z.string().cuid().optional(),
  }),

  listingFilters: z.object({
    categoryId: z.string().cuid().optional(),
    minPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
    maxPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
    rating: z.string().transform(Number).pipe(z.number().min(0).max(5)).optional(),
    availability: z.string().optional(),
  }),
};
