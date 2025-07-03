import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Chip,
} from '@mui/material';
import {
  Search,
  VideoCall,
  Security,
  Star,
  TrendingUp,
  People,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <VideoCall sx={{ fontSize: 40 }} />,
      title: 'Video Consultations',
      description: 'Connect with professionals through high-quality video calls',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Verified Professionals',
      description: 'All professionals are verified and background-checked',
    },
    {
      icon: <Star sx={{ fontSize: 40 }} />,
      title: 'Rated & Reviewed',
      description: 'Choose based on real reviews from other customers',
    },
  ];

  const topProfessionals = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Business Consultant',
      rating: 4.9,
      reviews: 156,
      avatar: null,
      hourlyRate: 200,
    },
    {
      id: '2',
      name: 'Mark Chen',
      specialty: 'Tech Expert',
      rating: 4.8,
      reviews: 89,
      avatar: null,
      hourlyRate: 150,
    },
    {
      id: '3',
      name: 'Lisa Rodriguez',
      specialty: 'Legal Advisor',
      rating: 4.9,
      reviews: 203,
      avatar: null,
      hourlyRate: 250,
    },
  ];

  const stats = [
    { label: 'Active Professionals', value: '500+', icon: <People /> },
    { label: 'Successful Sessions', value: '10K+', icon: <TrendingUp /> },
    { label: 'Average Rating', value: '4.8', icon: <Star /> },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                Connect with Expert Professionals
              </Typography>
              <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
                Get instant access to verified professionals for video consultations.
                Book appointments, get expert advice, and grow your business.
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                  startIcon={<Search />}
                  onClick={() => navigate('/professionals')}
                >
                  Find Professionals
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                  onClick={() => navigate('/register')}
                >
                  Become a Professional
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 300,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                }}
              >
                <VideoCall sx={{ fontSize: 120, opacity: 0.7 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Stats Section */}
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h3" component="div" fontWeight="bold" gutterBottom>
                      {stat.value}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Why Choose Negus?
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" paragraph>
            We make it easy to connect with the right professionals
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Top Professionals Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Top Rated Professionals
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" paragraph>
            Connect with our highest-rated experts
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {topProfessionals.map((professional) => (
              <Grid item xs={12} md={4} key={professional.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar
                      sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                      src={professional.avatar || undefined}
                    >
                      {professional.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {professional.name}
                    </Typography>
                    <Chip
                      label={professional.specialty}
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
                      <Rating value={professional.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="body2" color="text.secondary">
                        ({professional.reviews})
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary" gutterBottom>
                      ₱{professional.hourlyRate}/hr
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate('/professionals')}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            p: 6,
            borderRadius: 2,
            textAlign: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
            Join thousands of satisfied customers and professionals on Negus
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
              }}
              onClick={() => navigate('/register')}
            >
              Sign Up Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
              onClick={() => navigate('/professionals')}
            >
              Browse Professionals
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
