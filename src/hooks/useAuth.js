import { useState, useEffect } from 'react';
import { getToken, getUser, setToken, setUser, clearAuth, isAuthenticated } from '../utils/auth';

/**
 * Custom hook providing access to auth state and methods.
 */
export function useAuth() {
  const [user, setCurrentUser] = useState(getUser());
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  useEffect(() => {
    const token = getToken();
    setAuthenticated(Boolean(token));
    setCurrentUser(getUser());
  }, []);

  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
    setCurrentUser(userData);
    setAuthenticated(true);
  };

  const logout = () => {
    clearAuth();
    setCurrentUser(null);
    setAuthenticated(false);
  };

  return {
    user,
    authenticated,
    login,
    logout,
  };
}

export default useAuth;
