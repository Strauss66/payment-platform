import React from 'react';
import { DashboardProvider } from './DashboardContext';
import { useAuth } from '../../contexts/AuthContext';

export default function RoleAwareDashboardProvider({ children, defaultRole = 'student_parent' }){
  const { user } = useAuth();
  const role = pickPrimaryRole(user, defaultRole);
  return <DashboardProvider role={role}>{children}</DashboardProvider>;
}

function pickPrimaryRole(user, fallback){
  const roles = user?.roles || [];
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('cashier')) return 'cashier';
  if (roles.includes('teacher')) return 'teacher';
  if (roles.includes('student_parent')) return 'student_parent';
  return fallback;
}


