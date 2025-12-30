import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, login as apiLogin } from '../api/auth.api';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Fetch user on mount
  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser(me.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Refetch user permissions when route changes (in case admin updated role permissions)
  useEffect(() => {
    if (!loading && user) {
      (async () => {
        try {
          const me = await getMe();
          setUser(me.user);
        } catch (err) {
          // Ignore errors on background refresh
        }
      })();
    }
  }, [location.pathname]);

  const login = useCallback(async (payload) => {
    const res = await apiLogin(payload);
    setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  const refetchUser = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me.user);
    } catch (err) {
      // Silent fail
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
