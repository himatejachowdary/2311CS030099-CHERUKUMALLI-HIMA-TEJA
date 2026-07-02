import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'student' | 'agent' | 'admin'>;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress size={50} color="primary" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Verifying your credentials...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    // Redirect to login page but save the current location they tried to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Role is not authorized. Redirect to home dashboard
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
