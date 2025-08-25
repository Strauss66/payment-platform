import React, { useEffect, useState } from 'react';
import { api } from '../lib/apiClient';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

export default function TopbarSchoolSwitcher() {
  const { user } = useAuth() as any;
  const { currentSchoolId, setSchool } = useTenant() as any;
  const [schools, setSchools] = useState([]);

  const isSuper = (user?.roles || []).includes(ROLES.SUPER_ADMIN);
  useEffect(() => {
    if (!isSuper) return;
    api.get('/api/tenancy/schools?is_active=true&limit=100').then(({ data }) => {
      setSchools(data.rows || []);
    });
  }, [isSuper]);

  if (!isSuper) return null;

  return (
    <select value={currentSchoolId || ''} onChange={(e) => setSchool(Number(e.target.value))}>
      <option value="">Select a school…</option>
      {schools.map((s: any) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  );
}


