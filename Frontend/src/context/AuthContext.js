import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, setUnauthorizedHandler, warmUpServer } from '../api/client';

const TOKEN_KEY = 'beautyapp.authToken';
const USER_KEY = 'beautyapp.authUser';
// Set once anyone has signed in on this device, so the next signed-out launch
// opens Login instead of the new-user welcome.
const RETURNING_KEY = 'beautyapp.returningDevice';
// Per-user cache of a finished onboarding, so a completed user opens straight
// to Home even while the server is waking up.
const onboardedKey = (userId) => `beautyapp.onboarded.${userId}`;
const AuthContext = createContext(null);

// Whether this user still has to finish onboarding. The server's preferences
// are the source of truth; the local cache only ever short-circuits to "done".
async function loadOnboardingPending(token, userId) {
  if (userId && (await AsyncStorage.getItem(onboardedKey(userId)).catch(() => null))) return false;
  try {
    const { preferences } = await apiRequest('/api/preferences', { token });
    const pending = preferences?.onboarding?.completed === false;
    if (!pending && userId) await AsyncStorage.setItem(onboardedKey(userId), '1').catch(() => {});
    return pending;
  } catch {
    // Offline: never trap an existing user behind onboarding.
    return false;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // null while unknown; true = show onboarding before the main app.
  const [onboardingPending, setOnboardingPending] = useState(null);
  const [isReturningDevice, setIsReturningDevice] = useState(false);

  useEffect(() => {
    warmUpServer();
    (async () => {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY).catch(() => null);
      setIsReturningDevice(!!(await AsyncStorage.getItem(RETURNING_KEY).catch(() => null)));
      try {
        // (A token left over from the removed guest preview mode is rejected
        // by /api/auth/me with 401, which signs the user out below.)
        if (storedToken) {
          const { user: me } = await apiRequest('/api/auth/me', { token: storedToken });
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
          setOnboardingPending(await loadOnboardingPending(storedToken, me.id));
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
          setOnboardingPending(false);
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
    await AsyncStorage.multiSet([[TOKEN_KEY, newToken], [USER_KEY, JSON.stringify(newUser)], [RETURNING_KEY, '1']]);
    setOnboardingPending(await loadOnboardingPending(newToken, newUser.id));
    setIsReturningDevice(true);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const signup = useCallback(async (name, email, password, referralCode) => {
    setError(null);
    const { token: newToken, user: newUser } = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: { name, email, password, ...(referralCode ? { referralCode } : {}) },
    });
    await AsyncStorage.multiSet([[TOKEN_KEY, newToken], [USER_KEY, JSON.stringify(newUser)], [RETURNING_KEY, '1']]);
    // The backend starts every new account on onboarding.
    setOnboardingPending(true);
    setIsReturningDevice(true);
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

  // Marks onboarding finished (or skipped) for the signed-in user; the
  // navigator then swaps the onboarding screens for the main app.
  const completeOnboarding = useCallback(async () => {
    await apiRequest('/api/preferences', {
      method: 'PATCH',
      body: { onboarding: { completed: true, completedAt: new Date().toISOString() } },
      token,
    });
    if (user?.id) await AsyncStorage.setItem(onboardedKey(user.id), '1').catch(() => {});
    setOnboardingPending(false);
  }, [token, user?.id]);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setToken(null);
    setUser(null);
    setOnboardingPending(null);
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
    () => ({
      token, user, isLoading, isAuthenticated: !!token, error, setError, login, signup, logout, updateProfile,
      onboardingPending: !!token && onboardingPending === true, isReturningDevice, completeOnboarding,
    }),
    [token, user, isLoading, error, login, signup, logout, updateProfile, onboardingPending, isReturningDevice, completeOnboarding]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
