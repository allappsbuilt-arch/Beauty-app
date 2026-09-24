import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from './client';

// Binds the current auth token to apiRequest so screens don't repeat it.
export function useAuthedRequest() {
  const { token } = useAuth();

  return useCallback(
    (path, options = {}) => apiRequest(path, { ...options, token }),
    [token]
  );
}
