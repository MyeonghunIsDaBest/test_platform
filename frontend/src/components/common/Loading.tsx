import React from 'react';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';

interface LoadingProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = 40, 
  message = 'Loading...', 
  fullScreen = false 
}) => {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="rgba(255, 255, 255, 0.8)"
        zIndex={9999}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight={200}
    >
      {content}
    </Box>
  );
};

interface SkeletonLoaderProps {
  type: 'card' | 'list' | 'profile' | 'table';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Skeleton variant="rectangular" width="100%" height={200} />
            <Box sx={{ pt: 2 }}>
              <Skeleton width="60%" />
              <Skeleton width="40%" />
              <Skeleton width="80%" />
            </Box>
          </Box>
        );
      
      case 'list':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="60%" />
              <Skeleton width="40%" />
            </Box>
          </Box>
        );
      
      case 'profile':
        return (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton width="50%" sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton width="30%" sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton width="80%" sx={{ mx: 'auto' }} />
          </Box>
        );
      
      case 'table':
        return (
          <Box>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, p: 1 }}>
                <Skeleton width="20%" />
                <Skeleton width="30%" />
                <Skeleton width="25%" />
                <Skeleton width="25%" />
              </Box>
            ))}
          </Box>
        );
      
      default:
        return <Skeleton />;
    }
  };

  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ mb: type === 'card' ? 2 : 0 }}>
          {renderSkeleton()}
        </Box>
      ))}
    </Box>
  );
};

export default Loading;
