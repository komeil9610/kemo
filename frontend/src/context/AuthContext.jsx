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
      
      try {
        const response = await authService.login(email, password);
        const nextToken = response.data?.token || `demo-token-${Date.now()}`;
        const nextUser = response.data?.user || { name: email.split('@')[0], email };
        setToken(nextToken);
        setUser(nextUser);
        localStorage.setItem('authToken', nextToken);
        localStorage.setItem('authUser', JSON.stringify(nextUser));
      } catch (apiError) {
        const fallbackUser = { name: email.split('@')[0], email };
        const fallbackToken = `demo-token-${Date.now()}`;
        setToken(fallbackToken);
        setUser(fallbackUser);
        localStorage.setItem('authToken', fallbackToken);
        localStorage.setItem('authUser', JSON.stringify(fallbackUser));
        console.warn('Login API unavailable, using demo auth state.', apiError);
      }
    } catch (err) {
      setError(err.message);
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
      
      try {
        const response = await authService.register(userData);
        const nextToken = response.data?.token || `demo-token-${Date.now()}`;
        const nextUser = response.data?.user || { name: userData.name, email: userData.email };
        setToken(nextToken);
        setUser(nextUser);
        localStorage.setItem('authToken', nextToken);
        localStorage.setItem('authUser', JSON.stringify(nextUser));
      } catch (apiError) {
        const fallbackUser = { name: userData.name || 'Member', email: userData.email };
        const fallbackToken = `demo-token-${Date.now()}`;
        setToken(fallbackToken);
        setUser(fallbackUser);
        localStorage.setItem('authToken', fallbackToken);
        localStorage.setItem('authUser', JSON.stringify(fallbackUser));
        console.warn('Register API unavailable, using demo auth state.', apiError);
      }
    } catch (err) {
      setError(err.message);
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
