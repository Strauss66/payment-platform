import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/apiClient';
import { useAuth } from './AuthContext';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const { user } = useAuth();
  const [currentSchoolId, setCurrentSchoolId] = useState(null);
  const [currentSchool, setCurrentSchool] = useState(null);

  useEffect(() => {
    if (!user) { setCurrentSchoolId(null); setCurrentSchool(null); return; }
    const roles = user.roles || [];
    const isSuper = roles.includes('super_admin');
    if (!isSuper) {
      setCurrentSchoolId(user.school_id);
    } else {
      const saved = localStorage.getItem('tenant.schoolId');
      setCurrentSchoolId(saved ? Number(saved) : null);
    }
  }, [user]);

  useEffect(() => {
    async function loadBranding() {
      if (!user) { setCurrentSchool(null); return; }
      const isSuper = (user.roles || []).includes('super_admin');
      if (!isSuper) {
        const { data } = await api.get('/api/tenancy/me/school');
        setCurrentSchool(data);
      } else if (currentSchoolId) {
        const { data } = await api.get(`/api/tenancy/schools/${currentSchoolId}`);
        setCurrentSchool(data);
      } else {
        setCurrentSchool(null);
      }
    }
    loadBranding();
  }, [user, currentSchoolId]);

  async function setSchool(id) {
    localStorage.setItem('tenant.schoolId', String(id));
    setCurrentSchoolId(id);
    // Refetch branding handled by effect
  }

  const value = { currentSchoolId, setSchool, currentSchool };
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export const useTenant = () => useContext(TenantContext);


