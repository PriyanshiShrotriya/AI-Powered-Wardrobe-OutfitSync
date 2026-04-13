import { createContext, useContext, useMemo, useState } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'outfitsync_auth';

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { token: '', user: null };
    }

    const parsed = JSON.parse(raw);
    setAuthToken(parsed.token);
    return parsed;
  });

  const saveAuth = (payload) => {
    setAuth(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setAuthToken(payload.token);
  };

  const clearAuth = () => {
    setAuth({ token: '', user: null });
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken('');
  };

  const register = async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    saveAuth(response.data);
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    saveAuth(response.data);
  };

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: Boolean(auth.token),
      register,
      login,
      logout: clearAuth,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
