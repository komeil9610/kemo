// React Context for State Management
import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/api';

// Create Auth Context
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = readStorage('authUser');
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => readStorage('authToken'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const permissions = {
    canManageSystem: user?.role === 'admin',
    canManageOrders: user?.role === 'admin',
    canEditSubmittedOrders: user?.role === 'admin',
    canManageTechnicians: user?.role === 'admin',
    canManageSettings: user?.role === 'admin',
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      const nextToken = response.data?.token;
      const nextUser = response.data?.user;
      if (!nextToken || !nextUser) {
        throw new Error('Login response is incomplete');
      }
      setToken(nextToken);
      setUser(nextUser);
      writeStorage('authToken', nextToken);
      writeStorage('authUser', JSON.stringify(nextUser));
      return true;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Sign in failed';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeStorage('authToken');
    removeStorage('authUser');
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      const nextToken = response.data?.token;
      const nextUser = response.data?.user;
      if (!nextToken || !nextUser) {
        throw new Error('Register response is incomplete');
      }
      setToken(nextToken);
      setUser(nextUser);
      writeStorage('authToken', nextToken);
      writeStorage('authUser', JSON.stringify(nextUser));
      return true;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Account creation failed';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        register,
        isAdmin: user?.role === 'admin',
        permissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
