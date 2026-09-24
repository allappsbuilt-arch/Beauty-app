import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, setUnauthorizedHandler, warmUpServer } from '../api/client';

const TOKEN_KEY = 'beautyapp.authToken';
const USER_KEY = 'beautyapp.authUser';
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
    warmUpServer();
    (async () => {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY).catch(() => null);
      try {
        if (storedToken === GUEST_TOKEN) {
          setToken(storedToken);
          setUser(GUEST_USER);
        } else if (storedToken) {
          const { user: me } = await apiRequest('/api/auth/me', { token: storedToken });
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
          setToken(storedToken);
          setUser(me);
        }
      } catch (err) {
        if (err?.status === 401 || err?.status === 404) {
          // Token really is invalid — sign out.
          await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        } else {
          // Server asleep / offline — keep the session instead of logging the user out.
          const cached = await AsyncStorage.getItem(USER_KEY).catch(() => null);
          setToken(storedToken);
          setUser(cached ? JSON.parse(cached) : null);
        }
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
    await AsyncStorage.multiSet([[TOKEN_KEY, newToken], [USER_KEY, JSON.stringify(newUser)]]);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const signup = useCallback(async (name, email, password) => {
    setError(null);
    const { token: newToken, user: newUser } = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: { name, email, password },
    });
    await AsyncStorage.multiSet([[TOKEN_KEY, newToken], [USER_KEY, JSON.stringify(newUser)]]);
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
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setToken(null);
    setUser(null);
  }, []);

  // An expired/invalid token makes every request 401 — send the user back to
  // login rather than leaving them on screens that silently fail.
  useEffect(() => {
    setUnauthorizedHandler((rejectedToken) => {
      if (rejectedToken === GUEST_TOKEN) return;
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(
    () => ({ token, user, isLoading, isAuthenticated: !!token, isGuest: token === GUEST_TOKEN, error, setError, login, signup, logout, continueAsGuest }),
    [token, user, isLoading, error, login, signup, logout, continueAsGuest]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
