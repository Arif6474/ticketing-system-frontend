import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook providing access to real authentication state and actions.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
