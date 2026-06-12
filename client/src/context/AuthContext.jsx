import { createContext, useCallback, useEffect, useState } from 'react';
import {
  fetchMe,
  hasToken,
  loginUser,
  logoutUser,
  registerUser,
  updateProfile as updateProfileRequest,
} from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Restore the session on first load if a token is stored
  useEffect(() => {
    if (!hasToken()) {
      setInitializing(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setInitializing(false));
  }, []);

  // api.js fires this when the server rejects our token
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const register = useCallback(async (details) => {
    const newUser = await registerUser(details);
    setUser(newUser);
    return newUser;
  }, []);

  const login = useCallback(async (credentials) => {
    const loggedIn = await loginUser(credentials);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const updated = await updateProfileRequest(updates);
    setUser(updated);
    return updated;
  }, []);

  const value = { user, initializing, register, login, logout, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
