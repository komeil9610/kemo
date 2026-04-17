import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false, allowedRoles = [] }) {
  const { token, user, permissions, setActiveRole } = useAuth();
  const location = useLocation();
  const workspaceRoles = Array.isArray(user?.workspaceRoles) ? user.workspaceRoles : [];
  const adminCanAccess =
    user?.role === 'admin' &&
    allowedRoles.some((role) => ['admin', 'operations_manager'].includes(role));
  const matchedRole =
    allowedRoles.length === 0
      ? user?.role
      : allowedRoles.includes(user?.role)
        ? user?.role
        : adminCanAccess
          ? 'admin'
        : allowedRoles.find((role) => workspaceRoles.includes(role));

  useEffect(() => {
    if (matchedRole && matchedRole !== user?.role) {
      setActiveRole(matchedRole);
    }
  }, [matchedRole, setActiveRole, user?.role]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !permissions?.canManageSystem) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length && !matchedRole) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length && matchedRole !== user?.role) {
    return null;
  }

  return children;
}
