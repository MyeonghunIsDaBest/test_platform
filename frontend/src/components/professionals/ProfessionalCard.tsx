import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Verified,
  Star,
  Schedule,
  VideoCall,
  Favorite,
  FavoriteBorder,
  Share,
} from '@mui/icons-material';
import { Professional } from '../../types';

interface ProfessionalCardProps {
  professional: Professional;
  onBookAppointment?: (professionalId: string) => void;
  onViewProfile?: (professionalId: string) => void;
  onToggleFavorite?: (professionalId: string) => void;
  onShare?: (professionalId: string) => void;
  isFavorite?: boolean;
  showActions?: boolean;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  onBookAppointment,
  onViewProfile,
  onToggleFavorite,
  onShare,
  isFavorite = false,
  showActions = true,
}) => {
  const handleBookAppointment = () => {
    onBookAppointment?.(professional.id);
  };

  const handleViewProfile = () => {
    onViewProfile?.(professional.id);
  };

  const handleToggleFavorite = () => {
    onToggleFavorite?.(professional.id);
  };

  const handleShare = () => {
    onShare?.(professional.id);
  };

  const getVerificationCount = () => {
    const verifications = professional.verifications;
    return Object.values(verifications).filter(Boolean).length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Header with Avatar and Basic Info */}
        <Box display="flex" alignItems="flex-start" mb={2}>
          <Avatar
            src={professional.user.avatar}
            sx={{ width: 64, height: 64, mr: 2 }}
          >
            {professional.user.firstName[0]}{professional.user.lastName[0]}
          </Avatar>
          
          <Box flexGrow={1}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography variant="h6" component="h3" noWrap>
                {professional.user.firstName} {professional.user.lastName}
              </Typography>
              {getVerificationCount() >= 3 && (
                <Tooltip title="Verified Professional">
                  <Verified color="primary" fontSize="small" />
                </Tooltip>
              )}
            </Box>
            
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Rating
                value={professional.rating}
                precision={0.1}
                size="small"
                readOnly
              />
              <Typography variant="body2" color="text.secondary">
                ({professional.totalReviews})
              </Typography>
            </Box>

            <Chip
              label={professional.status}
              size="small"
              color={getStatusColor(professional.status) as any}
              variant="outlined"
            />
          </Box>

          {showActions && (
            <Box display="flex" flexDirection="column" gap={0.5}>
              <IconButton
                size="small"
                onClick={handleToggleFavorite}
                color={isFavorite ? 'error' : 'default'}
              >
                {isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              <IconButton size="small" onClick={handleShare}>
                <Share />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Experience and Skills */}
        <Typography variant="body2" color="text.secondary" paragraph>
          {professional.experience}
        </Typography>

        {/* Skills */}
        <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
          {professional.skills.slice(0, 3).map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              size="small"
              variant="outlined"
              color="primary"
            />
          ))}
          {professional.skills.length > 3 && (
            <Chip
              label={`+${professional.skills.length - 3} more`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {/* Pricing and Availability */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Schedule fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Available today
            </Typography>
          </Box>
          
          <Typography variant="h6" color="primary">
            ₱{professional.hourlyRate}/hr
          </Typography>
        </Box>

        {/* Verification Badges */}
        <Box display="flex" gap={1} flexWrap="wrap">
          {professional.verifications.identityVerified && (
            <Chip
              label="ID Verified"
              size="small"
              color="success"
              variant="filled"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
          {professional.verifications.contactVerified && (
            <Chip
              label="Contact Verified"
              size="small"
              color="success"
              variant="filled"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
          {professional.verifications.emailVerified && (
            <Chip
              label="Email Verified"
              size="small"
              color="success"
              variant="filled"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>
      </CardContent>

      {showActions && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleViewProfile}
            sx={{ mr: 1 }}
          >
            View Profile
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<VideoCall />}
            onClick={handleBookAppointment}
          >
            Book Now
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default ProfessionalCard;
