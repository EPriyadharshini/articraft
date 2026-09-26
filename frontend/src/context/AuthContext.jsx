import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const storedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('articraft-user')) || null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedUser);
  const [token, setToken] = useState(() => localStorage.getItem('articraft-token') || '');
  const [loading, setLoading] = useState(Boolean(token));
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setToken('');
      setSessionExpired(true);
    };
    window.addEventListener('articraft:unauthorized', onUnauthorized);
    return () => window.removeEventListener('articraft:unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    api.get('/auth/me')
      .then((response) => {
        if (active) setUser(response.data.data.user);
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setToken('');
          setSessionExpired(true);
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [token]);

  const saveSession = (session) => {
    setUser(session.user);
    setToken(session.token);
    setSessionExpired(false);
    localStorage.setItem('articraft-user', JSON.stringify(session.user));
    localStorage.setItem('articraft-token', session.token);
  };

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    saveSession(response.data.data);
    return response.data.data.user;
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload);
    saveSession(response.data.data);
    return response.data.data.user;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    setSessionExpired(false);
    localStorage.removeItem('articraft-user');
    localStorage.removeItem('articraft-token');
  };

  const value = useMemo(() => ({ user, token, loading, sessionExpired, login, register, logout, saveSession, setUser }), [user, token, loading, sessionExpired]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
