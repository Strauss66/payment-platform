import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/apiClient';

const AuthContext = createContext(null);
export const ROLES = { ADMIN: 'admin', CASHIER: 'cashier', TEACHER: 'teacher', STUDENT_PARENT: 'student_parent' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    api.get('/api/auth/me').then(({ data }) => setUser(data)).catch(() => {
      localStorage.removeItem('token');
    }).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    const me = await api.get('/api/auth/me');
    setUser(me.data);
    return me.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
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