import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, setUnauthorizedHandler, warmUpServer } from '../api/client';

const TOKEN_KEY = 'beautyapp.authToken';
const USER_KEY = 'beautyapp.authUser';
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
        // (A token left over from the removed guest preview mode is rejected
        // by /api/auth/me with 401, which signs the user out below.)
        if (storedToken) {
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

  const signup = useCallback(async (name, email, password, referralCode) => {
    setError(null);
    const { token: newToken, user: newUser } = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: { name, email, password, ...(referralCode ? { referralCode } : {}) },
    });
    await AsyncStorage.multiSet([[TOKEN_KEY, newToken], [USER_KEY, JSON.stringify(newUser)]]);
    setToken(newToken);
    setUser(newUser);
  }, []);

  // Rename the signed-in user; the new name shows everywhere immediately.
  const updateProfile = useCallback(async ({ name }) => {
    const { user: updated } = await apiRequest('/api/auth/me', { method: 'PATCH', body: { name }, token });
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, [token]);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setToken(null);
    setUser(null);
  }, []);

  // An expired/invalid token makes every request 401 — send the user back to
  // login rather than leaving them on screens that silently fail.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(
    () => ({ token, user, isLoading, isAuthenticated: !!token, error, setError, login, signup, logout, updateProfile }),
    [token, user, isLoading, error, login, signup, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
