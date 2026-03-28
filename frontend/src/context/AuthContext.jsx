// React Context for State Management
import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/api';

// Create Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      localStorage.setItem('authToken', nextToken);
      localStorage.setItem('authUser', JSON.stringify(nextUser));
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
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
      localStorage.setItem('authToken', nextToken);
      localStorage.setItem('authUser', JSON.stringify(nextUser));
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
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, register }}>
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
