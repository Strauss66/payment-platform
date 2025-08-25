import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../lib/apiClient';
import { useAuth, ROLES } from './AuthContext';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const { user, logout } = useAuth();
  const [currentSchoolId, setCurrentSchoolId] = useState(null);
  const [currentSchool, setCurrentSchool] = useState(null);
  const [needsSelection, setNeedsSelection] = useState(false);
  const [brandingNotConfigured, setBrandingNotConfigured] = useState(false);
  const [loadingBranding, setLoadingBranding] = useState(false);
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!user) { setCurrentSchoolId(null); setCurrentSchool(null); return; }
    const roles = user.roles || [];
    const isSuper = roles.includes(ROLES.SUPER_ADMIN);
    if (!isSuper) {
      setCurrentSchoolId(user.school_id);
    } else {
      const saved = localStorage.getItem('tenant.schoolId');
      setCurrentSchoolId(saved ? Number(saved) : null);
    }
  }, [user]);

  useEffect(() => {
    // Abort any in-flight request when dependencies change
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    async function loadBranding() {
      if (!user) {
        setCurrentSchool(null);
        setNeedsSelection(false);
        setBrandingNotConfigured(false);
        setLoadingBranding(false);
        return;
      }

      setLoadingBranding(true);
      setBrandingNotConfigured(false);
      setNeedsSelection(false);

      const isSuper = (user.roles || []).includes(ROLES.SUPER_ADMIN);
      try {
        if (isSuper) {
          // Superadmin: require an explicit selection
          if (!currentSchoolId) {
            setCurrentSchool(null);
            setNeedsSelection(true);
            setLoadingBranding(false);
            return;
          }
          const { data } = await api.get(`/api/tenancy/schools/${currentSchoolId}`, { signal: controller.signal });
          setCurrentSchool(data);
          setNeedsSelection(false);
        } else {
          // Non-superadmin: get my school
          const { data } = await api.get('/api/tenancy/me/school', { signal: controller.signal });
          setCurrentSchool(data);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        const status = err?.response?.status;

        if (status === 404) {
          if (isSuper) {
            // Selected school was deleted or invalid. Clear and ask to select again
            localStorage.removeItem('tenant.schoolId');
            setCurrentSchoolId(null);
            setCurrentSchool(null);
            setNeedsSelection(true);
          } else {
            console.error('Branding 404: user.school_id not wired to a school');
            setCurrentSchool(null);
            setBrandingNotConfigured(true);
          }
        } else if (status === 401 || status === 403) {
          // Session/role problem; force re-login
          logout();
          return;
        } else {
          console.error('Branding load error', err);
          setCurrentSchool(null);
        }
      } finally {
        if (!controller.signal.aborted) setLoadingBranding(false);
      }
    }

    loadBranding();

    return () => {
      controller.abort();
    };
  }, [user, currentSchoolId, logout]);

  async function setSchool(id) {
    localStorage.setItem('tenant.schoolId', String(id));
    setCurrentSchoolId(id);
    // Refetch branding handled by effect
  }

  const value = { currentSchoolId, setSchool, currentSchool, needsSelection, brandingNotConfigured, loadingBranding };
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export const useTenant = () => useContext(TenantContext);


