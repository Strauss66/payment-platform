import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/apiClient';

const AuthContext = createContext(null);
export const ROLES = { SUPER_ADMIN: 'super_admin', ADMIN: 'admin', CASHIER: 'cashier', TEACHER: 'teacher', STUDENT_PARENT: 'student_parent' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    api.get('/api/auth/me').then(({ data }) => {
      setUser(data);
      try { localStorage.setItem('user.roles', JSON.stringify(data?.roles || [])); } catch {}
      // Always set tenant.schoolId to default for non-superadmin
      const isSuper = (data?.roles || []).includes('super_admin');
      if (!isSuper) {
        if (data?.defaultSchoolId) {
          localStorage.setItem('tenant.schoolId', String(data.defaultSchoolId));
        }
      } else {
        // Superadmin: if feature flag not set, default to defaultSchoolId when present
        const allowSwitch = String(process.env.REACT_APP_ALLOW_SCHOOL_SWITCH || 'false').toLowerCase() === 'true';
        if (!allowSwitch && data?.defaultSchoolId) {
          localStorage.setItem('tenant.schoolId', String(data.defaultSchoolId));
        }
      }
    }).catch(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('tenant.schoolId');
      localStorage.removeItem('user.roles');
    }).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    const me = await api.get('/api/auth/me');
    setUser(me.data);
    try { localStorage.setItem('user.roles', JSON.stringify(me.data?.roles || [])); } catch {}
    // Lock tenant.schoolId for non-superadmin
    const isSuper = (me.data?.roles || []).includes('super_admin');
    if (!isSuper && me.data?.defaultSchoolId) {
      localStorage.setItem('tenant.schoolId', String(me.data.defaultSchoolId));
    } else {
      const allowSwitch = String(process.env.REACT_APP_ALLOW_SCHOOL_SWITCH || 'false').toLowerCase() === 'true';
      if (!allowSwitch && me.data?.defaultSchoolId) {
        localStorage.setItem('tenant.schoolId', String(me.data.defaultSchoolId));
      }
    }
    return me.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tenant.schoolId');
    localStorage.removeItem('user.roles');
    setUser(null);
    window.location.href = '/auth/login';
  };

  const hasRole = (role) => !!user?.roles?.includes(role);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);