import React, { useMemo } from "react";
import BaseDashboard from "../dashboard/BaseDashboard";
import { useDashboard } from "../../state/dashboard/DashboardContext";
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { currentSchool } = useTenant();
  const { user } = useAuth();
  const { widgets } = useDashboard();
  const layout = useMemo(
    () => widgets.map((w, i) => ({ i: w.key, x: (i % 3) * 4, y: Math.floor(i/3) * 6, w: w.w, h: w.h, minW: 3, minH: 4, label: '' })),
    [widgets]
  );

  const tiles = useMemo(() => ([
    { title: 'Admin Quick Links' },
    { title: 'Registration Links' },
    { title: 'Quick Help' }
  ]), []);

  const recommendations = useMemo(() => ([
    { label: 'Enable SSO' },
    { label: 'Configure Backup' },
    { label: 'Review DPA' },
    { label: 'Run Access Review' }
  ]), []);

  const renderWidget = (key) => {
    const found = widgets.find(w => w.key === key);
    if (!found) return null;
    const C = found.component;
    return <C />;
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border bg-white space-y-3">
        <div className="text-sm text-gray-600">Scoped to: {currentSchool?.name || ((user?.roles||[]).includes('super_admin') ? 'No school selected' : 'Your school')}</div>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 border rounded overflow-hidden bg-gray-50">
            {currentSchool?.logo_url ? (
              <img src={currentSchool.logo_url} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full grid place-items-center text-gray-400 text-xs">No Logo</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ background: currentSchool?.primary_color || '#2563eb' }} />
            <div className="w-6 h-6 rounded" style={{ background: currentSchool?.secondary_color || '#0ea5e9' }} />
          </div>
        </div>
        {(user?.roles||[]).includes('super_admin') && !currentSchool && (
          <div className="text-sm text-blue-600">Select a school from the topbar to manage branding.</div>
        )}
      </div>
      <BaseDashboard tiles={tiles} layout={layout} renderWidget={renderWidget} recommendations={recommendations} />
    </div>
  );
}
