import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  CalendarToday,
  AccountBalanceWallet,
  Star,
  Business,
  Assignment,
} from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'primary',
  loading = false,
}) => {
  const isPositiveChange = change && change > 0;
  const isNegativeChange = change && change < 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {loading ? '-' : value}
            </Typography>
            {change !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {isPositiveChange && <TrendingUp color="success" fontSize="small" />}
                {isNegativeChange && <TrendingDown color="error" fontSize="small" />}
                <Typography
                  variant="body2"
                  color={isPositiveChange ? 'success.main' : isNegativeChange ? 'error.main' : 'text.secondary'}
                  sx={{ ml: 0.5 }}
                >
                  {change > 0 ? '+' : ''}{change}%
                </Typography>
                {changeLabel && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {changeLabel}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        {loading && <LinearProgress sx={{ mt: 2 }} />}
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  userRole: 'customer' | 'professional' | 'admin';
  stats?: {
    totalAppointments?: number;
    completedAppointments?: number;
    totalEarnings?: number;
    walletBalance?: number;
    rating?: number;
    totalReviews?: number;
    activeListings?: number;
    totalUsers?: number;
    totalProfessionals?: number;
    totalRevenue?: number;
    monthlyGrowth?: {
      appointments?: number;
      earnings?: number;
      users?: number;
      revenue?: number;
    };
  };
  loading?: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  userRole,
  stats = {},
  loading = false,
}) => {
  const renderCustomerStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments || 0}
          change={stats.monthlyGrowth?.appointments}
          changeLabel="this month"
          icon={<CalendarToday />}
          color="primary"
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Completed Sessions"
          value={stats.completedAppointments || 0}
          icon={<Assignment />}
          color="success"
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Wallet Balance"
          value={`₱${stats.walletBalance || 0}`}
          icon={<AccountBalanceWallet />}
          color="warning"
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Favorite Professionals"
          value={12} // Mock data
          icon={<Star />}
          color="secondary"
          loading={loading}
        />
      </Grid>
    </Grid>
  );

  const renderProfessionalStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments || 0}
          change={stats.monthlyGrowth?.appointments}
          changeLabel="this month"
          icon={<CalendarToday />}
          color="primary"
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Earnings"
          value={`₱${stats.totalEarnings || 0}`}
          change={stats.monthlyGrowth?.earnings}
          changeLabel="this month"
          icon={<AccountBalanceWallet />}
          color="success"
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Average Rating"
          value={stats.rating ? `${stats.rating.toFixed(1)} ⭐` : 'No ratings'}
          icon={<Star />}
          color="warning"
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Active Listings"
          value={stats.activeListings || 0}
          icon={<Business />}
          color="secondary"
          loading={loading}
        />
      </Grid>
    </Grid>
  );

  const renderAdminStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          change={stats.monthlyGrowth?.users}
          changeLabel="this month"
          icon={<People />}
          color="primary"
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Professionals"
          value={stats.totalProfessionals || 0}
          icon={<Business />}
          color="secondary"
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments || 0}
          change={stats.monthlyGrowth?.appointments}
          changeLabel="this month"
          icon={<CalendarToday />}
          color="success"
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Platform Revenue"
          value={`₱${stats.totalRevenue || 0}`}
          change={stats.monthlyGrowth?.revenue}
          changeLabel="this month"
          icon={<AccountBalanceWallet />}
          color="warning"
          loading={loading}
        />
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          Dashboard Overview
        </Typography>
        <Chip
          label={`${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {userRole === 'customer' && renderCustomerStats()}
      {userRole === 'professional' && renderProfessionalStats()}
      {userRole === 'admin' && renderAdminStats()}
    </Box>
  );
};

export default DashboardStats;
