import React, { useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';

export default function BrandingProvider({ children }) {
  const { currentSchool } = useTenant();

  useEffect(() => {
    const root = document.documentElement;
    const primary = currentSchool?.primary_color || '#2563eb';
    const secondary = currentSchool?.secondary_color || '#0ea5e9';
    root.style.setProperty('--brand-primary', primary);
    root.style.setProperty('--brand-secondary', secondary);

    // Optional favicon update
    if (currentSchool?.logo_url) {
      let link = document.querySelector("link[rel='icon']");
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'icon');
        document.head.appendChild(link);
      }
      link.setAttribute('href', currentSchool.logo_url);
    }
  }, [currentSchool]);

  return <>{children}</>;
}

export function useBranding() {
  const { currentSchool } = useTenant();
  return {
    colors: { primary: currentSchool?.primary_color, secondary: currentSchool?.secondary_color },
    logoUrl: currentSchool?.logo_url,
    name: currentSchool?.name
  };
}


