// React Context for State Management
import React, { createContext, useContext, useState } from 'react';

// Create Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Call API
      // const response = await authService.login(email, password);
      // setToken(response.data.token);
      // setUser(response.data.user);
      // localStorage.setItem('authToken', response.data.token);
      
      console.log('Login successful');
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
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Call API
      // const response = await authService.register(userData);
      // setToken(response.data.token);
      // setUser(response.data.user);
      // localStorage.setItem('authToken', response.data.token);
      
      console.log('Registration successful');
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
