import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/authContext';

export const RequireAuth = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export const RequireRole = ({ allowed }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  const ok = allowed.some((role) => user?.roles?.includes(role));
  if (!ok) return <Navigate to="/" replace />;
  return <Outlet />;
};

export const RequirePermission = ({ permissions = [], fallback = null }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  const userPerms = user?.permissions || [];
  const hasAll = permissions.every((p) => userPerms.includes(p));
  if (!hasAll) return fallback ? fallback : <Navigate to="/" replace />;
  return <Outlet />;
};
