import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Alert, AlertTitle } from '@mui/material';
import { Refresh, BugReport } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // You can log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="400px"
          p={4}
          textAlign="center"
        >
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
            <AlertTitle>Something went wrong</AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </Typography>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  <strong>Error:</strong> {this.state.error.message}
                </Typography>
                {this.state.error.stack && (
                  <Typography variant="caption" component="pre" sx={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.7rem',
                    mt: 1,
                    maxHeight: 200,
                    overflow: 'auto',
                    backgroundColor: 'grey.100',
                    p: 1,
                    borderRadius: 1
                  }}>
                    {this.state.error.stack}
                  </Typography>
                )}
              </Box>
            )}
          </Alert>

          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={this.handleReload}
            >
              Reload Page
            </Button>
            <Button
              variant="outlined"
              startIcon={<BugReport />}
              onClick={this.handleReset}
            >
              Try Again
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);
    // You can implement custom error handling logic here
  };
};

// Simple error fallback component
export const ErrorFallback: React.FC<{ error?: Error; resetError?: () => void }> = ({ 
  error, 
  resetError 
}) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    p={4}
    textAlign="center"
  >
    <Typography variant="h6" color="error" gutterBottom>
      Oops! Something went wrong
    </Typography>
    <Typography variant="body2" color="text.secondary" paragraph>
      {error?.message || 'An unexpected error occurred'}
    </Typography>
    {resetError && (
      <Button variant="outlined" onClick={resetError}>
        Try Again
      </Button>
    )}
  </Box>
);

export default ErrorBoundary;
