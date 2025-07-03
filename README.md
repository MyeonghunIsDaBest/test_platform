# Negus Platform

A modern professional services marketplace built with React.js and Node.js, converted from the original Gigant WordPress theme.

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
Negus/development/
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
npm run db:generate
npm run migrate
npm run seed
```

5. Start development server:
```bash
npm run dev
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@negus.com or create an issue in this repository.
