import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { LoadingScreen } from '../components/ui/LoadingSpinner';

/**
 * Route wrapper preventing authenticated users from accessing public-only pages like /login.
 */
export function PublicRoute({ children }) {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Checking authentication session..." />;
  }

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}

export default PublicRoute;
