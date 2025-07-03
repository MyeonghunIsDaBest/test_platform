import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import ErrorBoundary from './components/common/ErrorBoundary'
import Layout from './components/common/Layout'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import DashboardStats from './components/dashboard/DashboardStats'
import ProfessionalCard from './components/professionals/ProfessionalCard'
import BookingForm from './components/appointments/BookingForm'
import { useState } from 'react'

// Mock data for demonstration
const mockProfessional = {
  id: '1',
  userId: '1',
  user: {
    id: '1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    avatar: null,
    role: 'professional' as const,
    onlineStatus: 'online' as const,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  hourlyRate: 150,
  experience: '5+ years in web development and consulting',
  skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
  rating: 4.8,
  totalReviews: 127,
  status: 'active' as const,
  verifications: {
    identityVerified: true,
    contactVerified: true,
    emailVerified: true,
    facebookVerified: false,
    linkedinVerified: true,
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockListing = {
  id: '1',
  professionalId: '1',
  professional: mockProfessional,
  title: 'Web Development Consultation',
  description: 'Get expert advice on your web development projects',
  categoryId: '1',
  category: { id: '1', name: 'Technology', description: 'Tech services' },
  price: 150,
  duration: 60,
  status: 'active' as const,
  availability: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

// Page Components
const HomePage = () => (
  <DashboardStats
    userRole="customer"
    stats={{
      totalAppointments: 12,
      completedAppointments: 8,
      walletBalance: 2500,
      monthlyGrowth: { appointments: 15 }
    }}
  />
);

const ProfessionalsPage = () => {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
        <ProfessionalCard
          professional={mockProfessional}
          onBookAppointment={() => setBookingOpen(true)}
          onViewProfile={(id) => console.log('View profile:', id)}
        />
        <ProfessionalCard
          professional={mockProfessional}
          onBookAppointment={() => setBookingOpen(true)}
          onViewProfile={(id) => console.log('View profile:', id)}
        />
      </Box>

      <BookingForm
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        professional={mockProfessional}
        listing={mockListing}
        onSubmit={async (data) => {
          console.log('Booking data:', data);
          setBookingOpen(false);
        }}
      />
    </Box>
  );
};

const DashboardPage = () => (
  <DashboardStats
    userRole="professional"
    stats={{
      totalAppointments: 45,
      totalEarnings: 12500,
      rating: 4.8,
      activeListings: 3,
      monthlyGrowth: { appointments: 20, earnings: 25 }
    }}
  />
);

const AdminPage = () => (
  <DashboardStats
    userRole="admin"
    stats={{
      totalUsers: 1250,
      totalProfessionals: 180,
      totalAppointments: 3420,
      totalRevenue: 125000,
      monthlyGrowth: { users: 12, appointments: 18, revenue: 22 }
    }}
  />
);

// Auth wrapper component
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = true; // Mock auth state

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Protected routes */}
        <Route path="/" element={
          <AuthWrapper>
            <HomePage />
          </AuthWrapper>
        } />
        <Route path="/professionals" element={
          <AuthWrapper>
            <ProfessionalsPage />
          </AuthWrapper>
        } />
        <Route path="/dashboard" element={
          <AuthWrapper>
            <DashboardPage />
          </AuthWrapper>
        } />
        <Route path="/admin" element={
          <AuthWrapper>
            <AdminPage />
          </AuthWrapper>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
