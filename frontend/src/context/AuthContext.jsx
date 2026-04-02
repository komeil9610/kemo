import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

const readStorage = (key) => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key, value) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
};

const removeStorage = (key) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    return;
  }
};

const normalizeRole = (role) => {
  if (role === 'admin') {
    return 'operations_manager';
  }
  return role || '';
};

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    role: normalizeRole(user.role),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = readStorage('authUser');
    if (!raw) {
      return null;
    }

    try {
      return normalizeUser(JSON.parse(raw));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => readStorage('authToken'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleInvalidSession = () => {
      setUser(null);
      setToken(null);
      setError('انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.');
      removeStorage('authToken');
      removeStorage('authUser');
    };

    window.addEventListener('auth-invalidated', handleInvalidSession);
    return () => window.removeEventListener('auth-invalidated', handleInvalidSession);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      const nextToken = response.data?.token;
      const nextUser = normalizeUser(response.data?.user);

      if (!nextToken || !nextUser) {
        throw new Error('Login response is incomplete');
      }

      setToken(nextToken);
      setUser(nextUser);
      writeStorage('authToken', nextToken);
      writeStorage('authUser', JSON.stringify(nextUser));
      return nextUser;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Sign in failed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    removeStorage('authToken');
    removeStorage('authUser');
    authService.logout();
  };

  const permissions = useMemo(
    () => ({
      canCreateOrders: user?.role === 'customer_service',
      canManageStatuses: user?.role === 'operations_manager',
      canViewBoard: ['customer_service', 'operations_manager'].includes(user?.role),
      canManageSystem: user?.role === 'operations_manager',
    }),
    [user?.role]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      login,
      logout,
      register: async () => false,
      permissions,
      isAdmin: user?.role === 'operations_manager',
    }),
    [error, loading, permissions, token, user]
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
