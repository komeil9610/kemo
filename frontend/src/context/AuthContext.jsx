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
  return role || '';
};

const ACTIVE_WORKSPACE_ROLES = ['admin', 'operations_manager', 'excel_uploader', 'technician'];

const normalizeWorkspaceRoles = (roles = [], fallbackRole = '') => {
  const merged = [...(Array.isArray(roles) ? roles : [roles]), fallbackRole]
    .map((role) => normalizeRole(role))
    .filter((role) => Boolean(role) && ACTIVE_WORKSPACE_ROLES.includes(role));
  return [...new Set(merged)];
};

const resolveWorkspaceRole = (requestedRole, roles = [], fallbackRole = '') => {
  const workspaceRoles = normalizeWorkspaceRoles(roles, fallbackRole);
  const normalizedRequestedRole = normalizeRole(requestedRole);
  if (normalizedRequestedRole && workspaceRoles.includes(normalizedRequestedRole)) {
    return normalizedRequestedRole;
  }
  if (workspaceRoles.includes('admin')) {
    return 'admin';
  }
  if (workspaceRoles.includes('operations_manager')) {
    return 'operations_manager';
  }
  if (workspaceRoles.includes('excel_uploader')) {
    return 'excel_uploader';
  }
  if (workspaceRoles.includes('technician')) {
    return 'technician';
  }
  return workspaceRoles[0] || '';
};

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  const workspaceRoles = normalizeWorkspaceRoles(user.workspaceRoles || user.roles, user.role);

  return {
    ...user,
    role: resolveWorkspaceRole(user.role, workspaceRoles, user.role),
    workspaceRoles,
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

  const persistAuthState = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    writeStorage('authToken', nextToken);
    writeStorage('authUser', JSON.stringify(nextUser));
  };

  const login = async (email, password, workspaceRole = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password, workspaceRole);
      const nextToken = response.data?.token;
      const nextUser = normalizeUser(response.data?.user);

      if (!nextToken || !nextUser) {
        throw new Error('Login response is incomplete');
      }

      persistAuthState(nextToken, nextUser);
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

  const setActiveRole = (nextRole) => {
    setUser((current) => {
      const normalizedCurrent = normalizeUser(current);
      if (!normalizedCurrent) {
        return current;
      }

      const resolvedRole = resolveWorkspaceRole(nextRole, normalizedCurrent.workspaceRoles, normalizedCurrent.role);
      if (!resolvedRole || resolvedRole === normalizedCurrent.role) {
        return normalizedCurrent;
      }

      const nextUser = {
        ...normalizedCurrent,
        role: resolvedRole,
      };
      writeStorage('authUser', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const permissions = useMemo(
    () => ({
      canCreateOrders: user?.role === 'admin',
      canManageStatuses: ['admin', 'operations_manager', 'technician'].includes(user?.role),
      canViewBoard: ['admin', 'operations_manager', 'excel_uploader', 'technician'].includes(user?.role),
      canManageSystem: user?.role === 'admin',
      canManageExcelImports: ['admin', 'excel_uploader'].includes(user?.role),
    }),
    [user?.role]
  );

  const value = {
    user,
    token,
    loading,
    error,
    login,
    setActiveRole,
    logout,
    register: async () => false,
    permissions,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
