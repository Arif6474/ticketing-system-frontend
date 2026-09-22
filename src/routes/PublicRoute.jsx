import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

/**
 * Route wrapper that prevents authenticated users from accessing public-only pages like /login.
 */
export function PublicRoute({ children }) {
  const authenticated = isAuthenticated();

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}

export default PublicRoute;
