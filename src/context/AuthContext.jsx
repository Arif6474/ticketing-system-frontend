import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken, setUser, getUser, clearAuth } from '../utils/auth';
import { loginApi, getMeApi } from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setCurrentUser] = useState(getUser());
  const [authenticated, setAuthenticated] = useState(Boolean(getToken()));
  const [loading, setLoading] = useState(true);

  // Restore & validate session on application mount
  const restoreSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setCurrentUser(null);
      setAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const userData = await getMeApi();
      setUser(userData);
      setCurrentUser(userData);
      setAuthenticated(true);
    } catch {
      clearAuth();
      setCurrentUser(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Handle unauthorized event dispatched by Axios client on 401
  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuth();
      setCurrentUser(null);
      setAuthenticated(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  /**
   * Perform authentication login call.
   */
  const login = async (email, password) => {
    const response = await loginApi({ email, password });
    const { accessToken, user: userData } = response;
    
    setToken(accessToken);
    setUser(userData);
    setCurrentUser(userData);
    setAuthenticated(true);

    return response;
  };

  /**
   * Perform logout.
   */
  const logout = () => {
    clearAuth();
    setCurrentUser(null);
    setAuthenticated(false);
  };

  /**
   * Refresh current user profile data from backend.
   */
  const refreshUser = async () => {
    try {
      const userData = await getMeApi();
      setUser(userData);
      setCurrentUser(userData);
      return userData;
    } catch (err) {
      logout();
      throw err;
    }
  };

  const value = {
    user,
    authenticated,
    loading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
