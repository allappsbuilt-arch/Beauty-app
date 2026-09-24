import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../api/client';

const TOKEN_KEY = 'beautyapp.authToken';
// Dev-only sentinel token used by continueAsGuest() below to preview the app
// without a live backend. Never issued by the real /api/auth endpoints.
const GUEST_TOKEN = 'dev-guest-preview';
const GUEST_USER = { id: 'guest', name: 'Guest', email: 'guest@preview.local', createdAt: new Date().toISOString() };
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (storedToken === GUEST_TOKEN) {
          setToken(storedToken);
          setUser(GUEST_USER);
        } else if (storedToken) {
          const { user: me } = await apiRequest('/api/auth/me', { token: storedToken });
          setToken(storedToken);
          setUser(me);
        }
      } catch (err) {
        await AsyncStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    const { token: newToken, user: newUser } = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const signup = useCallback(async (name, email, password) => {
    setError(null);
    const { token: newToken, user: newUser } = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: { name, email, password },
    });
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  // Dev-only: preview the app UI without a working backend connection.
  const continueAsGuest = useCallback(async () => {
    setError(null);
    await AsyncStorage.setItem(TOKEN_KEY, GUEST_TOKEN);
    setToken(GUEST_TOKEN);
    setUser(GUEST_USER);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, isLoading, isAuthenticated: !!token, error, setError, login, signup, logout, continueAsGuest }),
    [token, user, isLoading, error, login, signup, logout, continueAsGuest]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
