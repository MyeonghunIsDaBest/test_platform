// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  onlineStatus: 'online' | 'offline';
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'customer' | 'professional' | 'admin';

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  location?: string;
  timezone?: string;
  verificationStatus: VerificationStatus;
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// Professional Types
export interface Professional {
  id: string;
  userId: string;
  user: User;
  hourlyRate: number;
  experience: string;
  skills: string[];
  rating: number;
  totalReviews: number;
  status: ProfessionalStatus;
  verifications: ProfessionalVerifications;
  createdAt: string;
  updatedAt: string;
}

export type ProfessionalStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export interface ProfessionalVerifications {
  identityVerified: boolean;
  contactVerified: boolean;
  emailVerified: boolean;
  facebookVerified: boolean;
  linkedinVerified: boolean;
}

// Listing Types
export interface Listing {
  id: string;
  professionalId: string;
  professional: Professional;
  title: string;
  description: string;
  categoryId: string;
  category: Category;
  price: number;
  duration: number; // in minutes
  status: ListingStatus;
  availability: ListingAvailability[];
  createdAt: string;
  updatedAt: string;
}

export type ListingStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface ListingAvailability {
  id: string;
  listingId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  breakTimes?: BreakTime[];
}

export interface BreakTime {
  startTime: string;
  endTime: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  customerId: string;
  customer: User;
  professionalId: string;
  professional: Professional;
  listingId: string;
  listing: Listing;
  scheduledDate: string;
  scheduledTime: string;
  status: AppointmentStatus;
  notes?: string;
  zoomMeetingId?: string;
  extensions: AppointmentExtension[];
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface AppointmentExtension {
  id: string;
  appointmentId: string;
  additionalMinutes: number;
  additionalCost: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// Payment Types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  appointmentId?: string;
  negusFee?: number;
  description: string;
  createdAt: string;
}

export type TransactionType = 'topup' | 'payment' | 'refund' | 'withdrawal' | 'fee' | 'earning';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface PaymentMethod {
  id: string;
  userId: string;
  provider: PaymentProvider;
  externalId: string;
  isDefault: boolean;
  createdAt: string;
}

export type PaymentProvider = 'stripe' | 'paypal';

// Message Types
export interface Message {
  id: string;
  senderId: string;
  sender: User;
  receiverId: string;
  receiver: User;
  appointmentId?: string;
  content: string;
  fileUrl?: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

// Review Types
export interface Review {
  id: string;
  appointmentId: string;
  appointment: Appointment;
  reviewerId: string;
  reviewer: User;
  revieweeId: string;
  reviewee: User;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export type NotificationType = 
  | 'appointment_booked'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'payment_received'
  | 'message_received'
  | 'review_received'
  | 'verification_update';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  role: UserRole;
}

export interface BookingForm {
  listingId: string;
  date: string;
  time: string;
  notes?: string;
  customAnswer?: string;
}

export interface ListingForm {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  duration: number;
  availability: ListingAvailability[];
}

// Filter and Search Types
export interface ListingFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  availability?: string;
  search?: string;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
  professionalId?: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  totalUsers: number;
  totalProfessionals: number;
  totalAppointments: number;
  totalRevenue: number;
  monthlyGrowth: {
    users: number;
    appointments: number;
    revenue: number;
  };
}
