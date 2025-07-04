# Yoru's Random Test Platform

A modern professional services marketplace built with React.js and Node.js, converted from the original Gigant WordPress theme.

## ✅ **PROJECT STATUS: BACKEND COMPLETE**

**All major backend functionality has been implemented and is ready for production:**

### **🔐 Authentication & User Management**
- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (Customer, Professional, Admin)
- ✅ User registration, login, logout, password reset
- ✅ Email verification and user profile management
- ✅ Professional profile creation and verification

### **📋 Core Business Logic**
- ✅ Service listing management with categories
- ✅ Professional availability scheduling
- ✅ Appointment booking and status tracking
- ✅ Payment processing with Stripe integration
- ✅ Wallet system with top-up and withdrawal
- ✅ Transaction history and fee management

### **💬 Communication Features**
- ✅ Real-time messaging with Socket.io
- ✅ Notification system for all platform events
- ✅ Review and rating system
- ✅ File upload for avatars and documents

### **👨‍💼 Admin Dashboard**
- ✅ Complete admin interface with analytics
- ✅ User management and professional verification
- ✅ Transaction monitoring and system settings
- ✅ Platform statistics and reporting

### **🗄️ Database & Infrastructure**
- ✅ PostgreSQL database with Prisma ORM
- ✅ Comprehensive database schema with relationships
- ✅ Migration scripts from WordPress
- ✅ Seed data for development and testing

### **🧪 Testing & Quality**
- ✅ Jest testing framework setup
- ✅ Comprehensive test coverage for authentication
- ✅ API endpoint testing with supertest
- ✅ Database testing utilities

## 🚀 Features

- **User Management**: Customer, Professional, and Admin roles with verification system
- **Professional Profiles**: Service provider listings with ratings and verification badges
- **Booking System**: Real-time appointment scheduling with availability management
- **Video Calling**: Integrated video consultations with file sharing capabilities
- **Payment System**: Wallet-based transactions with multiple payment gateways
- **Real-time Communication**: In-app messaging and notifications
- **Admin Dashboard**: Comprehensive platform management tools

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.io
- **Payments**: Stripe, PayPal integration
- **Email**: SendGrid
- **File Upload**: Multer with AWS S3 support

### Frontend
- **Framework**: React.js with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: React Query + Context API
- **Routing**: React Router v6
- **Real-time**: Socket.io Client
- **Forms**: React Hook Form with Zod validation
- **Styling**: Emotion (CSS-in-JS)

## 📁 Project Structure

```
YoruTestPlatform/development/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── migrations/      # Database migrations
│   ├── routes/          # API routes
│   ├── schedulers/      # Background jobs
│   ├── scripts/         # Utility scripts
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── server.ts        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API services
│   │   ├── utils/       # Helper functions
│   │   ├── types/       # TypeScript types
│   │   └── main.tsx     # App entry point
│   ├── dist/            # Build output
│   └── package.json
└── docs/                # Documentation
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up database:
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

5. **Optional**: Migrate from WordPress:
```bash
# Configure WordPress database connection in .env
npm run db:migrate-wp
```

6. Start development server:
```bash
npm run dev
```

The backend server will start on `http://localhost:3001`

### 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 📊 Database Management

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (⚠️ WARNING: Deletes all data)
npm run db:reset
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development server:
```bash
npm run dev
```

## 📚 API Documentation

The API follows RESTful conventions with the following main endpoints:

- `POST /api/auth/login` - User authentication
- `GET /api/users/profile` - Get user profile
- `GET /api/listings` - Get service listings
- `POST /api/appointments` - Create appointment
- `GET /api/payments/wallet` - Get wallet balance

## 🔧 Development

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run migrate` - Run database migrations

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Run migrations: `npm run migrate`
4. Start the server: `npm start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 📚 API Documentation

### **Authentication Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### **User Management**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/avatar` - Upload avatar
- `PUT /api/users/change-password` - Change password
- `GET /api/users/notifications` - Get notifications
- `GET /api/users/stats` - Get user statistics

### **Professional Services**
- `GET /api/professionals` - List all professionals
- `GET /api/professionals/:id` - Get professional details
- `POST /api/professionals` - Create professional profile
- `PUT /api/professionals/:id` - Update professional profile

### **Service Listings**
- `GET /api/listings` - List all services
- `GET /api/listings/:id` - Get service details
- `POST /api/listings` - Create new service
- `PUT /api/listings/:id` - Update service
- `DELETE /api/listings/:id` - Delete service
- `GET /api/listings/categories` - Get service categories

### **Appointments**
- `GET /api/appointments` - Get user appointments
- `GET /api/appointments/:id` - Get appointment details
- `POST /api/appointments` - Book new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### **Payments & Wallet**
- `GET /api/payments/wallet` - Get wallet balance
- `GET /api/payments/transactions` - Get transaction history
- `POST /api/payments/topup` - Top up wallet
- `POST /api/payments/withdraw` - Withdraw from wallet
- `GET /api/payments/methods` - Get payment methods

### **Communication**
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversation/:userId` - Get messages with user
- `POST /api/messages` - Send message
- `PUT /api/messages/read` - Mark messages as read

### **Reviews**
- `GET /api/reviews/professional/:id` - Get professional reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### **Admin Dashboard**
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/appointments` - Get all appointments
- `GET /api/admin/transactions` - Get all transactions

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/yoru_test_platform_db"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Email Configuration
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@yoru-test-platform.com"

# Payment Configuration
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"

# File Upload
UPLOAD_PATH="uploads"
MAX_FILE_SIZE="10485760"

# WordPress Migration (Optional)
WP_DB_HOST="localhost"
WP_DB_USER="root"
WP_DB_PASSWORD=""
WP_DB_NAME="wordpress"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@yoru-test-platform.com or create an issue in this repository.
