import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import api from '../utils/api';

// A wrapper for routes that should only be accessible to authenticated users
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true/false = result
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        // Set the auth header
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        
        // Verify token by fetching user profile
        const response = await api.get('/user/me');
        console.log("User profile fetched:", response.data);
        setUserRole(response.data.role);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  // Show loading indicator while checking authentication
  if (isAuthenticated === null) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a role is required, check if the user has that role
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = userRole === 'expert' ? '/expert-dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and has the required role (or no role is required)
  return children;
};

export default ProtectedRoute;
